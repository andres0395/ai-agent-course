import { tool } from "ai";
import { z } from "zod";
import { db } from "../db";
import { ilike } from "drizzle-orm";
import { products } from "../db/schema";

export const searchProducts = tool({
  description: "Busca productos por nombre.",
  
  inputSchema: z.object({
    nameP: z.string().describe("El nombre de los productos"),
  }),
  execute: async ({nameP}) =>{
    const productsRes = await db
    .select()
    .from(products)
    .where(ilike(products.name, `%${nameP}%`))
    .limit(10);

    if(!productsRes.length)
      return{
        found: false,
        message: `No encontre productos que coincidan con ${nameP}`,
      }

    return {
      found:true,
      products: productsRes,
    };
  }
});

export const getProduct = tool({
  description: "Obtiene un producto por su nombre.",
  
  inputSchema: z.object({
    nameP: z.string().describe("El nombre del producto"),
  }),

  execute: async ({ nameP }) => {
    const product = await db
    .select()
    .from(products)
    .where(ilike(products.name, `%${nameP}%`))
    .limit(1);

    if (!product.length)
      return{
        found: false,
        message: `No encontre el producto ${nameP}`,
      }
    const [{
      id,
      name,
      price,
      stock,
    }] = product;

    return {
      found:true,
      product:{
        id,
        name,
        price,
        stock,
      }
    };
  },
});