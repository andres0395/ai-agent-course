import { agent } from "./agent";

const res = await agent.generate({
  prompt: "dame un resumen de la orden con el id 437dea9b-2973-47c0-ba46-900c924d8065",
})
console.log(res);

console.log('resultado:', res.text);
