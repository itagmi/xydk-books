import Anthropic from '@anthropic-ai/sdk';
import { Note } from '@/lib/types';

const client = new Anthropic();

export async function POST(request: Request) {
  const { bookTitle, author, category, notes } = await request.json() as {
    bookId: string;
    bookTitle: string;
    author: string;
    category: string;
    notes: Note[];
  };

  if (!notes || notes.length === 0) {
    return Response.json({ error: '메모가 없습니다.' }, { status: 400 });
  }

  const notesText = notes
    .sort((a, b) => a.page - b.page)
    .map((n) => (n.page > 0 ? `[p.${n.page}] ${n.content}` : n.content))
    .join('\n');

  const prompt = `다음은 내가 "${bookTitle}" (저자: ${author}${category ? `, 장르: ${category}` : ''})를 읽으며 남긴 포스트잇 메모들입니다:

${notesText}

이 메모들을 바탕으로 독후감 초안을 작성해줘.

중요한 방향:
- 책의 내용을 요약하지 말고, 메모에 담긴 나의 감정과 생각을 중심으로 써줘
- 자연스러운 에세이 형식으로, 개인적인 독서 경험이 느껴지게
- 한국어로 작성
- 독후감의 제목은 포함하지 말고, 본문만 작성해줘
- 분량은 400-600자 정도로`;

  const message = await client.messages.create({
    model: 'claude-opus-4-8',
    max_tokens: 2048,
    messages: [{ role: 'user', content: prompt }],
  });

  const review =
    message.content[0].type === 'text' ? message.content[0].text : '';

  return Response.json({ review });
}
