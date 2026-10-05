import { ToolLoopAgent, tool } from "ai";
import { z } from "zod";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { db } from "./db";
import { ilike } from "drizzle-orm";
import { products } from "./db/schema";
import "dotenv/config";

const minimax = createOpenAICompatible({
  name: "minimax",
  baseURL: "https://api.minimax.io/v1",
  apiKey: process.env.MINIMAX_API_KEY,
});

const multiply = tool({
  description: "Multiply two numbers together",
  inputSchema: z.object({
    a: z.number(),
    b: z.number(),
  }),
  execute: async ({ a, b }) => a * b,
});

const add = tool({
  description: "Suma dos números",
  inputSchema: z.object({
    a: z.number(),
    b: z.number(),
  }),
  execute: async ({ a, b }) => {
    return a + b;
  },
});

const getProduct = tool({
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

const getCity = tool({
  description: "Obtiene la ciudad por su nombre.",
  
  inputSchema: z.object({
    name: z.string(),
  }),

  execute: async ({ name }) => {

    return {
      name,
      population: 1000000,
      country: "España",
      capital: "Madrid",
      currency: "€",
      language: "Español",
      timezone: "Europe/Madrid",
    };
  },
});

const searchProducts = tool({
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
})

export const agent = new ToolLoopAgent({
  model: minimax("MiniMax-M3"),
  instructions: `
  no respondas mas alla de la información disponible en las herramientas.
  `,
  tools: {
    multiply, 
    add, 
    getProduct, 
    getCity, 
    searchProducts
  },
});