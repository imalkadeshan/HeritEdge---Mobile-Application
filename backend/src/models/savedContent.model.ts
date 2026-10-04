import mongoose, { Schema, Document } from "mongoose";

/**
 * HE-33: one row per (user, content) pair - what a user has bookmarked.
 * The unique compound index is what makes "save twice" impossible at the
 * storage layer, so a duplicate save can never fan out into two rows even
 * under concurrent requests.
 */
export interface ISavedContent {
  userId: mongoose.Types.ObjectId;
  contentId: mongoose.Types.ObjectId;
}

export interface ISavedContentDocument extends ISavedContent, Document {
  createdAt: Date;
  updatedAt: Date;
}

const savedContentSchema = new Schema<ISavedContentDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    contentId: {
      type: Schema.Types.ObjectId,
      ref: "CulturalContent",
      required: [true, "Content ID is required"],
    },
  },
  {
    timestamps: true,
  }
);

savedContentSchema.index({ userId: 1, contentId: 1 }, { unique: true });

const SavedContent = mongoose.model<ISavedContentDocument>(
  "SavedContent",
  savedContentSchema
);

export default SavedContent;
