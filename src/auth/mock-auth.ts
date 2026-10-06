import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";

export enum Role {
  Admin = "admin",
  Client = "client",
}

type UserFound = {
  found: true;
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt: Date;
};

type UserNotFound = {
  found: false;
  message: string;
};

export const userMock = async (
  role: Role,
  userId: string ='',
): Promise<UserFound | UserNotFound> => {
  if (role === Role.Admin) {
    console.log(' entro al admin');
    const [admin] = await db
      .select()
      .from(users)
      .where(eq(users.role, role))
      .limit(1);

    if (!admin) {
      return {
        found: false,
        message: "Admin no encontrado",
      };
    }

    return {
      found: true,
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role,
      createdAt: admin.createdAt,
    };
  }

  const [client] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!client) {
    return {
      found: false,
      message: "Client no encontrado",
    };
  }

  return {
    found: true,
    id: client.id,
    email: client.email,
    name: client.name,
    role,
    createdAt: client.createdAt,
  };
  
};
