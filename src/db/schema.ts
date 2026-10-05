import {
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),

  name: text("name").notNull(),

  price: numeric("price", {
    precision: 12,
    scale: 2,
  }).notNull(),

  stock: integer("stock").notNull(),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),
});