import { Router, Response } from "express";
import User from "../models/user.model";
import { authenticate, AuthRequest } from "../middleware/auth.middleware";

const router = Router();

// GET /api/users/me — get current user
router.get("/me", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    res.json({
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        bio: user.bio,
        language: user.language,
        community: user.community,
        culturalInterests: user.culturalInterests,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
});

// PUT /api/users/me — update current user profile
router.put("/me", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { name, bio, language, community, profileImage, culturalInterests } = req.body;

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    if (language !== undefined) updateData.language = language;
    if (community !== undefined) updateData.community = community;
    if (profileImage !== undefined) updateData.profileImage = profileImage;
    if (culturalInterests !== undefined) updateData.culturalInterests = culturalInterests;

    const user = await User.findByIdAndUpdate(req.userId, updateData, { new: true });
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    res.json({
      success: true,
      message: "Profile updated",
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        bio: user.bio,
        language: user.language,
        community: user.community,
        culturalInterests: user.culturalInterests,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
});

// PUT /api/users/:id — update user by ID (used during registration flow before JWT)
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { role, name, bio, language, community, culturalInterests } = req.body;

    const updateData: Record<string, unknown> = {};
    if (role !== undefined) updateData.role = role;
    if (name !== undefined) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    if (language !== undefined) updateData.language = language;
    if (community !== undefined) updateData.community = community;
    if (culturalInterests !== undefined) updateData.culturalInterests = culturalInterests;

    const user = await User.findByIdAndUpdate(id, updateData, { new: true });
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    res.json({
      success: true,
      message: "Profile updated",
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        bio: user.bio,
        language: user.language,
        community: user.community,
        culturalInterests: user.culturalInterests,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
});

export default router;
