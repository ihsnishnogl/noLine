import type { CommentSyntax } from "./types.js";
import { t } from "../i18n/index.js";

export interface StripResult {
  content: string;
  commentCount: number;
  changed: boolean;
  risky: boolean;
  reason?: string;
}

export function stripComments(input: string, syntax: CommentSyntax): StripResult {
  if (syntax.kind === "line") {
    return stripLineComments(input, syntax.line ?? "#");
  }

  if (syntax.kind === "block") {
    return stripBlockComments(input, syntax.blockStart ?? "/*", syntax.blockEnd ?? "*/");
  }

  return stripBlockAwareComments(
    input,
    syntax.line,
    syntax.blockStart ?? "/*",
    syntax.blockEnd ?? "*/",
  );
}

function stripLineComments(input: string, token: string): StripResult {
  const lines = input.split(/\r?\n/);
  let commentCount = 0;
  let changed = false;

  const transformed = lines.map((line) => {
    const index = findLineCommentStart(line, token);
    if (index === -1) {
      return line;
    }

    commentCount += 1;
    changed = true;
    const next = line.slice(0, index).replace(/[ \t]+$/g, "");
    return next;
  });

  return {
    content: transformed.join("\n"),
    commentCount,
    changed,
    risky: false,
  };
}

function stripBlockComments(input: string, blockStart: string, blockEnd: string): StripResult {
  let output = "";
  let commentCount = 0;
  let changed = false;

  for (let index = 0; index < input.length; index += 1) {
    if (input.startsWith(blockStart, index)) {
      const endIndex = input.indexOf(blockEnd, index + blockStart.length);
      if (endIndex === -1) {
        return {
          content: input,
          commentCount: 0,
          changed: false,
          risky: true,
          reason: t("risk_unterminated_block_comment"),
        };
      }

      commentCount += 1;
      changed = true;
      index = endIndex + blockEnd.length - 1;
      continue;
    }

    output += input[index];
  }

  return {
    content: output,
    commentCount,
    changed,
    risky: false,
  };
}

function stripBlockAwareComments(
  input: string,
  lineToken: string | undefined,
  blockStart: string,
  blockEnd: string,
): StripResult {
  let output = "";
  let commentCount = 0;
  let changed = false;
  let state: "code" | "single" | "double" | "template" | "line-comment" | "block-comment" = "code";
  const hasLineToken = Boolean(lineToken);

  for (let index = 0; index < input.length; index += 1) {
    const current = input[index];

    if (state === "line-comment") {
      changed = true;
      if (current === "\n") {
        state = "code";
        output = output.replace(/[ \t]+$/g, "");
        output += "\n";
      }
      continue;
    }

    if (state === "block-comment") {
      changed = true;
      if (input.startsWith(blockEnd, index)) {
        state = "code";
        index += blockEnd.length - 1;
      }
      continue;
    }

    if (state === "single") {
      output += current;
      if (current === "\\" && input[index + 1]) {
        output += input[index + 1];
        index += 1;
        continue;
      }
      if (current === "'") {
        state = "code";
      }
      continue;
    }

    if (state === "double") {
      output += current;
      if (current === "\\" && input[index + 1]) {
        output += input[index + 1];
        index += 1;
        continue;
      }
      if (current === "\"") {
        state = "code";
      }
      continue;
    }

    if (state === "template") {
      output += current;
      if (current === "\\" && input[index + 1]) {
        output += input[index + 1];
        index += 1;
        continue;
      }
      if (current === "`") {
        state = "code";
      }
      continue;
    }

    if (current === "'") {
      state = "single";
      output += current;
      continue;
    }

    if (current === "\"") {
      state = "double";
      output += current;
      continue;
    }

    if (current === "`") {
      state = "template";
      output += current;
      continue;
    }

    if (
      hasLineToken &&
      lineToken &&
      input.startsWith(lineToken, index) &&
      isSafeLineCommentStart(output, lineToken)
    ) {
      output = output.replace(/[ \t]+$/g, "");
      commentCount += 1;
      state = "line-comment";
      index += lineToken.length - 1;
      continue;
    }

    if (input.startsWith(blockStart, index)) {
      commentCount += 1;
      state = "block-comment";
      index += blockStart.length - 1;
      continue;
    }

    output += current;
  }

  if (state === "line-comment") {
    output = output.replace(/[ \t]+$/g, "");
    state = "code";
  }

  if (state === "block-comment") {
    return {
      content: input,
      commentCount: 0,
      changed: false,
      risky: true,
      reason: t("risk_unterminated_block_comment"),
    };
  }

  if (state === "single" || state === "double" || state === "template") {
    return {
      content: input,
      commentCount: 0,
      changed: false,
      risky: true,
      reason: t("risk_unterminated_string"),
    };
  }

  return {
    content: output,
    commentCount,
    changed,
    risky: false,
  };
}

function findLineCommentStart(line: string, token: string): number {
  let inSingle = false;
  let inDouble = false;

  for (let index = 0; index < line.length; index += 1) {
    const current = line[index];

    if (current === "\\" && (inSingle || inDouble)) {
      index += 1;
      continue;
    }

    if (!inDouble && current === "'") {
      inSingle = !inSingle;
      continue;
    }

    if (!inSingle && current === "\"") {
      inDouble = !inDouble;
      continue;
    }

    if (!inSingle && !inDouble && line.startsWith(token, index)) {
      return index;
    }
  }

  return -1;
}

function isSafeLineCommentStart(output: string, lineToken: string): boolean {
  const previous = output.at(-1);
  if (lineToken === "//") {
    return previous !== ":";
  }

  return true;
}
