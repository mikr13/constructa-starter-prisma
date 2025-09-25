import { Prisma } from "~/db/generated/client";
import { db } from "../client";

export class UserRepository {
  async create(data: Prisma.UserCreateInput) {
    return db.user.create({ data });
  }

  async findById(id: string) {
    return db.user.findUnique({ where: { id } });
  }

  async findByEmail(email: string) {
    return db.user.findUnique({ where: { email } });
  }

  async update(id: string, data: Prisma.UserUpdateInput) {
    return db.user.update({ where: { id }, data });
  }

  async delete(id: string) {
    return db.user.delete({ where: { id } });
  }

  async findMany(args?: Prisma.UserFindManyArgs) {
    return db.user.findMany(args);
  }

  async findFirst(args?: Prisma.UserFindFirstArgs) {
    return db.user.findFirst(args);
  }

  async count(args?: Prisma.UserCountArgs) {
    return db.user.count(args);
  }
}

export const userRepo = new UserRepository();
export default userRepo;
