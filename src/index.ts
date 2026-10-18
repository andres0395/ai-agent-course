import { agent } from "./agent";

const res = await agent.generate({
  prompt: "dime todos los productos que  tengo disponibles?",
})
console.log(res);

console.log('resultado:', res.text);
