import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { authSchema, db } from "./index";

// Seed user email constant used for identifying test data
const TEST_USER_EMAIL = "test@example.com";

/**
 * Inserts a deterministic set of test records into the database.
 *
 * - Creates a single user with a well-known email so it can be removed later.
 */
export async function createTestData(): Promise<void> {
	// Make sure we don't create duplicates if the script is run twice
	const existing = await db
		.select()
		.from(authSchema.user)
		.where(eq(authSchema.user.email, TEST_USER_EMAIL))
		.limit(1);

	if (existing.length > 0) return;

	await db.insert(authSchema.user).values({
		id: randomUUID(),
		name: "Test User",
		email: TEST_USER_EMAIL,
		emailVerified: false,
		image: null,
		createdAt: new Date(),
		updatedAt: new Date(),
	});
}

/**
 * Removes all test records that were inserted by `createTestData`.
 */
export async function deleteTestData(): Promise<void> {
	await db
		.delete(authSchema.user)
		.where(eq(authSchema.user.email, TEST_USER_EMAIL));
}
