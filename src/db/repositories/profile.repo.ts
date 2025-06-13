import { Repository } from "drizzle-repository-generator";
import { db } from "../client";
import { profile, user } from "../schema";

export const profileRepo = Repository(db, profile, {
  user,
});
export default profileRepo;