import { Prisma } from "~/db/generated/client";
import { db } from "../client";

export class FileRepository {
  async create(data: Prisma.FileCreateInput) {
    return db.file.create({ data });
  }

  async findById(id: string) {
    return db.file.findUnique({ where: { id } });
  }

  async findByKey(key: string) {
    return db.file.findUnique({ where: { key } });
  }

  async findByClientId(clientId: string) {
    return db.file.findMany({ where: { clientId } });
  }

  async update(id: string, data: Prisma.FileUpdateInput) {
    return db.file.update({ where: { id }, data });
  }

  async delete(id: string) {
    return db.file.delete({ where: { id } });
  }

  async findMany(args?: Prisma.FileFindManyArgs) {
    return db.file.findMany(args);
  }

  async findFirst(args?: Prisma.FileFindFirstArgs) {
    return db.file.findFirst(args);
  }

  async count(args?: Prisma.FileCountArgs) {
    return db.file.count(args);
  }
}

export const fileRepo = new FileRepository();
