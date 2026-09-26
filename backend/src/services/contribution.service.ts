import Contribution, {
  IContributionDocument,
  ContributionType,
  ContributionStatus,
} from "../models/contribution.model";
import CollaborationRequest from "../models/collaborationRequest.model";
import CulturalContent from "../models/culturalContent.model";
import Notification from "../models/notification.model";

const VALID_TYPES: ContributionType[] = [
  "translation",
  "explanation",
  "transcription",
  "context",
];

const VALID_TRANSITIONS: Record<ContributionStatus, ContributionStatus[]> = {
  pending_review: ["changes_requested", "approved"],
  changes_requested: ["pending_review"],
  approved: [],
};

interface CreateContributionData {
  collaborationRequestId: string;
  contentId: string;
  submittedBy: string;
  type: ContributionType;
  text: string;
  language?: string;
}

interface CreateResult {
  success: boolean;
  message: string;
  contribution?: IContributionDocument;
}

export async function createContribution(
  data: CreateContributionData
): Promise<CreateResult> {
  const { collaborationRequestId, contentId, submittedBy, type, text, language } = data;

  if (!text?.trim()) {
    return { success: false, message: "Text is required" };
  }

  if (!type || !VALID_TYPES.includes(type)) {
    return {
      success: false,
      message: `Invalid type. Must be one of: ${VALID_TYPES.join(", ")}`,
    };
  }

  try {
    const collabRequest = await CollaborationRequest.findById(
      collaborationRequestId
    );
    if (!collabRequest) {
      return { success: false, message: "Collaboration request not found" };
    }

    if (collabRequest.status !== "accepted") {
      return {
        success: false,
        message: "Collaboration has not been accepted yet",
      };
    }

    if (collabRequest.fromUser.toString() !== submittedBy) {
      return {
        success: false,
        message: "Only the collaborating youth can create contributions",
      };
    }

    if (collabRequest.contentId.toString() !== contentId) {
      return {
        success: false,
        message: "Content does not match the collaboration request",
      };
    }

    const content = await CulturalContent.findById(contentId);
    if (!content) {
      return { success: false, message: "Content not found" };
    }

    const contribution = await Contribution.create({
      collaborationRequestId,
      contentId,
      submittedBy,
      type,
      text: text.trim(),
      language: language?.trim() || "",
      status: "pending_review",
    });

    await Notification.create({
      userId: content.createdBy,
      type: "contribution_submitted",
      message: `A new ${type} has been submitted for your content "${content.title}"`,
      relatedId: contribution._id,
      relatedModel: "Contribution",
    });

    return {
      success: true,
      message: "Contribution submitted successfully",
      contribution,
    };
  } catch (error) {
    console.error("Create contribution error:", error);
    return {
      success: false,
      message: "Failed to submit contribution. Please try again.",
    };
  }
}

interface UpdateResult {
  success: boolean;
  message: string;
  contribution?: IContributionDocument;
}

export async function updateContribution(
  contributionId: string,
  userId: string,
  data: { text?: string; language?: string }
): Promise<UpdateResult> {
  try {
    const contribution = await Contribution.findById(contributionId);
    if (!contribution) {
      return { success: false, message: "Contribution not found" };
    }

    if (contribution.submittedBy.toString() !== userId) {
      return {
        success: false,
        message: "Not authorized to edit this contribution",
      };
    }

    if (
      contribution.status !== "changes_requested" &&
      contribution.status !== "pending_review"
    ) {
      return {
        success: false,
        message: "Cannot edit an approved contribution",
      };
    }

    if (data.text !== undefined) {
      if (!data.text.trim()) {
        return { success: false, message: "Text is required" };
      }
      contribution.text = data.text.trim();
    }

    if (data.language !== undefined) {
      contribution.language = data.language.trim();
    }

    if (contribution.status === "changes_requested") {
      contribution.status = "pending_review";
      contribution.feedback = "";

      const collabRequest = await CollaborationRequest.findById(
        contribution.collaborationRequestId
      );
      if (collabRequest) {
        const content = await CulturalContent.findById(
          contribution.contentId
        );
        await Notification.create({
          userId: collabRequest.toElder,
          type: "contribution_submitted",
          message: `A revised ${contribution.type} has been submitted for "${content?.title || "your content"}"`,
          relatedId: contribution._id,
          relatedModel: "Contribution",
        });
      }
    }

    await contribution.save();

    return {
      success: true,
      message: "Contribution updated successfully",
      contribution,
    };
  } catch (error) {
    console.error("Update contribution error:", error);
    return {
      success: false,
      message: "Failed to update contribution. Please try again.",
    };
  }
}

interface ReviewResult {
  success: boolean;
  message: string;
  contribution?: IContributionDocument;
}

