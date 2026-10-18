import { ToolLoopAgent } from "ai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { searchProducts, getProduct, allProducts } from "./tools/get-products";
import { multiply, add } from "./tools/math";
import { searchOrders, searchOrderbyId } from "./tools/get-orders";

import "dotenv/config";

// ============================================================
// OPCIÓN 1 — API remota (MiniMax / OpenAI-compatible)
// ============================================================
// Cuándo usarla:
//   • Producción o deployments donde necesitás un modelo grande.
//   • Cuando querés calidad garantizada sin configurar nada local.
//   • Latencia de red aceptable (cientos de ms).
//
// Requisitos:
//   • Variable de entorno MINIMAX_API_KEY en .env
//   • El modelo existe en el endpoint configurado
//
// Cómo activarla:
//   1. Descomentar el bloque de abajo.
//   2. Comentar o borrar el bloque "OPCIÓN 2".
//   3. Definir MINIMAX_API_KEY (y opcionalmente MINIMAX_MODEL) en .env.
// ============================================================

// const minimax = createOpenAICompatible({
//   name: "minimax",
//   baseURL: "https://api.minimax.io/v1",
//   apiKey: process.env.MINIMAX_API_KEY,
// });
//
// export const agent = new ToolLoopAgent({
//   model: minimax(process.env.MINIMAX_MODEL ?? "MiniMax-M3"),
//   instructions: `
//     no respondas mas alla de la información disponible en las herramientas.
//   `,
//   tools: {
//     multiply,
//     add,
//     getProduct,
//     searchProducts,
//     searchOrders,
//     searchOrderbyId,
//   },
// });

// ============================================================
// OPCIÓN 2 — Ollama local (modelo on-device)
// ============================================================
// Cuándo usarla:
//   • Desarrollo local y aprendizaje del flujo de tools/agent.
//   • Datos sensibles que no querés mandar a la nube.
//   • Experimentar sin costo (no hay API key, no hay red).
//
// Requisitos:
//   • Ollama instalado: brew install ollama
//   • Ollama corriendo (optimizado para Apple Silicon):
//       OLLAMA_FLASH_ATTENTION="1" OLLAMA_KV_CACHE_TYPE="q8_0" \
//         /opt/homebrew/opt/ollama/bin/ollama serve
//   • Modelo descargado: ollama pull qwen2.5:3b
//
// Cómo activarla:
//   1. Este bloque está activo por defecto (OPCIÓN 1 está comentado).
//   2. Cambiá LOCAL_LLM_MODEL en .env para usar otro modelo.
//   3. Si Ollama está en otro host/puerto, sobreescribí LOCAL_LLM_BASE_URL.
// ============================================================

const local = createOpenAICompatible({
  name: "ollama",
  baseURL: process.env.LOCAL_LLM_BASE_URL ?? "http://127.0.0.1:11434/v1",
  apiKey: process.env.LOCAL_LLM_API_KEY ?? "ollama", // Ollama ignora el valor
});

export const agent = new ToolLoopAgent({
  model: local(process.env.LOCAL_LLM_MODEL ?? "qwen2.5:3b"),
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
    allProducts,
  },
});