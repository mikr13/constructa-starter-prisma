import { Repository } from "drizzle-repository-generator";
import { db } from "../client";
import { user } from "../schema";

export const userRepo = Repository(db, user);
export default userRepo;