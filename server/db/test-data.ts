import { inArray } from "drizzle-orm"
import { db } from "./index"
import { user } from "./auth.schema"



/**
 * Small, disposable test dataset
 */
const demoUsers: typeof user.$inferSelect[] = [
    {
        id: "test-user-1",
        name: "Alice Test",
        email: "alice@example.com",
        emailVerified: false,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: "test-user-2",
        name: "Bob Test",
        email: "bob@example.com",
        emailVerified: false,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: "test-user-3",
        name: "Charlie Test",
        email: "charlie@example.com",
        emailVerified: false,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date()
    }
] as const

export async function createTestData() {
    await db.insert(user).values(demoUsers)
}

export async function deleteTestData() {
    await db.delete(user).where(inArray(user.id, demoUsers.map((u) => u.id)))
}