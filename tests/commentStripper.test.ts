import assert from "node:assert/strict";
import { stripComments } from "../src/core/commentStripper.js";

export function runCommentStripperTests(): void {
  const result = stripComments("const a = 1; // hello\nconst b = 2;", {
    kind: "line-and-block",
    line: "//",
    blockStart: "/*",
    blockEnd: "*/",
  });

  assert.equal(result.changed, true);
  assert.equal(result.commentCount, 1);
  assert.equal(result.content, "const a = 1;\nconst b = 2;");

  const blockResult = stripComments("const a = /* note */ 1;", {
    kind: "line-and-block",
    line: "//",
    blockStart: "/*",
    blockEnd: "*/",
  });

  assert.equal(blockResult.changed, true);
  assert.equal(blockResult.commentCount, 1);
  assert.equal(blockResult.content, "const a =  1;");

  const stringResult = stripComments('const url = "https://example.com"; // comment', {
    kind: "line-and-block",
    line: "//",
    blockStart: "/*",
    blockEnd: "*/",
  });

  assert.equal(stringResult.content, 'const url = "https://example.com";');
  assert.equal(stringResult.commentCount, 1);

  const hashResult = stripComments("print('x') # comment", {
    kind: "line",
    line: "#",
  });

  assert.equal(hashResult.content, "print('x')");
  assert.equal(hashResult.commentCount, 1);

  const riskyResult = stripComments("const a = 1; /* broken", {
    kind: "line-and-block",
    line: "//",
    blockStart: "/*",
    blockEnd: "*/",
  });

  assert.equal(riskyResult.risky, true);
  assert.equal(riskyResult.changed, false);

  const htmlResult = stripComments('<div><!-- aciklama --><span>icerik</span></div>', {
    kind: "block",
    blockStart: "<!--",
    blockEnd: "-->",
  });

  assert.equal(htmlResult.changed, true);
  assert.equal(htmlResult.commentCount, 1);
  assert.equal(htmlResult.content, "<div><span>icerik</span></div>");

  const cssResult = stripComments(".card { color: red; /* tema */ background: blue; }", {
    kind: "line-and-block",
    line: "//",
    blockStart: "/*",
    blockEnd: "*/",
  });

  assert.equal(cssResult.changed, true);
  assert.equal(cssResult.commentCount, 1);
  assert.equal(cssResult.content, ".card { color: red;  background: blue; }");
}
