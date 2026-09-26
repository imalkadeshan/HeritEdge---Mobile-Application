import User from "../models/user.model";

const MAX_FILTER_LENGTH = 100;

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

interface ElderProfile {
  id: string;
  name: string;
  bio: string;
  language: string;
  community: string;
  culturalInterests: string[];
  profileImage: string | null;
}

interface DiscoverEldersResult {
  success: boolean;
  message: string;
  elders?: ElderProfile[];
}

export async function discoverElders(
  interest?: string,
  language?: string
): Promise<DiscoverEldersResult> {
  try {
    const query: Record<string, unknown> = { role: "elder" };

    if (interest?.trim()) {
      const term = interest.trim().slice(0, MAX_FILTER_LENGTH);
      query.culturalInterests = {
        $in: [new RegExp(escapeRegex(term), "i")],
      };
    }

    if (language?.trim()) {
      const term = language.trim().slice(0, MAX_FILTER_LENGTH);
      query.language = new RegExp(escapeRegex(term), "i");
    }

    const users = await User.find(query)
      .select("name bio language community culturalInterests profileImage")
      .sort({ name: 1 })
      .lean();

    const elders: ElderProfile[] = users.map((u) => ({
      id: u._id.toString(),
      name: u.name,
      bio: u.bio,
      language: u.language,
      community: u.community,
      culturalInterests: u.culturalInterests,
      profileImage: u.profileImage,
    }));

    return {
      success: true,
      message: "Elders fetched successfully",
      elders,
    };
  } catch (error) {
    console.error("Discover elders error:", error);
    return {
      success: false,
      message: "Failed to fetch elders. Please try again.",
    };
  }
}

interface GetElderByIdResult {
  success: boolean;
  message: string;
  elder?: ElderProfile;
}

export async function getElderById(
  elderId: string
): Promise<GetElderByIdResult> {
  try {
    const user = await User.findOne({ _id: elderId, role: "elder" })
      .select("name bio language community culturalInterests profileImage")
      .lean();

    if (!user) {
      return { success: false, message: "Elder not found" };
    }

    const elder: ElderProfile = {
      id: user._id.toString(),
      name: user.name,
      bio: user.bio,
      language: user.language,
      community: user.community,
      culturalInterests: user.culturalInterests,
      profileImage: user.profileImage,
    };

    return {
      success: true,
      message: "Elder fetched successfully",
      elder,
    };
  } catch (error) {
    console.error("Get elder by id error:", error);
    return {
      success: false,
      message: "Failed to fetch elder. Please try again.",
    };
  }
}
