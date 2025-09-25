import { db } from "~/db/client";
import { Prisma } from "~/db/generated/client";

export class ProfileRepository {
  async create(data: Prisma.ProfileCreateInput) {
    return db.profile.create({ data });
  }

  async findById(id: string) {
    return db.profile.findUnique({ 
      where: { id },
      include: { user: true }
    });
  }

  async findByUsername(username: string) {
    return db.profile.findUnique({ where: { username } });
  }

  async update(id: string, data: Prisma.ProfileUpdateInput) {
    return db.profile.update({ where: { id }, data });
  }

  async delete(id: string) {
    return db.profile.delete({ where: { id } });
  }

  async findMany(args?: Prisma.ProfileFindManyArgs) {
    return db.profile.findMany(args);
  }

  async findFirst(args?: Prisma.ProfileFindFirstArgs) {
    return db.profile.findFirst(args);
  }

  async count(args?: Prisma.ProfileCountArgs) {
    return db.profile.count(args);
  }
}

export const profileRepo = new ProfileRepository();
export default profileRepo;
