import mongoose, { Schema, Document } from "mongoose";

/**
 * A content category is the single authoritative definition used by every
 * cultural item. `key` is the immutable value stored on CulturalContent and
 * never changes; `label` is what people see and may be edited freely.
 */
export interface IContentCategory {
  key: string;
  label: string;
  active: boolean;
}

export interface IContentCategoryDocument extends IContentCategory, Document {
  createdAt: Date;
  updatedAt: Date;
}

const contentCategorySchema = new Schema<IContentCategoryDocument>(
  {
    key: {
      type: String,
      required: [true, "Category key is required"],
      trim: true,
      maxlength: [60, "Category key must be at most 60 characters"],
      unique: true,
      immutable: true,
    },
    label: {
      type: String,
      required: [true, "Category label is required"],
      trim: true,
      maxlength: [60, "Category label must be at most 60 characters"],
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const ContentCategoryModel = mongoose.model<IContentCategoryDocument>(
  "ContentCategory",
  contentCategorySchema
);

export default ContentCategoryModel;
