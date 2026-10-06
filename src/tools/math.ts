import { tool } from "ai";
import { z } from "zod";

export const multiply = tool({
  description: "Multiply two numbers together",
  inputSchema: z.object({
    a: z.number(),
    b: z.number(),
  }),
  execute: async ({ a, b }) => a * b,
});

export const add = tool({
  description: "Suma dos números",
  inputSchema: z.object({
    a: z.number(),
    b: z.number(),
  }),
  execute: async ({ a, b }) => {
    return a + b;
  },
});