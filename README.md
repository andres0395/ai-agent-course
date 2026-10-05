# AI Agent Course

Mini proyecto de prácticas enfocado en la construcción de **agentes de inteligencia artificial** con herramientas, acceso a base de datos y un modelo de lenguaje compatible con OpenAI.

## Descripción

Este repositorio forma parte de un curso/práctica personal sobre agentes de IA. Implementa un agente basado en el SDK `ai` (Vercel AI SDK) con un loop de herramientas (`ToolLoopAgent`) que puede:

- Realizar operaciones matemáticas básicas (suma y multiplicación).
- Consultar información simulada de ciudades.
- Buscar y obtener productos almacenados en una base de datos PostgreSQL usando Drizzle ORM.

El agente utiliza un proveedor de modelo **OpenAI-compatible** (configurado para `minimax`) y un system prompt que restringe sus respuestas a la información disponible en las herramientas registradas.

## Stack tecnológico

- **Lenguaje:** TypeScript (strict mode, ES2022, NodeNext)
- **Runtime:** Node.js
- **Gestor de paquetes:** pnpm (12.9.1)
- **Ejecución TS:** tsx
- **SDK de IA:** `ai` (Vercel AI SDK) con `@ai-sdk/openai-compatible`
- **Validación de esquemas:** zod
- **ORM:** Drizzle ORM
- **Cliente PostgreSQL:** `postgres` (postgres.js)
- **Migraciones:** drizzle-kit
- **Variables de entorno:** dotenv

## Estructura del proyecto

```
ai-agent-course/
├── drizzle/                          # Migraciones generadas por drizzle-kit
│   ├── 0000_shocking_sharon_ventura.sql
│   └── meta/
├── src/
│   ├── agent.ts                      # Definición del agente y sus herramientas
│   ├── index.ts                      # Entry point: ejecuta el agente con un prompt
│   ├── seed.ts                       # Script para poblar la tabla products
│   └── db/
│       ├── index.ts                  # Cliente de Drizzle + conexión a Postgres
│       └── schema.ts                 # Esquema de la tabla products
├── drizzle.config.ts                 # Configuración de drizzle-kit
├── package.json
├── pnpm-workspace.yaml
├── tsconfig.json
└── .gitignore
```

## Requisitos previos

- Node.js (versión compatible con las dependencias declaradas).
- pnpm `12.9.1` (se instala automáticamente gracias a `packageManager`).
- Una instancia de **PostgreSQL** accesible (local o remota).
- Una **API key** del proveedor LLM compatible con OpenAI.

## Variables de entorno

Crea un archivo `.env` en la raíz del proyecto (no se versiona) con las siguientes variables:

```env
# Conexión a PostgreSQL
DATABASE_URL=postgres://usuario:password@host:5432/nombre_db

# API key del proveedor LLM (compatible con OpenAI)
MINIMAX_API_KEY=tu_api_key_aqui
```

## Instalación

```bash
pnpm install
```

## Configuración de la base de datos

1. Asegúrate de tener una base de datos PostgreSQL disponible y la variable `DATABASE_URL` configurada.
2. Aplica las migraciones:

```bash
pnpm exec drizzle-kit migrate
```

3. Puebla la tabla `products` con datos de ejemplo:

```bash
pnpm run seed
```

Esto insertará los productos: *Aceite de oliva*, *Arroz premium* y *Pasta italiana*.

## Uso

El entry point (`src/index.ts`) ejecuta el agente con un prompt de ejemplo:

```ts
const res = await agent.generate({
  prompt: "tengo algun producto que sea arroz o pasta?",
});
```

Para ejecutarlo:

```bash
pnpm run dev
```

El script usa `tsx --watch`, por lo que los cambios en el código se reflejarán automáticamente.

## El agente

Definido en [src/agent.ts](file:///Volumes/DEV_SSD/ai-agent-course/src/agent.ts). Se construye con `ToolLoopAgent` y se le asigna el modelo `MiniMax-M3` a través de un cliente OpenAI-compatible.

**System prompt:**

> no respondas mas alla de la información disponible en las herramientas.

### Herramientas (tools)

| Tool            | Descripción                                  | Entrada           | Salida                                              |
| --------------- | -------------------------------------------- | ----------------- | --------------------------------------------------- |
| `multiply`      | Multiplica dos números.                      | `a`, `b` (number) | Resultado de `a * b`                                |
| `add`           | Suma dos números.                            | `a`, `b` (number) | Resultado de `a + b`                                |
| `getProduct`    | Obtiene un producto por su nombre (parcial). | `nameP` (string)  | Objeto `product` o `found: false`                   |
| `getCity`       | Devuelve datos simulados de una ciudad.      | `name` (string)   | Objeto con `population`, `country`, `currency`, etc.|
| `searchProducts`| Busca hasta 10 productos por coincidencia parcial de nombre. | `nameP` (string) | Array de `products` o `found: false`     |

Las herramientas `getProduct` y `searchProducts` consultan la base de datos PostgreSQL mediante Drizzle, utilizando `ilike` para coincidencias por nombre. La herramienta `getCity` está actualmente mockeada en memoria y marcada en el código como candidata a migrarse a Drizzle ORM en el futuro.

## Esquema de base de datos

Tabla `products` definida en [src/db/schema.ts](file:///Volumes/DEV_SSD/ai-agent-course/src/db/schema.ts):

| Columna      | Tipo             | Restricciones                  |
| ------------ | ---------------- | ------------------------------ |
| `id`         | `uuid`           | PK, default `gen_random_uuid()`|
| `name`       | `text`           | `NOT NULL`                     |
| `price`      | `numeric(12, 2)` | `NOT NULL`                     |
| `stock`      | `integer`        | `NOT NULL`                     |
| `created_at` | `timestamp`      | `NOT NULL`, default `now()`    |

## Scripts disponibles

| Script          | Comando                  | Descripción                                            |
| --------------- | ------------------------ | ------------------------------------------------------ |
| `dev`           | `pnpm run dev`           | Ejecuta `src/index.ts` en modo watch con tsx.          |
| `seed`          | `pnpm run seed`          | Puebla la tabla `products` con datos de ejemplo.       |

## Buenas prácticas y notas

- El repositorio sigue **TypeScript strict mode** y módulos ESM (`"type": "module"`).
- Las herramientas declaran su contrato de entrada con **zod**, lo que permite validación y tipado automático.
- Se sigue la convención de **separar la capa de acceso a datos** (`src/db/`) de la lógica del agente.
- El archivo `.env` está incluido en `.gitignore` para evitar filtrar credenciales.
- La herramienta `getCity` es un placeholder; el comentario en el código indica que se migrará a Prisma en el futuro.

## Próximos pasos sugeridos

- Reemplazar la implementación mock de `getCity` por una fuente de datos real (API externa o nueva tabla).
- Añadir tests para las herramientas y para el flujo del agente.
- Incorporar herramientas de escritura (crear/actualizar productos) con transacciones.
- Añadir logging estructurado y manejo de errores más robusto.
- Configurar un linter (`eslint`) y formateador (`prettier`).

## Licencia

ISC
