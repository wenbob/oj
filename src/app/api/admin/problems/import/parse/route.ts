import { NextRequest, NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { parseProblemsMarkdown } from "@/lib/markdownParser";

export async function POST(request: NextRequest) {
  const auth = await requireApiUser(request, "admin");
  if (auth.response) return auth.response;

  const body = await request.json().catch(() => null);
  const markdown = typeof body?.markdown === "string" ? body.markdown : "";
  const defaultDifficulty =
    typeof body?.defaultDifficulty === "string"
      ? body.defaultDifficulty
      : typeof body?.difficulty === "string"
        ? body.difficulty
        : undefined;
  const defaultCategory =
    typeof body?.defaultCategory === "string"
      ? body.defaultCategory
      : typeof body?.category === "string"
        ? body.category
        : undefined;
  const result = parseProblemsMarkdown(markdown, {
    defaultCategory,
    defaultDifficulty,
  });
  return NextResponse.json(result);
}
