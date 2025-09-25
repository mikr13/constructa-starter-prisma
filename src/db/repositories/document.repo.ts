import { DocumentChunk, Prisma } from "~/db/generated/client";
import { db } from "../client";

export class DocumentRepository {
  async create(data: Prisma.DocumentCreateInput) {
    return db.document.create({ data });
  }

  async findById(id: string) {
    return db.document.findUnique({ 
      where: { id },
      include: { file: true, user: true, documentChunks: true }
    });
  }

  async findByUserId(userId: string) {
    return db.document.findMany({ 
      where: { userId },
      include: { file: true }
    });
  }

  async update(id: string, data: Prisma.DocumentUpdateInput) {
    return db.document.update({ where: { id }, data });
  }

  async delete(id: string) {
    return db.document.delete({ where: { id } });
  }

  async findMany(args?: Prisma.DocumentFindManyArgs) {
    return db.document.findMany(args);
  }

  async findFirst(args?: Prisma.DocumentFindFirstArgs) {
    return db.document.findFirst(args);
  }

  async count(args?: Prisma.DocumentCountArgs) {
    return db.document.count(args);
  }
}

export class DocumentChunkRepository {
  async create(data: Prisma.DocumentChunkCreateInput) {
    return db.documentChunk.create({ data });
  }

  async findById(id: string) {
    return db.documentChunk.findUnique({ 
      where: { id },
      include: { file: true }
    });
  }

  async findByFileId(fileId: string) {
    return db.documentChunk.findMany({ 
      where: { fileId },
      orderBy: { chunkIndex: 'asc' }
    });
  }

  async update(id: string, data: Prisma.DocumentChunkUpdateInput) {
    return db.documentChunk.update({ where: { id }, data });
  }

  async delete(id: string) {
    return db.documentChunk.delete({ where: { id } });
  }

  async findMany(args?: Prisma.DocumentChunkFindManyArgs) {
    return db.documentChunk.findMany(args);
  }

  async findFirst(args?: Prisma.DocumentChunkFindFirstArgs) {
    return db.documentChunk.findFirst(args);
  }

  async count(args?: Prisma.DocumentChunkCountArgs) {
    return db.documentChunk.count(args);
  }

  // Vector similarity search using raw SQL
  async findSimilar(queryVector: number[], limit: number = 5, threshold: number = 0.5) {
    return db.$queryRaw<Array<DocumentChunk & { distance: number }>>`
      SELECT *, embedding <-> ${JSON.stringify(queryVector)}::vector as distance
      FROM document_chunks
      WHERE embedding <-> ${JSON.stringify(queryVector)}::vector < ${threshold}
      ORDER BY embedding <-> ${JSON.stringify(queryVector)}::vector
      LIMIT ${limit}
    `;
  }
}

export const documentRepo = new DocumentRepository();
export const documentChunkRepo = new DocumentChunkRepository();

export default documentRepo;
