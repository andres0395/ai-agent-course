import "dotenv/config";

import { db } from "./db";
import { products, users, orders } from "./db/schema";

async function seed() {
  console.log("🌱 Iniciando seed...");

  // =========================================================
  // 1. USUARIOS
  // =========================================================

  const [admin, cliente1, cliente2] = await db
    .insert(users)
    .values([
      {
        name: "Administrador Principal",
        email: "admin@internationalfood360.com",
        role: "admin",
      },
      {
        name: "Carlos Rodríguez",
        email: "carlos@example.com",
        role: "customer",
      },
      {
        name: "Laura Martínez",
        email: "laura@example.com",
        role: "customer",
      },
    ])
    .returning();

  console.log("✅ Usuarios creados");

  // =========================================================
  // 2. PRODUCTOS
  // =========================================================

  await db
    .insert(products)
    .values([
      {
        name: "Aceite de oliva",
        price: "25000.00",
        stock: 15,
      },
      {
        name: "Arroz premium",
        price: "8500.00",
        stock: 40,
      },
      {
        name: "Pasta italiana",
        price: "12000.00",
        stock: 25,
      },
    ])
    .returning();

  console.log("✅ Productos creados");

  // =========================================================
  // 3. ÓRDENES DE CARLOS
  // =========================================================

  await db.insert(orders).values([
    {
      userId: cliente1.id,
      status: "pending",
      total: "42000.00",
    },
    {
      userId: cliente1.id,
      status: "paid",
      total: "73500.00",
    },
    {
      userId: cliente1.id,
      status: "shipped",
      total: "98000.00",
    },
  ]);

  // =========================================================
  // 4. ÓRDENES DE LAURA
  // =========================================================

  await db.insert(orders).values([
    {
      userId: cliente2.id,
      status: "paid",
      total: "55000.00",
    },
    {
      userId: cliente2.id,
      status: "shipped",
      total: "82500.00",
    },
    {
      userId: cliente2.id,
      status: "delivered",
      total: "120000.00",
    },
  ]);

  console.log("✅ Órdenes creadas");

  console.log("");
  console.log("🎉 Seed completado correctamente");
  console.log("");
  console.log("Usuarios:");
  console.log(`Admin:    ${admin.email} (${admin.id})`);
  console.log(`Cliente 1: ${cliente1.email} (${cliente1.id})`);
  console.log(`Cliente 2: ${cliente2.email} (${cliente2.id})`);
}

seed()
  .catch((error) => {
    console.error("❌ Error ejecutando seed:");
    console.error(error);
    process.exit(1);
  });
