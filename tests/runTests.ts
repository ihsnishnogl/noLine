import { runCommentStripperTests } from "./commentStripper.test.js";

function main(): void {
  runNamedTest("commentStripper", runCommentStripperTests);
  console.log("T\u00fcm testler ge\u00e7ti.");
}

function runNamedTest(name: string, fn: () => void): void {
  try {
    fn();
    console.log(`GE\u00c7T\u0130 ${name}`);
  } catch (error) {
    console.error(`HATA ${name}`);
    throw error;
  }
}

main();