export async function reviewContribution(
  contributionId: string,
  userId: string,
  decision: "approved" | "changes_requested",
  feedback?: string
): Promise<ReviewResult> {
  try {
    const contribution = await Contribution.findById(contributionId);
    if (!contribution) {
      return { success: false, message: "Contribution not found" };
    }

    const collabRequest = await CollaborationRequest.findById(
      contribution.collaborationRequestId
    );
    if (!collabRequest) {
      return { success: false, message: "Collaboration request not found" };
    }

    if (collabRequest.toElder.toString() !== userId) {
      return {
        success: false,
        message: "Only the elder can review contributions",
      };
    }

    const allowed = VALID_TRANSITIONS[contribution.status];
    if (!allowed || !allowed.includes(decision)) {
      return {
        success: false,
        message: `Cannot transition from ${contribution.status} to ${decision}`,
      };
    }

    if (decision === "changes_requested") {
      if (!feedback?.trim()) {
        return {
          success: false,
          message: "Feedback is required when requesting changes",
        };
      }
      contribution.feedback = feedback.trim();
    }

    contribution.status = decision;
    await contribution.save();

    const content = await CulturalContent.findById(contribution.contentId);
    const notificationType =
      decision === "approved"
        ? "contribution_approved"
        : "contribution_changes_requested";
    const notificationMessage =
      decision === "approved"
        ? `Your ${contribution.type} for "${content?.title || "a cultural item"}" has been approved`
        : `Your ${contribution.type} for "${content?.title || "a cultural item"}" needs changes`;

    await Notification.create({
      userId: contribution.submittedBy,
      type: notificationType,
      message: notificationMessage,
      relatedId: contribution._id,
      relatedModel: "Contribution",
    });

    return {
      success: true,
      message: `Contribution ${decision === "approved" ? "approved" : "returned for changes"} successfully`,
      contribution,
    };
  } catch (error) {
    console.error("Review contribution error:", error);
    return {
      success: false,
      message: "Failed to review contribution. Please try again.",
    };
  }
}

interface ListByCollabResult {
  success: boolean;
  message: string;
  contributions?: IContributionDocument[];
}

export async function getContributionsByCollaboration(
  collaborationRequestId: string,
  userId: string
): Promise<ListByCollabResult> {
  try {
    const collabRequest = await CollaborationRequest.findById(
      collaborationRequestId
    );
    if (!collabRequest) {
      return { success: false, message: "Collaboration request not found" };
    }

    const isParticipant =
      collabRequest.fromUser.toString() === userId ||
      collabRequest.toElder.toString() === userId;

    if (!isParticipant) {
      return {
        success: false,
        message: "Not authorized to view these contributions",
      };
    }

    const contributions = await Contribution.find({
      collaborationRequestId,
    }).sort({ createdAt: -1 });

    return {
      success: true,
      message: "Contributions fetched successfully",
      contributions,
    };
  } catch (error) {
    console.error("Get contributions by collaboration error:", error);
    return {
      success: false,
      message: "Failed to fetch contributions. Please try again.",
    };
  }
}

interface GetByIdResult {
  success: boolean;
  message: string;
  contribution?: IContributionDocument;
}

export async function getContributionById(
  contributionId: string,
  userId: string
): Promise<GetByIdResult> {
  try {
    const contribution = await Contribution.findById(contributionId);
    if (!contribution) {
      return { success: false, message: "Contribution not found" };
    }

    const collabRequest = await CollaborationRequest.findById(
      contribution.collaborationRequestId
    );
    if (!collabRequest) {
      return { success: false, message: "Collaboration request not found" };
    }

    const isParticipant =
      collabRequest.fromUser.toString() === userId ||
      collabRequest.toElder.toString() === userId;

    if (!isParticipant) {
      return {
        success: false,
        message: "Not authorized to view this contribution",
      };
    }

    return {
      success: true,
      message: "Contribution fetched successfully",
      contribution,
    };
  } catch (error) {
    console.error("Get contribution by ID error:", error);
    return {
      success: false,
      message: "Failed to fetch contribution. Please try again.",
    };
  }
}

interface ApprovedByContentResult {
  success: boolean;
  message: string;
  contributions?: IContributionDocument[];
}

export async function getApprovedContributionsByContent(
  contentId: string
): Promise<ApprovedByContentResult> {
  try {
    const contributions = await Contribution.find({
      contentId,
      status: "approved",
    })
      .populate("submittedBy", "name")
      .sort({ createdAt: -1 });

    return {
      success: true,
      message: "Approved contributions fetched successfully",
      contributions,
    };
  } catch (error) {
    console.error("Get approved contributions error:", error);
    return {
      success: false,
      message: "Failed to fetch approved contributions. Please try again.",
    };
  }
}
