import { ToolLoopAgent } from "ai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { searchProducts, getProduct } from "./tools/get-products";
import { multiply, add } from "./tools/math";
import { searchOrders, searchOrderbyId } from "./tools/get-orders";

import "dotenv/config";

const minimax = createOpenAICompatible({
  name: "minimax",
  baseURL: "https://api.minimax.io/v1",
  apiKey: process.env.MINIMAX_API_KEY,
});

export const agent = new ToolLoopAgent({
  model: minimax("MiniMax-M3"),
  instructions: `
  no respondas mas alla de la información disponible en las herramientas.
  `,
  tools: {
    multiply, 
    add, 
    getProduct,
    searchProducts,
    searchOrders,
    searchOrderbyId,
  },
});