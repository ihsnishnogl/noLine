import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

export async function askForConfirmation(message: string): Promise<boolean> {
  const rl = readline.createInterface({ input, output });
  const answer = await rl.question(`${message} (y/N): `);
  rl.close();
  return answer.trim().toLowerCase() === "y" || answer.trim().toLowerCase() === "yes";
}
