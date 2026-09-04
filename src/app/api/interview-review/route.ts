import { NextResponse } from 'next/server';
import { parseJobDescription } from '@/lib/jd-parser';
export const runtime = 'nodejs';

function localReview(question: string, answer: string, jd: string) {
  const words = answer.trim().split(/\s+/).filter(Boolean);
  const role = parseJobDescription(jd).role;
  const hasEvidence = /\b(i|my|we)\b/i.test(answer) && /(project|built|created|analyzed|developed|improved|resolved|implemented|led|used|result|outcome)/i.test(answer);
  const hasStructure = /(situation|task|action|result|because|therefore|first|then|finally)/i.test(answer);
  const score = Math.max(20, Math.min(95, 45 + Math.min(words.length, 90) / 3 + (hasEvidence ? 18 : 0) + (hasStructure ? 10 : 0)));
  return { score: Math.round(score), role, strengths: [words.length >= 45 ? 'Enough detail to evaluate your approach.' : 'Your answer is concise.', hasEvidence ? 'Uses concrete experience or action evidence.' : ''].filter(Boolean), improvements: [words.length < 35 ? 'Add a specific example and outcome.' : '', !hasEvidence ? 'Ground the answer in something you actually did.' : '', !hasStructure ? 'Use a simple Situation → Action → Result structure where appropriate.' : '', `Tie the answer more directly to the ${role} requirement in the question.`].filter(Boolean), note: `This review is a coaching signal, not a hiring prediction. Question: ${question}` };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const jd = String(body?.jd || '').slice(0, 14000);
    const question = String(body?.question || '').slice(0, 2500);
    const answer = String(body?.answer || '').slice(0, 6000);
    if (!jd || !question || !answer.trim()) return NextResponse.json({ error: 'JD, question and answer are required.' }, { status: 400 });
    const parsed = parseJobDescription(jd);
    const key = process.env.GEMINI_API_KEY;
    if (!key) return NextResponse.json({ ...localReview(question, answer, jd), provider: 'local' });
    const model = process.env.GEMINI_MODEL || 'gemini-3.7-flash';
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    try {
      const prompt = `Review this interview answer as a coach. Target role: ${parsed.role}. JD signals: ${parsed.skills.join(', ')}. Question: ${question}. Answer: ${answer}. Return ONLY JSON with keys score (0-100 integer), strengths (array of max 3 short strings), improvements (array of max 4 short strings), relevance (short string), structure (short string), evidence (short string). Do not invent facts. Do not judge hiring probability.`;
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key }, signal: controller.signal, body: JSON.stringify({ systemInstruction: { parts: [{ text: 'You are an evidence-aware interview coach. Be specific, concise and truthful.' }] }, contents: [{ role: 'user', parts: [{ text: prompt }] }], generationConfig: { responseMimeType: 'application/json', maxOutputTokens: 600, temperature: 0.2 } }) });
      const raw = await r.text();
      if (!r.ok) throw new Error(raw);
      const data = JSON.parse(raw); const text = data?.candidates?.[0]?.content?.parts?.map((p:any) => p.text || '').join('');
      if (!text) throw new Error('Empty Gemini review.');
      const review = JSON.parse(text);
      return NextResponse.json({ ...review, role: parsed.role, provider: 'gemini' });
    } catch (e) {
      console.error('Interview review AI error', e);
      return NextResponse.json({ ...localReview(question, answer, jd), provider: 'fallback' });
    } finally { clearTimeout(timeout); }
  } catch (e:any) { return NextResponse.json({ error: e?.message || 'Could not review answer.' }, { status: 500 }); }
}
