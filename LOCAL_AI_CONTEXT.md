# Contexto: Setup de IA Local con Ollama

> Documento de contexto generado el **2026-10-16** a partir de una sesión práctica.
> Pensado para移植ar este setup a otros proyectos / espacios de trabajo como punto de partida.
>
> **Origen**: sesión de configuración en una MacBook Air M4 con 16 GB de RAM, objetivo de aprender a integrar modelos IA locales con apps web (caso inicial: `ecommercev2` — Next.js 16 + React 19 + Prisma + PostgreSQL).

---

## 1. Hardware target

| Recurso | Valor |
|---|---|
| Máquina | MacBook Air M4 (Apple Silicon) |
| RAM total | 16 GB memoria unificada |
| GPU disponible para inferencia | ~11.8 GiB (verificado en log de Ollama) |
| Después de macOS + IDE | ~8–10 GB prácticos para modelo + KV cache |

**Implicación**: el sweet spot son los **modelos de 2B–8B cuantizados Q4**. Un 13B+ ya queda muy justo; un 70B es inviable.

---

## 2. Stack elegido (y por qué)

### Ollama
- **Razón principal**: expone **API compatible con OpenAI** en `http://127.0.0.1:11434/v1`. Cualquier app que use el SDK de OpenAI se conecta cambiando el `baseURL` — eso es exactamente lo que se quería aprender.
- **Otras ventajas**: nativo macOS Apple Silicon (Metal), sin compilar, CLI simple, comunidad grande, descarga de modelos con un comando.
- **Alternativa considerada**: LM Studio (GUI, mismo concepto, API OpenAI-compatible en puerto 1234). Descartado por simplicidad de CLI para arrancar.

### Modelo: `qwen2.5:3b`
- **Por qué este y no otro**:
  - Cabe de sobra en 16 GB (~2 GB en disco, ~3 GB en RAM).
  - Mejor relación calidad/parámetro vs `llama3.2:3b` y `gemma2:2b` en instruction-following.
  - Soporte sólido de español (Qwen entrena con corpus multilingüe pesado).
  - Velocidad esperada en M4: ~60 tokens/s sostenido.
- **Alternativa evaluada para más razonamiento**: `phi3.5:3.8b` (apenas 300 MB más pesado, mejor en razonamiento, peor en español).
- **Descartados por peso**: cualquier 7B+ (aprieta los 16 GB con el resto del sistema).

---

## 3. Comandos clave

### 3.1. Instalar Ollama
```bash
brew install ollama
```

### 3.2. Arrancar el servidor (foreground, con flags de optimización)
```bash
OLLAMA_FLASH_ATTENTION="1" OLLAMA_KV_CACHE_TYPE="q8_0" \
  /opt/homebrew/opt/ollama/bin/ollama serve
```

**Importante**: dejar la terminal abierta. Si se cierra, el servidor se apaga y todos los requests desde la app fallan.

### 3.3. Por qué esas dos flags

| Flag | Valor | Impacto concreto |
|---|---|---|
| `OLLAMA_FLASH_ATTENTION` | `"1"` | Flash attention → menos memoria y más velocidad. |
| `OLLAMA_KV_CACHE_TYPE` | `"q8_0"` | KV cache en q8_0 vs f16 → **ocupa la mitad** para el mismo contexto. Con un 8B Q4, contexto cómodo pasa de ~4K (f16) a ~8K (q8_0). |

Estas flags vienen sugeridas en los caveats de `brew install ollama`.

### 3.4. Descargar el modelo
```bash
ollama pull qwen2.5:3b
```
~2 GB, tarda 1–3 minutos según conexión.

### 3.5. Verificar que el servidor responde
```bash
curl http://127.0.0.1:11434/api/tags
```
Debe devolver JSON con `"name": "qwen2.5:3b"` en `models[]`.

### 3.6. Probar el modelo (chat interactivo)
```bash
ollama run qwen2.5:3b
```
- Primera respuesta: 1–2 s (carga el modelo a RAM).
- Respuestas siguientes: empieza en <1 s, ~60 t/s sostenido.
- Salir del chat: `/bye`.

### 3.7. Probar el modelo vía API (sin chat)
```bash
curl http://127.0.0.1:11434/api/chat -d '{
  "model": "qwen2.5:3b",
  "messages": [{"role": "user", "content": "Hola"}],
  "stream": false
}'
```

### 3.8. Ver qué modelo está cargado en RAM
```bash
curl http://127.0.0.1:11434/api/ps
```
Útil para entender el ciclo `OLLAMA_KEEP_ALIVE=5m0s`: el modelo se descarga de RAM después de 5 min sin uso.

---

## 4. Manejo de logs

Con el comando **foreground** elegido:

- ❌ **NO** se crea `~/ollama.log` (no se redirigió stdout/stderr).
- ✅ Los logs salen a la terminal donde corre `serve`. Al cerrar la terminal, desaparecen.
- ✅ `OLLAMA_NOHISTORY=false` por defecto → sí guarda historial de chats en `~/.ollama/history`. Para no guardar nada en el futuro, agregar `OLLAMA_NOHISTORY="1"` a las flags.

