import { tool } from "ai";
import { z } from "zod";
import { db } from "../db";
import { and, eq } from "drizzle-orm";
import { orders } from "../db/schema";
import { userMock, Role } from "../auth/mock-auth";

export const searchOrders = tool({
  description: "Busca orders de todos los clientes. solo para usuarios admin",

  inputSchema: z.object({}),

  execute: async () => {
    const user = await userMock(Role.Admin);

    if (!user.found) {
      return user;
    }

    const ordersRes = await db
      .select()
      .from(orders);

    if (!ordersRes.length) {
      return {
        found: false,
        message: `No encontre orders que coincidan con ${user.id}`,
      };
    }

    return {
      found: true,
      orders: ordersRes,
    };
  },
});

export const searchOrderbyId = tool({
  description: "Busca una orden por su id.",

  inputSchema: z.object({
    orderId: z.uuid().describe("El id de la order"),
  }),
  execute: async ({ orderId }) => {

    const user = await userMock(Role.Client, '722c47d5-7181-49a7-a61f-0a0b15e04fd5');

    if (!user.found) {
      return user;
    }

    const order = await db
      .select()
      .from(orders)
      .where(and(eq(orders.id, orderId), eq(orders.userId, user.id)))
      .limit(1);

    if (!order.length) {
      return {
        found: false,
        message: `No encontre la order ${orderId} o no tienes permisos para verla`,
      };
    }

    return {
      found: true,
      order: order[0],
    };
  },
});