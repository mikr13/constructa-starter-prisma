import { Repository } from "drizzle-repository-generator";
import { db } from "../client";
import { files } from "../schema";

export const fileRepo = Repository(db, files);