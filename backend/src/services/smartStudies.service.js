import dotenv from 'dotenv';
import pdfParse from 'pdf-parse';
import { assertOpenRouterConfigured, openRouterChat } from './openRouterClient.js';

dotenv.config();

const MAX_PDF_CHARS = 100000;

const parseJsonFromModel = (text, fallback) => {
  if (!text || typeof text !== 'string') return fallback;
  let cleaned = text.trim();
  cleaned = cleaned.replace(/^```json\s*/i, '');
  cleaned = cleaned.replace(/^```\s*/i, '');
  cleaned = cleaned.replace(/\s*```$/i, '');
  cleaned = cleaned.trim();
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (match) cleaned = match[0];
  try {
    return JSON.parse(cleaned);
  } catch {
    return fallback;
  }
};

/**
 * PDFs are sent as extracted text (same outcome as before; OpenRouter vision models vary on raw PDF bytes).
 * Images use multimodal user content (text + image URL).
 */
async function buildUserMessages(buffer, mimeType, textPrompt) {
  if (mimeType === 'application/pdf') {
    const pdfData = await pdfParse(buffer);
    let docText = (pdfData.text || '').trim();
    if (!docText) {
      throw new Error(
        'Could not extract text from this PDF. Try a clearer scan, export pages as images, or use JPEG/PNG/WebP.',
      );
    }
    if (docText.length > MAX_PDF_CHARS) {
      docText = `${docText.slice(0, MAX_PDF_CHARS)}\n\n[... document truncated for length ...]`;
    }
    const combined = `The user uploaded a PDF. Below is extracted text from the document.

---
${docText}
---

${textPrompt}`;
    return [{ role: 'user', content: combined }];
  }

  const base64 = buffer.toString('base64');
  const dataUrl = `data:${mimeType};base64,${base64}`;
  return [
    {
      role: 'user',
      content: [
        { type: 'text', text: textPrompt },
        { type: 'image_url', imageUrl: { url: dataUrl } },
      ],
    },
  ];
}

export async function runSmartStudiesAnalysis({
  buffer,
  mimeType,
  mode,
  topicsDetails = '',
  targetWordCount = 400,
  keywordFocus = '',
}) {
  assertOpenRouterConfigured();

  const words =
    typeof targetWordCount === 'number' && Number.isFinite(targetWordCount) && targetWordCount > 0
      ? Math.min(Math.round(targetWordCount), 8000)
      : 400;

  const topicsBlock = (topicsDetails || '').trim() || 'None provided — infer priorities from the document.';

  if (mode === 'summarize') {
    const prompt = `You are a study assistant. The user attached a document (image, scan, or PDF).

Content topics & details from the user (use this to decide what to emphasize and how to structure the summary):
"""${topicsBlock}"""

Target length: approximately ${words} words. Stay within roughly ±25% of that target unless the document is extremely short.

Task:
1. Read all visible text and structure in the document.
2. Produce a clear, accurate summary aligned with the topics/details above.
3. Use markdown: short intro, then bullet points or sections as appropriate. Match the requested depth implied by the word target.

Respond with ONLY valid JSON (no markdown fences) in this exact shape:
{"summary":"markdown string here"}`;

    const messages = await buildUserMessages(buffer, mimeType, prompt);
    const raw = await openRouterChat({ messages, temperature: 0.4 });
    const parsed = parseJsonFromModel(raw, null);
    if (parsed?.summary && typeof parsed.summary === 'string') {
      return { mode: 'summarize', summary: parsed.summary };
    }
    return { mode: 'summarize', summary: raw || 'No summary produced.' };
  }

  if (mode === 'keywords') {
    const focusBlock = (keywordFocus || '').trim() || 'None — infer key themes from the document only.';

    const prompt = `You are a study assistant. The user attached a document (image, scan, or PDF).

User focus / scope for keyword extraction (optional; steers which themes matter most):
"""${focusBlock}"""

Task:
1. Extract 8–20 main keywords or short key phrases (no duplicates, most important first).
2. Write a concise excerpt (2–5 sentences) that captures the core ideas. Naturally include as many of the keywords as possible (you may lightly rewrite for flow).

Respond with ONLY valid JSON (no markdown fences) in this exact shape:
{"keywords":["phrase one","phrase two"],"excerpt":"plain text paragraph"}`;

    const messages = await buildUserMessages(buffer, mimeType, prompt);
    const raw = await openRouterChat({ messages, temperature: 0.4 });
    const parsed = parseJsonFromModel(raw, { keywords: [], excerpt: '' });
    const keywords = Array.isArray(parsed.keywords)
      ? parsed.keywords.map((k) => String(k).trim()).filter(Boolean)
      : [];
    const excerpt = typeof parsed.excerpt === 'string' ? parsed.excerpt : '';
    return { mode: 'keywords', keywords, excerpt: excerpt || raw || '' };
  }

  throw new Error('Invalid mode');
}
