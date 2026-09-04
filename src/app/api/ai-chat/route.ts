import { NextResponse } from 'next/server';
export const runtime = 'nodejs';

const SYSTEM = `You are the AI Career Copilot inside a resume and job-search app. Give concise, practical, evidence-aware advice about ATS resumes, job descriptions, applications, interviews, career gaps and the app's tools. Never invent a user's qualifications, job experience, metrics or skills. If information is missing, say what is missing. Do not promise interviews or hiring outcomes. Respect the current page context. Keep answers under 180 words unless a step-by-step answer is necessary.`;
const buckets = new Map<string, { count: number; at: number }>();

function localAnswer(q: string) {
  const x = q.toLowerCase();
  if (x.includes('ats')) return 'Start with the ATS Optimizer: compare the job description with your resume, fix missing sections and formatting, then review only truthful keyword suggestions. Avoid keyword stuffing or changing facts just to raise a score.';
  if (x.includes('missing skill') || x.includes('skill gap')) return 'Use Career Gaps to separate strong, partial and missing requirements. Do not add a missing skill to your resume unless you genuinely have the evidence. Build evidence through a project, course or real work, then update your Career Profile.';
  if (x.includes('which tool') || x.includes('first')) return 'For a new application, start with the Unified Job Workspace. It can take you through JD parsing, ATS analysis, gaps, resume tailoring, cover letter and interview prep, then Tracker.';
  if (x.includes('interview')) return 'Use Interview Prep after you analyze the JD. Generate separate technical and soft-skill questions, answer them in your own words, then use AI Review to get feedback on relevance, structure, evidence and clarity.';
  return '';
}

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
    const now = Date.now();
    const bucket = buckets.get(ip);
    if (bucket && now - bucket.at < 60000 && bucket.count >= 12) return NextResponse.json({ error: 'Too many requests. Please wait a minute.' }, { status: 429 });
    if (!bucket || now - bucket.at >= 60000) buckets.set(ip, { count: 1, at: now }); else bucket.count++;

    const body = await req.json();
    const message = String(body?.message || '').trim();
    if (!message) return NextResponse.json({ error: 'Message is required.' }, { status: 400 });
    const page = String(body?.page || '').slice(0, 80);
    const context = page ? `\nCurrent app page: ${page}. Give advice relevant to this tool unless the user asks otherwise.` : '';
    const local = localAnswer(message);
    if (local) return NextResponse.json({ answer: local, provider: 'local' });

    const key = process.env.GEMINI_API_KEY;
    if (!key) return NextResponse.json({ answer: 'Gemini is not configured yet. You can still use the deterministic tools in the app.', provider: 'local' });

    const models = [process.env.GEMINI_MODEL || 'gemini-3.7-flash', ...(process.env.GEMINI_FALLBACK_MODELS || 'gemini-3.1-flash-lite,gemini-2.5-flash-lite').split(',').map((x: string) => x.trim()).filter(Boolean)].filter((m, i, a) => a.indexOf(m) === i);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    try {
      const history = Array.isArray(body?.history)
        ? body.history.slice(-6).map((m: any) => ({ role: m.role === 'user' ? 'user' : 'model', parts: [{ text: String(m.text || '').slice(0, 1800) }] }))
        : [];
      let response: Response | null = null;
      let lastError = '';
      for (const model of models) {
        response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
        signal: controller.signal,
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM + context }] },
          contents: [...history, { role: 'user', parts: [{ text: message.slice(0, 3000) }] }],
          generationConfig: { maxOutputTokens: 500, temperature: 0.3 }
        })
        });
        const candidateRaw = await response.text();
        if (response.ok) {
          const data = JSON.parse(candidateRaw);
          const answer = data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text || '').join('').trim();
          if (answer) return NextResponse.json({ answer, provider: 'gemini' });
          lastError = 'Gemini returned an empty response.';
          break;
        }
        let detail = candidateRaw;
        try { detail = JSON.parse(candidateRaw)?.error?.message || detail; } catch {}
        lastError = `Gemini API error (${response.status}): ${detail}`;
        if (![429, 500, 502, 503, 504].includes(response.status)) break;
      }
      throw new Error(lastError || 'Gemini request failed.');
      const data = JSON.parse('null');
    } catch (e: any) {
      if (e?.name === 'AbortError') return NextResponse.json({ answer: 'The AI response took too long. Try a shorter question, or use the app tools directly.', provider: 'timeout' });
      console.error('AI chat error', e);
      return NextResponse.json({ answer: 'Gemini is temporarily unavailable. The deterministic career tools are still available.', provider: 'fallback', error: String(e?.message || 'AI unavailable') });
    } finally {
      clearTimeout(timeout);
    }
  } catch (e: any) {
    console.error('AI chat request error', e);
    return NextResponse.json({ error: e?.message || 'Could not process the message.' }, { status: 500 });
  }
}
