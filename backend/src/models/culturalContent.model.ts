import mongoose, { Schema, Document } from "mongoose";

export type ContentCategory =
  | "Story"
  | "Proverb"
  | "Recipe"
  | "Tradition"
  | "Song"
  | "Dialect Word";

export interface ICulturalContent {
  title: string;
  content: string;
  category: ContentCategory;
  imageUrl: string | null;
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
      type: String,
      required: [true, "Category is required"],
      enum: {
        values: [
          "Story",
          "Proverb",
          "Recipe",
          "Tradition",
          "Song",
          "Dialect Word",
        ],
        message:
          "Category must be one of: Story, Proverb, Recipe, Tradition, Song, Dialect Word",
      },
    },
    imageUrl: {
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
