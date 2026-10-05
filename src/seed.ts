import "dotenv/config";

import { db } from "./db";
import { products } from "./db/schema";

await db.insert(products).values([
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
]);

console.log("Productos creados");