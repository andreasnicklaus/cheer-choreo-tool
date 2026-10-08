import Admin from "db/models/admin";
import User from "db/models/user";

declare module "express-serve-static-core" {
  interface Request {
    UserId: string;
    User: User;
    Owners: User[];
    ownerIds: string[];
    ActingUser: User;
    actingUserId: string;
    AdminId: string;
    Admin: Admin;
    locale: string;
    rawBody?: string;
    t: (key: string, options?: Record<string, object | string>) => string;
  }
}
