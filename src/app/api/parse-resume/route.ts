import { NextResponse } from 'next/server';
import mammoth from 'mammoth';
import pdfParse from 'pdf-parse';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get('file');
    if (!(file instanceof File)) return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });

    const name = file.name.toLowerCase();
    const buffer = Buffer.from(await file.arrayBuffer());
    let text = '';

    if (name.endsWith('.txt')) {
      text = buffer.toString('utf8');
    } else if (name.endsWith('.docx')) {
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else if (name.endsWith('.pdf')) {
      const result = await pdfParse(buffer);
      text = result.text;
    } else {
      return NextResponse.json({ error: 'Supported formats: PDF, DOCX and TXT.' }, { status: 415 });
    }

    if (!text.trim()) return NextResponse.json({ error: 'No readable text was found in this file.' }, { status: 422 });
    return NextResponse.json({ text: text.replace(/\u0000/g, '').trim(), fileName: file.name });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Could not parse the resume.' }, { status: 500 });
  }
}
