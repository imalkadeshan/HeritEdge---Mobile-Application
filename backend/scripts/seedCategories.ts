/**
 * Idempotent seed for the six default content categories (HE-36).
 *
 * Usage (from backend/):
 *   npm run categories:seed
 *
 * Behaviour:
 *   - Inserts only the default categories that do not exist yet, so running
 *     it twice (or a hundred times) never duplicates anything.
 *   - Never overwrites an existing label or the active flag of a category an
 *     admin has already edited or deactivated.
 *   - The seeded keys are exactly the values already stored on existing
 *     cultural items, so nothing in the database becomes invalid.
 *
 * The same function also runs on server start-up, so this script is the
 * manual equivalent for a database that was never booted against.
 */
import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import {
  DEFAULT_CATEGORIES,
  seedDefaultCategories,
} from "../src/services/category.service";

async function main(): Promise<number> {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    // Only variable NAMES are ever printed, never their values.
    console.error(
      "[category-seed] ERROR: Missing required environment variable(s): MONGODB_URI"
    );
    return 1;
  }

  await mongoose.connect(uri);
  console.log("[category-seed] Connected to MongoDB.");

  try {
    const created = await seedDefaultCategories();

    if (created === 0) {
      console.log(
        `[category-seed] All ${DEFAULT_CATEGORIES.length} default categories already exist. No changes made.`
      );
    } else {
      console.log(
        `[category-seed] Created ${created} of ${DEFAULT_CATEGORIES.length} default categories: ${DEFAULT_CATEGORIES.map(
          (category) => category.key
        ).join(", ")}`
      );
    }

    return 0;
  } finally {
    await mongoose.disconnect();
    console.log("[category-seed] Disconnected from MongoDB.");
  }
}

// NOTE: set process.exitCode and let the process end on its own so pending
// stdout/stderr writes are never truncated (see scripts/createAdmin.ts).
main()
  .then((exitCode) => {
    process.exitCode = exitCode;
  })
  .catch((error) => {
    console.error(
      "[category-seed] ERROR: Failed to seed categories.",
      error instanceof Error ? error.message : error
    );
    process.exitCode = 1;
  });
