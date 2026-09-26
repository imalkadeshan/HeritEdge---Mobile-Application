import mongoose, { Schema, Document } from "mongoose";

export type NotificationType =
  | "collaboration_request_received"
  | "collaboration_accepted"
  | "collaboration_rejected"
  | "contribution_submitted"
  | "contribution_approved"
  | "contribution_changes_requested";

export interface INotification {
  userId: mongoose.Types.ObjectId;
  type: NotificationType;
  message: string;
  relatedId: mongoose.Types.ObjectId;
  relatedModel: string;
  read: boolean;
}

export interface INotificationDocument extends INotification, Document {
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotificationDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    type: {
      type: String,
      required: [true, "Notification type is required"],
      enum: {
        values: [
          "collaboration_request_received",
          "collaboration_accepted",
          "collaboration_rejected",
          "contribution_submitted",
          "contribution_approved",
          "contribution_changes_requested",
        ],
        message: "Invalid notification type",
      },
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
    },
    relatedId: {
      type: Schema.Types.ObjectId,
      required: [true, "Related ID is required"],
      refPath: "relatedModel",
    },
    relatedModel: {
      type: String,
      required: [true, "Related model is required"],
      enum: {
        values: ["CollaborationRequest", "Contribution"],
        message: "Related model must be CollaborationRequest or Contribution",
      },
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ userId: 1, createdAt: -1 });

const Notification = mongoose.model<INotificationDocument>(
  "Notification",
  notificationSchema
);

export default Notification;
