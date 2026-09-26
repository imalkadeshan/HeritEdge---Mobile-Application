import CollaborationRequest, {
  ICollaborationRequestDocument,
} from "../models/collaborationRequest.model";
import CulturalContent from "../models/culturalContent.model";
import Notification from "../models/notification.model";

interface RequestData {
  contentId: string;
  fromUser: string;
  message: string;
}

interface RequestResult {
  success: boolean;
  message: string;
  request?: ICollaborationRequestDocument;
}

export async function sendCollaborationRequest(
  data: RequestData
): Promise<RequestResult> {
  const { contentId, fromUser, message } = data;

  if (!message?.trim()) {
    return { success: false, message: "Message is required" };
  }

  if (message.trim().length > 500) {
    return {
      success: false,
      message: "Message must be at most 500 characters",
    };
  }

  try {
    const content = await CulturalContent.findById(contentId);
    if (!content) {
      return { success: false, message: "Content not found" };
    }

    const toElder = content.createdBy.toString();
    if (toElder === fromUser) {
      return {
        success: false,
        message: "You cannot send a collaboration request to yourself",
      };
    }

    const existing = await CollaborationRequest.findOne({
      contentId,
      fromUser,
      status: { $in: ["pending", "accepted"] },
    });

    if (existing) {
      return {
        success: false,
        message: "You already have a pending or accepted request for this content",
      };
    }

    const request = await CollaborationRequest.create({
      contentId,
      fromUser,
      toElder,
      message: message.trim(),
    });

    await Notification.create({
      userId: toElder,
      type: "collaboration_request_received",
      message: `A youth has sent you a collaboration request for "${content.title}"`,
      relatedId: request._id,
      relatedModel: "CollaborationRequest",
    });

    return {
      success: true,
      message: "Collaboration request sent successfully",
      request,
    };
  } catch (error) {
    console.error("Send collaboration request error:", error);
    return {
      success: false,
      message: "Failed to send collaboration request. Please try again.",
    };
  }
}

interface ListResult {
  success: boolean;
  message: string;
  requests?: ICollaborationRequestDocument[];
}

export async function getOutgoingRequests(
  userId: string
): Promise<ListResult> {
  try {
    const requests = await CollaborationRequest.find({ fromUser: userId })
      .populate("contentId", "title category")
      .populate("toElder", "name")
      .sort({ createdAt: -1 });

    return {
      success: true,
      message: "Outgoing requests fetched successfully",
      requests,
    };
  } catch (error) {
    console.error("Get outgoing requests error:", error);
    return {
      success: false,
      message: "Failed to fetch requests. Please try again.",
    };
  }
}

export async function getIncomingRequests(
  userId: string
): Promise<ListResult> {
  try {
    const requests = await CollaborationRequest.find({ toElder: userId })
      .populate("contentId", "title category")
      .populate("fromUser", "name")
      .sort({ createdAt: -1 });

    return {
      success: true,
      message: "Incoming requests fetched successfully",
      requests,
    };
  } catch (error) {
    console.error("Get incoming requests error:", error);
    return {
      success: false,
      message: "Failed to fetch requests. Please try again.",
    };
  }
}

interface DecisionResult {
  success: boolean;
  message: string;
  request?: ICollaborationRequestDocument;
}

export async function decideOnRequest(
  requestId: string,
  userId: string,
  decision: "accepted" | "rejected"
): Promise<DecisionResult> {
  try {
    const request = await CollaborationRequest.findById(requestId);
    if (!request) {
      return { success: false, message: "Request not found" };
    }

    if (request.toElder.toString() !== userId) {
      return {
        success: false,
        message: "Not authorized to act on this request",
      };
    }

    if (request.status !== "pending") {
      return {
        success: false,
        message: `Cannot ${decision} a request that is already ${request.status}`,
      };
    }

    request.status = decision;
    await request.save();

    await Notification.create({
      userId: request.fromUser,
      type:
        decision === "accepted"
          ? "collaboration_accepted"
          : "collaboration_rejected",
      message:
        decision === "accepted"
          ? "Your collaboration request has been accepted"
          : "Your collaboration request has been rejected",
      relatedId: request._id,
      relatedModel: "CollaborationRequest",
    });

    return {
      success: true,
      message: `Request ${decision} successfully`,
      request,
    };
  } catch (error) {
    console.error("Decide on request error:", error);
    return {
      success: false,
      message: "Failed to process decision. Please try again.",
    };
  }
}

interface WorkspaceResult {
  success: boolean;
  message: string;
  request?: ICollaborationRequestDocument;
}

export async function getAcceptedCollaboration(
  requestId: string,
  userId: string
): Promise<WorkspaceResult> {
  try {
    const request = await CollaborationRequest.findById(requestId)
      .populate("contentId")
      .populate("fromUser", "name")
      .populate("toElder", "name");

    if (!request) {
      return { success: false, message: "Collaboration not found" };
    }

    if (request.status !== "accepted") {
      return {
        success: false,
        message: "This collaboration has not been accepted yet",
      };
    }

    const isParticipant =
      request.fromUser._id.toString() === userId ||
      request.toElder._id.toString() === userId;

    if (!isParticipant) {
      return {
        success: false,
        message: "Not authorized to view this collaboration",
      };
    }

    return {
      success: true,
      message: "Collaboration fetched successfully",
      request,
    };
  } catch (error) {
    console.error("Get accepted collaboration error:", error);
    return {
      success: false,
      message: "Failed to fetch collaboration. Please try again.",
    };
  }
}
