import { Repository } from "drizzle-repository-generator";
import { db } from "../client";
import { documentChunks, documents } from "../schema";

export const documentRepo = Repository(db, documents);
export const documentChunkRepo = Repository(db, documentChunks);

export default documentRepo;