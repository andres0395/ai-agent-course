import { agent } from "./agent";

const res = await agent.generate({
  prompt: "tengo algun producto que sea arroz o pasta?",
})
console.log(res);

console.log('resultado:', res.text);
