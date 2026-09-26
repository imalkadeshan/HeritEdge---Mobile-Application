import mongoose, { Schema, Document } from "mongoose";

export type ContributionType = "translation" | "explanation" | "transcription" | "context";
export type ContributionStatus = "pending_review" | "changes_requested" | "approved";

export interface IContribution {
  collaborationRequestId: mongoose.Types.ObjectId;
  contentId: mongoose.Types.ObjectId;
  submittedBy: mongoose.Types.ObjectId;
  type: ContributionType;
  text: string;
  language: string;
  status: ContributionStatus;
  feedback: string;
}

export interface IContributionDocument extends IContribution, Document {
  createdAt: Date;
  updatedAt: Date;
}

const contributionSchema = new Schema<IContributionDocument>(
  {
    collaborationRequestId: {
      type: Schema.Types.ObjectId,
      ref: "CollaborationRequest",
      required: [true, "Collaboration request ID is required"],
    },
    contentId: {
      type: Schema.Types.ObjectId,
      ref: "CulturalContent",
      required: [true, "Content ID is required"],
    },
    submittedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Submitted by is required"],
    },
    type: {
      type: String,
      required: [true, "Contribution type is required"],
      enum: {
        values: ["translation", "explanation", "transcription", "context"],
        message: "Type must be one of: translation, explanation, transcription, context",
      },
    },
    text: {
      type: String,
      required: [true, "Text is required"],
      trim: true,
    },
    language: {
      type: String,
      default: "",
      trim: true,
    },
    status: {
      type: String,
      default: "pending_review",
      enum: {
        values: ["pending_review", "changes_requested", "approved"],
        message: "Status must be one of: pending_review, changes_requested, approved",
      },
    },
    feedback: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Contribution = mongoose.model<IContributionDocument>(
  "Contribution",
  contributionSchema
);

export default Contribution;