### Si en el futuro se quiere log persistente a archivo
```bash
nohup env OLLAMA_FLASH_ATTENTION="1" OLLAMA_KV_CACHE_TYPE="q8_0" \
  /opt/homebrew/opt/ollama/bin/ollama serve > ~/ollama.log 2>&1 &
```
Borrar el log cuando se quiera: `rm ~/ollama.log` (el servidor sigue corriendo).

### Lo que NO es log y NO debe borrarse

| Path | Qué es | Riesgo si se borra |
|---|---|---|
| `~/.ollama/models/` | Modelos descargados | Hay que volver a hacer `ollama pull` |
| `~/.ollama/id_ed25519` | Clave SSH generada por Ollama | Se regenera sola, pero no aporta borrarla |

---

## 5. Patrón de integración con Next.js (pendiente de implementación)

### Idea base
Crear un route handler en `src/app/api/chat/route.ts` que use el SDK de OpenAI apuntando a Ollama:

```typescript
import OpenAI from 'openai';
import { NextResponse } from 'next/server';

export const localLLM = new OpenAI({
  baseURL: 'http://127.0.0.1:11434/v1',
  apiKey: 'ollama', // Ollama ignora el valor, pero el cliente lo exige
});

export async function POST(req: Request) {
  const { messages } = await req.json();
  const completion = await localLLM.chat.completions.create({
    model: 'qwen2.5:3b',
    messages,
    stream: true,    // mejorar con streaming real
    temperature: 0.7,
  });
  return NextResponse.json(completion.choices[0].message);
}
```

### Decisiones que un senior revisaría (tradeoffs documentados)

1. **Variables de entorno** para `baseURL` y `model` (`LOCAL_LLM_BASE_URL`, `LOCAL_LLM_MODEL`) en vez de hardcoded → permite alternar entre Ollama local y una API remota sin tocar código.
2. **Streaming real** con `ReadableStream` desde el route handler, no esperar respuesta completa. UX mucho mejor con modelos locales.
3. **No meter la llamada al LLM dentro de server actions que ya cachean** → el LLM es I/O caro y rompe la caché de Next.js. Mantenerlo en route handlers bajo `/api/`.
4. **Timeout con `AbortController`** (30 s) → la primera respuesta de un modelo local puede tardar 5–15 s; sin timeout el cliente queda colgado.
5. **El servidor Ollama debe estar corriendo** o el request falla → considerar `brew services` con plist custom (env vars embebidas) si se va a usar a diario.

---

## 6. Estado actual y próximos pasos

### ✅ Hecho
- Ollama 0.40.5 instalado vía Homebrew.
- Flags de optimización activas verificadas en log: `OLLAMA_FLASH_ATTENTION:true`, `OLLAMA_KV_CACHE_TYPE:q8_0`.
- Apple M4 detectado como `iGPU` con 11.8 GiB disponibles.
- Modelo `qwen2.5:3b` descargado.

### ⏳ Pendiente
1. **Validar `curl /api/tags`** devuelve `qwen2.5:3b` (verificación de servidor vivo).
2. **Probar `ollama run qwen2.5:3b`** con un prompt en español y medir velocidad/calidad subjetiva.
3. **Crear route handler** en `ecommercev2/src/app/api/chat/route.ts` con:
   - Cliente OpenAI apuntando a Ollama.
   - Variables de entorno configurables.
   - Streaming real.
   - Timeout.
4. **Probar desde el cliente** con un componente simple (candidato: `useChat` de Vercel AI SDK con `baseURL` custom).

---

## 7. Limitaciones conocidas

- **16 GB es justo** para correr el modelo + IDE + navegador + macOS simultáneamente. Si se nota lag, cerrar pestañas del navegador.
- **El primer request siempre tarda más** (carga del modelo en memoria unificada).
- **No hay GPU discreta**: Apple Silicon usa memoria unificada; el throughput es menor que una GPU dedicada.
- **El servidor Ollama debe estar corriendo** antes de cualquier request desde la app — no es "magia plug and play".
- **`qwen2.5:3b` no es bueno para todo**: razonamiento complejo, código largo o generación muy larga se benefician de modelos 7B+. Si el caso de uso lo exige, considerar `qwen2.5:7b` o `qwen2.5-coder:7b` (acepta 16 GB con margen).

---

## 8. Glosario rápido

- **KV cache**: memoria donde el modelo guarda el "estado" de la conversación. Crece con el contexto; por eso cuantizarlo (q8_0) importa.
- **Cuantización Q4**: representación de los pesos del modelo en 4 bits en vez de 16. Reduce tamaño ~4× con pérdida mínima de calidad.
- **`stream: true`**: el modelo envía la respuesta token a token en vez de esperar a tenerla completa. Esencial para UX con modelos locales.
- **OpenAI-compatible API**: convención de endpoints que imitan la API de OpenAI (`/v1/chat/completions`, etc.). Ollama, LM Studio, vLLM y otros la soportan.