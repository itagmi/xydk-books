import Anthropic from "@anthropic-ai/sdk";
import { Note } from "@/lib/types";

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json(
      {
        error:
          "ANTHROPIC_API_KEY가 설정되지 않았습니다. .env 파일에 API 키를 추가해 주세요.",
      },
      { status: 500 },
    );
  }

  try {
    const { bookTitle, author, category, notes } = (await request.json()) as {
      bookId: string;
      bookTitle: string;
      author: string;
      category: string;
      notes: Note[];
    };

    if (!notes || notes.length === 0) {
      return Response.json({ error: "메모가 없습니다." }, { status: 400 });
    }

    const notesText = notes
      .sort((a, b) => a.page - b.page)
      .map((n) => (n.page > 0 ? `[p.${n.page}] ${n.content}` : n.content))
      .join("\n");

    const prompt = `다음은 내가 "${bookTitle}" (저자: ${author}${category ? `, 장르: ${category}` : ""})를 읽으며 남긴 메모들이야. 대괄호 안의 페이지 번호는 내가 어떤 흐름으로 읽었는지 파악하는 참고용이야:

${notesText}

이 메모들을 바탕으로 독후감 초안을 써줘.

지켜야 할 것:
- 당신은 독자의 메모만 보고 독후감을 쓰는 도우미입니다. 책의 원문이나 줄거리를 알고 있더라도 절대 사용하지 마세요.
- 페이지 번호는 절대 본문에 언급하지 마. "p.32에서", "초반부에", "후반부에" 같은 표현도 금지
- 책의 내용을 추측하거나 지어내지 말 것. 오직 제공된 메모 내용만을 바탕으로 작성할 것.
- 메모의 감정과 생각을 자연스럽게 녹여서, 내가 직접 쓴 것처럼 1인칭 에세이로
- 메모를 나열하거나 요약하지 말고, 하나의 흐름으로 이어지는 글로
- 제목 없이 본문만, 한국어로, 400-600자`;

    const client = new Anthropic({ apiKey });
    const message = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    });

    const review =
      message.content[0].type === "text" ? message.content[0].text : "";

    if (!review.trim()) {
      return Response.json(
        { error: "AI 응답이 비어 있습니다." },
        { status: 500 },
      );
    }

    return Response.json({ review });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.";

    if (
      message.includes("authentication_error") ||
      message.includes("invalid x-api-key")
    ) {
      return Response.json(
        {
          error:
            "Anthropic API 키가 올바르지 않습니다. console.anthropic.com에서 키를 확인해 주세요.",
        },
        { status: 401 },
      );
    }

    console.error("[generate-review]", err);
    return Response.json(
      { error: "독후감 생성 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
