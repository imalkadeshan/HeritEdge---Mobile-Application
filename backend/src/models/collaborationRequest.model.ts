import mongoose, { Schema, Document } from "mongoose";

export type CollaborationRequestStatus = "pending" | "accepted" | "rejected";

export interface ICollaborationRequest {
  contentId: mongoose.Types.ObjectId;
  fromUser: mongoose.Types.ObjectId;
  toElder: mongoose.Types.ObjectId;
  message: string;
  status: CollaborationRequestStatus;
}

export interface ICollaborationRequestDocument extends ICollaborationRequest, Document {
  createdAt: Date;
  updatedAt: Date;
}

const collaborationRequestSchema = new Schema<ICollaborationRequestDocument>(
  {
    contentId: {
      type: Schema.Types.ObjectId,
      ref: "CulturalContent",
      required: [true, "Content ID is required"],
    },
    fromUser: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "From user is required"],
    },
    toElder: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "To elder is required"],
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
      maxlength: [500, "Message must be at most 500 characters"],
    },
    status: {
      type: String,
      default: "pending",
      enum: {
        values: ["pending", "accepted", "rejected"],
        message: "Status must be one of: pending, accepted, rejected",
      },
    },
  },
  {
    timestamps: true,
  }
);

collaborationRequestSchema.index(
  { contentId: 1, fromUser: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: { $in: ["pending", "accepted"] } } }
);

const CollaborationRequest = mongoose.model<ICollaborationRequestDocument>(
  "CollaborationRequest",
  collaborationRequestSchema
);

export default CollaborationRequest;
