import mongoose, { Schema, Document } from "mongoose";

export interface ICulturalContent {
  title: string;
  content: string;
  // Immutable key of a ContentCategory document (e.g. "Story"). The display
  // label lives on the category and may change without touching this value.
  category: string;
  imageUrl: string | null;
  // Server-relative path of the attached recording (e.g.
  // "/uploads/audio/ab12.m4a"), or null. Only the ownership-checked audio
  // endpoint may write it (HE-26).
  audioUrl: string | null;
  createdBy: mongoose.Types.ObjectId;
}

export interface ICulturalContentDocument extends ICulturalContent, Document {
  createdAt: Date;
  updatedAt: Date;
}

const culturalContentSchema = new Schema<ICulturalContentDocument>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title must be at most 200 characters"],
    },
    content: {
      type: String,
      required: [true, "Content is required"],
      trim: true,
    },
    category: {
      // Stored value is the immutable ContentCategory key. Whether that key
      // is currently active is checked in content.service against the
      // categories collection, so no hard-coded enum is kept here.
      type: String,
      required: [true, "Category is required"],
      trim: true,
      maxlength: [60, "Category must be at most 60 characters"],
    },
    imageUrl: {
      type: String,
      default: null,
    },
    audioUrl: {
      type: String,
      default: null,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Created by is required"],
    },
  },
  {
    timestamps: true,
  }
);

const CulturalContent = mongoose.model<ICulturalContentDocument>(
  "CulturalContent",
  culturalContentSchema
);

export default CulturalContent;
