import mongoose, { Schema, Document } from "mongoose";

export interface IUser {
  name: string;
  email: string;
  passwordHash: string;
  role: "elder" | "youth" | null;
  bio: string;
  language: string;
  community: string;
  culturalInterests: string[];
  profileImage: string | null;
}

export interface IUserDocument extends IUser, Document {
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUserDocument>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name must be at most 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },
    passwordHash: {
      type: String,
      required: [true, "Password is required"],
      select: false,
    },
    role: {
      type: String,
      required: false,
      default: null,
      enum: {
        values: ["elder", "youth", null],
        message: "Role must be either elder or youth",
      },
    },
    bio: {
      type: String,
      default: "",
      trim: true,
      maxlength: [500, "Bio must be at most 500 characters"],
    },
    language: {
      type: String,
      default: "",
      trim: true,
    },
    community: {
      type: String,
      default: "",
      trim: true,
    },
    culturalInterests: {
      type: [String],
      default: [],
    },
    profileImage: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model<IUserDocument>("User", userSchema);

export default User;
