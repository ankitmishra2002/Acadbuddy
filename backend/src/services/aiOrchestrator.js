import dotenv from 'dotenv';
import { assertOpenRouterConfigured, openRouterChat } from './openRouterClient.js';

dotenv.config();

export { testOpenRouterApiKey as testAPIKey } from './openRouterClient.js';

/**
 * Base prompt template builder
 */
const buildBasePrompt = (userContext, styleProfile, contextData) => {
  let prompt = `You are an academic assistant helping university students prepare for exams and assignments.

User Context:
- University: ${userContext.university}
- Branch: ${userContext.branch}
- Semester: ${userContext.semester}
- Subject: ${userContext.subject}

Answer Style Profile:
- Sections: ${styleProfile?.sections?.join(', ') || 'N/A'}
- Tone: ${styleProfile?.tone || 'academic'}
${styleProfile?.maxWordCount ? `- Max Word Count: ${styleProfile.maxWordCount}` : ''}
${styleProfile?.instructions ? `- Additional Instructions: ${styleProfile.instructions}` : ''}

Relevant Context:
`;

  if (contextData?.syllabus) {
    prompt += `\nSyllabus:\n${contextData.syllabus.substring(0, 2000)}\n`;
  }
  if (contextData?.notes) {
    prompt += `\nNotes:\n${contextData.notes.substring(0, 2000)}\n`;
  }
  if (contextData?.pyq) {
    prompt += `\nPast Year Questions:\n${contextData.pyq.substring(0, 2000)}\n`;
  }

  return prompt;
};

/**
 * Helper function to parse AI JSON responses, handling markdown code blocks
 */
const parseAIResponse = (response, fallbackStructure) => {
  try {
    let cleanedResponse = response.trim();
    // Remove markdown code blocks if present
    cleanedResponse = cleanedResponse.replace(/^```json\s*/i, '');
    cleanedResponse = cleanedResponse.replace(/^```\s*/i, '');
    cleanedResponse = cleanedResponse.replace(/\s*```$/i, '');
    cleanedResponse = cleanedResponse.replace(/```/g, '');
    cleanedResponse = cleanedResponse.trim();

    // Try to extract JSON if there's text before/after
    const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (jsonMatch) {
      cleanedResponse = jsonMatch[0];
    }

    return JSON.parse(cleanedResponse);
  } catch (parseError) {
    console.error('Failed to parse AI response as JSON. Using fallback structure.');
    return fallbackStructure;
  }
};

/**
 * Internal helper to generate content via OpenRouter (OpenAI-compatible chat API)
 */
const internalGenerateContent = async (systemInstruction, userPrompt, chatOpts = {}) => {
  assertOpenRouterConfigured();
  return openRouterChat({
    messages: [
      { role: 'system', content: systemInstruction },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.7,
    ...chatOpts,
  });
};

/**
 * Generate study notes
 */
export const generateNotes = async (userContext, styleProfile, contextData, topic, depth, customPrompt = '') => {
  const basePrompt = buildBasePrompt(userContext, styleProfile, contextData);

  const prompt = `${basePrompt}

Generate comprehensive study notes on the topic: ${topic}

Depth Level: ${depth} (short/medium/detailed)

Requirements:
1. Follow the exact section structure: ${styleProfile?.sections?.join(', ') || ''}
2. Maintain ${styleProfile?.tone || 'academic'} tone throughout
3. Include relevant examples and key points
4. Ensure content aligns with the syllabus provided
${styleProfile?.maxWordCount ? `5. Word count should be approximately ${styleProfile.maxWordCount}` : ''}

${customPrompt && customPrompt.trim() ? `\n IMPORTANT - USER-SPECIFIED REQUIREMENTS (MUST FOLLOW):\n${customPrompt}\n\nThese instructions are CRITICAL and must be strictly adhered to in the generated content.\n` : ''}

Output format as JSON:
{
  "sections": [
    {
      "title": "Section Name",
      "content": "Section content..."
    }
  ]
}`;

  try {
    const systemInstruction = "You are an expert academic assistant. Always respond with strictly valid JSON.";
    const responseText = await internalGenerateContent(systemInstruction, prompt);

    return parseAIResponse(responseText, {
      sections: [{
        title: 'Generated Content',
        content: responseText
      }]
    });
  } catch (error) {
    console.error('AI Generation Error:', error);
    throw new Error(`Failed to generate notes: ${error.message}`);
  }
};

/**
 * Generate report
 */
export const generateReport = async (userContext, styleProfile, contextData, topic, wordCount, requiredSections, customPrompt = '') => {
  const basePrompt = buildBasePrompt(userContext, styleProfile, contextData);

  const prompt = `${basePrompt}

Generate a detailed academic report on the topic: ${topic}

Requirements:
- Word Count: ${wordCount}
- Required Sections: ${requiredSections?.join(', ')}
- Tone: ${styleProfile?.tone || 'academic'}
- Follow academic writing standards

${customPrompt && customPrompt.trim() ? `\n IMPORTANT - USER-SPECIFIED REQUIREMENTS (MUST FOLLOW):\n${customPrompt}\n\nThese instructions are CRITICAL and must be strictly adhered to in the generated content.\n` : ''}

Output format as JSON:
{
  "title": "Report Title",
  "sections": [
    {
      "title": "Section Name",
      "content": "Section content..."
    }
  ],
  "references": ["Reference 1", "Reference 2"]
}`;

  try {
    const systemInstruction = "You are an expert academic writer. Always respond with strictly valid JSON.";
    const responseText = await internalGenerateContent(systemInstruction, prompt);

    return parseAIResponse(responseText, {
      title: topic,
      sections: [{
        title: 'Content',
        content: responseText
      }],
      references: []
    });
  } catch (error) {
    console.error('AI Generation Error:', error);
    throw new Error(`Failed to generate report: ${error.message}`);
  }
};

/**
 * Normalize PPT JSON so the client always gets bullets + speakerNotes (legacy models used content/notes).
 */
const normalizePPTPayload = (parsed) => {
  if (!parsed || typeof parsed !== 'object') return parsed;
  const slides = parsed.slides;
  if (!Array.isArray(slides)) return parsed;

  parsed.slides = slides.map((slide, idx) => {
    const title = slide.title || `Slide ${idx + 1}`;
    const speakerNotes = slide.speakerNotes ?? slide.notes ?? '';

    let bullets = slide.bullets;
    if (!Array.isArray(bullets)) bullets = [];
    bullets = bullets.map((b) => String(b).trim()).filter(Boolean);

    const contentStr = typeof slide.content === 'string' ? slide.content.trim() : '';

    if (bullets.length === 0 && contentStr) {
      bullets = contentStr
        .split(/\n+/)
        .map((line) => line.replace(/^[-•*]\s*|\d+[\.)]\s*/g, '').trim())
        .filter((line) => line.length > 3);
      if (bullets.length <= 1 && contentStr.length > 80) {
        bullets = contentStr
          .split(/(?<=[.!?])\s+/)
          .map((s) => s.trim())
          .filter((s) => s.length > 15)
          .slice(0, 6);
      }
      if (bullets.length === 0) bullets = [contentStr];
    }

    if (bullets.length === 0) {
      bullets = [
        `Key ideas for "${title}" aligned with the subject context.`,
        'Add one concrete example or definition students should remember.',
        'State one takeaway or exam-relevant tip.'
      ];
    }

    return {
      slideNumber: slide.slideNumber ?? idx + 1,
      title,
      bullets,
      speakerNotes
    };
  });

  return parsed;
};

/**
 * Generate PPT outline
 */
export const generatePPT = async (userContext, styleProfile, contextData, topic, slideCount, presentationType, customPrompt = '') => {
  const basePrompt = buildBasePrompt(userContext, styleProfile, contextData);

  const prompt = `${basePrompt}

Generate a PowerPoint presentation outline on the topic: ${topic}

Requirements:
- Number of Slides: ${slideCount}
- Presentation Type: ${presentationType}
- Tone: ${styleProfile?.tone || 'academic'}
- Each slide MUST include a "bullets" array with 3 to 5 items (except the opening title slide may use 2–3 short bullets for subtitle / agenda).
- Each bullet must be a complete thought: one or two short sentences, suitable to read on a slide (not just a topic label).
- Use clear, exam-oriented language where appropriate.
- Include "speakerNotes" for every slide with 1–2 sentences the presenter can say beyond the bullets (optional but strongly preferred).

${customPrompt && customPrompt.trim() ? `\n IMPORTANT - USER-SPECIFIED REQUIREMENTS (MUST FOLLOW):\n${customPrompt}\n\nThese instructions are CRITICAL and must be strictly adhered to in the generated content.\n` : ''}

Output format as JSON (use exactly these field names):
{
  "title": "Presentation Title",
  "slides": [
    {
      "slideNumber": 1,
      "title": "Slide Title",
      "bullets": ["First main point with brief explanation.", "Second point.", "Third point."],
      "speakerNotes": "Optional: what to say while showing this slide."
    }
  ]
}`;

  try {
    const systemInstruction =
      'You are an expert presentation designer. Always respond with strictly valid JSON. Every slide must include a non-empty "bullets" array with substantive points, not title-only slides.';
    const responseText = await internalGenerateContent(systemInstruction, prompt);

    const parsed = parseAIResponse(responseText, {
      title: topic,
      slides: [{
        slideNumber: 1,
        title: topic,
        bullets: [
          'Overview of the topic and why it matters for this course.',
          'Learning objectives for this deck.',
          'How this connects to your syllabus and assessments.'
        ],
        speakerNotes: 'Introduce the session and set expectations for the audience.'
      }]
    });

    return normalizePPTPayload(parsed);
  } catch (error) {
    console.error('AI Generation Error:', error);
    throw new Error(`Failed to generate PPT: ${error.message}`);
  }
};

/**
 * Coerce AI blueprint JSON into the shape stored by ExamPlan + shown in BlueprintView (units only in schema).
 */
const normalizeExamBlueprint = (parsed, subjectLabel = 'This subject') => {
  const toUnit = (u, i) => {
    const diffRaw = String(u.difficulty || u.importance || 'medium').toLowerCase();
    const difficulty = ['easy', 'medium', 'hard'].includes(diffRaw)
      ? diffRaw
      : diffRaw === 'high'
        ? 'hard'
        : diffRaw === 'low'
          ? 'easy'
          : 'medium';
    const topics = u.importantTopics ?? u.topics ?? u.subtopics;
    return {
      name: u.name || u.unitName || `Unit ${i + 1}`,
      weightage: Number(u.weightage ?? u.estimatedMarks ?? 20) || 20,
      difficulty,
      frequency: Number(u.frequency ?? u.questionCount ?? u.estimatedQuestions ?? 5) || 5,
      importantTopics: Array.isArray(topics)
        ? topics.map((t) => (typeof t === 'string' ? t : t?.name || String(t))).filter(Boolean)
        : []
    };
  };

  if (!parsed || typeof parsed !== 'object') {
    return { units: [] };
  }

  if (Array.isArray(parsed.units) && parsed.units.length > 0) {
    return { units: parsed.units.map(toUnit) };
  }

  if (Array.isArray(parsed.topics) && parsed.topics.length > 0) {
    return {
      units: parsed.topics.map((t, i) =>
        toUnit(
          {
            name: t.name,
            weightage: t.estimatedMarks,
            difficulty: t.importance,
            frequency: t.estimatedMarks ? Math.max(1, Math.round(Number(t.estimatedMarks) / 7)) : 4,
            importantTopics: [t.name, ...(Array.isArray(t.subtopics) ? t.subtopics : [])].filter(Boolean)
          },
          i
        )
      )
    };
  }

  return {
    units: [
      {
        name: `${subjectLabel} — syllabus overview`,
        weightage: 25,
        difficulty: 'medium',
        frequency: 5,
        importantTopics: Array.isArray(parsed.focusAreas)
          ? parsed.focusAreas
          : typeof parsed.strategy === 'string' && parsed.strategy.length > 0
            ? [parsed.strategy.slice(0, 200)]
            : ['Review full syllabus and past questions']
      }
    ]
  };
};

/**
 * Generate exam blueprint
 */
export const generateExamBlueprint = async (userContext, contextData) => {
  const prompt = `You are an exam planning expert for university students.

User Context:
- University: ${userContext.university}
- Branch: ${userContext.branch}
- Semester: ${userContext.semester}
- Subject: ${userContext.subject}

Syllabus Context:
${contextData?.syllabus ? contextData.syllabus.substring(0, 3000) : 'No syllabus provided'}

Generate a comprehensive exam blueprint broken into syllabus units or major topics.

Output STRICTLY as JSON with this shape (field names must match exactly):
{
  "units": [
    {
      "name": "Unit or module title",
      "weightage": 25,
      "difficulty": "easy",
      "frequency": 4,
      "importantTopics": ["Subtopic A", "Subtopic B", "Subtopic C"]
    }
  ]
}

Rules:
- Provide 4–8 units when possible (fewer if the syllabus is tiny).
- weightage: approximate exam weight 0–100 per unit (totals may exceed 100 slightly; prioritize relative weights).
- difficulty: only "easy", "medium", or "hard".
- frequency: typical number of exam questions or parts expected from this unit.
- importantTopics: 3–8 concise strings per unit.`;

  try {
    const systemInstruction =
      'You are an expert exam strategist. Always respond with strictly valid JSON. The root object MUST include a non-empty "units" array.';
    const responseText = await internalGenerateContent(systemInstruction, prompt, { maxTokens: 4096 });

    const parsed = parseAIResponse(responseText, { units: [] });
    const normalized = normalizeExamBlueprint(parsed, userContext.subject || 'Subject');
    if (!normalized.units?.length) {
      normalized.units = [
        {
          name: `${userContext.subject} — full syllabus`,
          weightage: 100,
          difficulty: 'medium',
          frequency: 10,
          importantTopics: ['Use syllabus and notes to prioritize all units']
        }
      ];
    }
    return normalized;
  } catch (error) {
    console.error('AI Generation Error:', error);
    throw new Error(`Failed to generate exam blueprint: ${error.message}`);
  }
};

/**
 * Generate revision planner
 */
export const generateRevisionPlanner = async (userContext, contextData, examDate, hoursPerDay, blueprint) => {
  const prompt = `You are a study planning expert for university students.

User Context:
- University: ${userContext.university}
- Branch: ${userContext.branch}
- Semester: ${userContext.semester}
- Subject: ${userContext.subject}

Exam Date: ${examDate}
Hours available per day: ${hoursPerDay}

${blueprint ? `Blueprint: ${JSON.stringify(blueprint).substring(0, 1000)}` : ''}

Generate a day-by-day revision plan.

Output format as JSON:
{
  "days": [
    {
      "day": 1,
      "date": "2024-01-15",
      "topics": ["Topic 1", "Topic 2"],
      "tasks": ["Read notes", "Solve problems"],
      "hours": 4
    }
  ],
  "tips": ["Tip 1", "Tip 2"]
}`;

  try {
    const systemInstruction = "You are an expert study planner. Always respond with strictly valid JSON.";
    const responseText = await internalGenerateContent(systemInstruction, prompt);

    return parseAIResponse(responseText, {
      days: [],
      tips: []
    });
  } catch (error) {
    console.error('AI Generation Error:', error);
    throw new Error(`Failed to generate revision planner: ${error.message}`);
  }
};

/**
 * Coerce rapid-revision JSON into stable arrays + { term, definition } definitions.
 */
const normalizeRapidRevisionSheets = (parsed) => {
  const asStringArray = (val) => {
    if (val == null) return [];
    if (Array.isArray(val)) {
      return val.map((x) => (typeof x === 'string' ? x.trim() : x != null ? String(x).trim() : '')).filter(Boolean);
    }
    if (typeof val === 'string' && val.trim()) return [val.trim()];
    return [];
  };

  const normalizeDefinition = (d) => {
    if (d == null) return null;
    if (typeof d === 'string') {
      const m = d.match(/^([^:]{1,120}):\s*(.+)$/s);
      if (m) return { term: m[1].trim(), definition: m[2].trim() };
      return { term: 'Definition', definition: d.trim() };
    }
    if (typeof d === 'object' && d.term != null) {
      return {
        term: String(d.term).trim(),
        definition: String(d.definition ?? d.text ?? '').trim()
      };
    }
    return null;
  };

  if (!parsed || typeof parsed !== 'object') {
    return { keyPoints: [], formulae: [], definitions: [] };
  }

  let keyPoints = asStringArray(parsed.keyPoints ?? parsed.points ?? parsed.key_points);
  let formulae = asStringArray(parsed.formulae ?? parsed.formulas ?? parsed.formula);
  let rawDefs = parsed.definitions ?? parsed.terms;
  if (!Array.isArray(rawDefs)) rawDefs = rawDefs ? [rawDefs] : [];
  const definitions = rawDefs.map(normalizeDefinition).filter(Boolean);

  if (keyPoints.length === 0 && typeof parsed.summary === 'string' && parsed.summary.trim()) {
    keyPoints = parsed.summary
      .split(/\n+/)
      .map((l) => l.replace(/^[-•*]\s*/, '').trim())
      .filter((l) => l.length > 5);
  }

  return { keyPoints, formulae, definitions };
};

/**
 * Generate rapid revision sheets
 */
export const generateRapidRevisionSheets = async (userContext, styleProfile, contextData, topics) => {
  const basePrompt = buildBasePrompt(userContext, styleProfile, contextData);
  const topicLine =
    topics && topics.length > 0 ? topics.join(', ') : 'All major topics from the syllabus/context above';

  const prompt = `${basePrompt}

Generate quick revision sheets for rapid exam learning.

Focus topics: ${topicLine}

Requirements:
- keyPoints: 12–24 bullets (complete short sentences, not single words).
- formulae: every important equation or expression as its own string (use plain text or LaTeX-style if needed).
- definitions: 8–16 entries as objects with "term" and "definition" (definition: 1–3 sentences each).

Output STRICTLY as JSON:
{
  "keyPoints": ["...", "..."],
  "formulae": ["...", "..."],
  "definitions": [
    { "term": "Term or concept", "definition": "Clear exam-ready definition." }
  ]
}`;

  try {
    const systemInstruction =
      'You are an expert academic assistant. Always respond with strictly valid JSON. Do not truncate lists: include full arrays. Every definition must be an object with "term" and "definition".';
    const responseText = await internalGenerateContent(systemInstruction, prompt, { maxTokens: 8192 });

    const parsed = parseAIResponse(responseText, {
      keyPoints: [],
      formulae: [],
      definitions: []
    });
    return normalizeRapidRevisionSheets(parsed);
  } catch (error) {
    console.error('AI Generation Error:', error);
    throw new Error(`Failed to generate revision sheets: ${error.message}`);
  }
};

/**
 * Quick revision from free-text prompt (no files) — key points, definitions, and N review Q&As
 */
export const generateQuickRevisionFromPrompt = async (
  userContext,
  styleProfile,
  { topicDescription, questionCount, extraDetails }
) => {
  const notesBlock = `USER TOPIC / CONTEXT (primary source):\n${topicDescription || 'General revision'}\n\nEXTRA DETAILS / CONSTRAINTS:\n${extraDetails || 'None'}`;

  const contextData = {
    syllabus: '',
    notes: notesBlock,
    pyq: '',
  };

  const basePrompt = buildBasePrompt(userContext, styleProfile, contextData);
  const n = Math.min(Math.max(parseInt(String(questionCount), 10) || 5, 1), 25);

  const prompt = `${basePrompt}

Generate **quick revision notes** for rapid exam prep based ONLY on the topic/context above. Do not assume unseen PDFs or images.

Requirements:
- Bullet-style key points, important formulae (if relevant), and short definitions.
- Include exactly ${n} review questions with concise model answers (mix recall + short application).
- Stay within the user's stated topic and extra details.

Output format as JSON:
{
  "keyPoints": ["..."],
  "formulae": ["..."],
  "definitions": ["..."],
  "reviewQuestions": [
    { "question": "...", "answer": "..." }
  ]
}`;

  try {
    const systemInstruction = 'You are an expert academic assistant. Always respond with strictly valid JSON.';
    const responseText = await internalGenerateContent(systemInstruction, prompt);

    return parseAIResponse(responseText, {
      keyPoints: [],
      formulae: [],
      definitions: [],
      reviewQuestions: [],
    });
  } catch (error) {
    console.error('AI Generation Error:', error);
    throw new Error(`Failed to generate quick revision: ${error.message}`);
  }
};

const countWords = (s) => (typeof s === 'string' ? s.trim().split(/\s+/).filter(Boolean).length : 0);

/**
 * Trim over-long short answers; keep long answers as returned. Order: shorts then longs, capped to requested counts.
 */
const normalizeMockPaperQuestions = (parsed, shortCount, longCount) => {
  const raw = parsed?.questions;
  if (!Array.isArray(raw)) return { questions: [] };

  const cleaned = raw.map((q, i) => {
    const type = q.type === 'long' ? 'long' : 'short';
    let answer = typeof q.answer === 'string' ? q.answer.trim() : '';
    const questionText = typeof q.question === 'string' ? q.question.trim() : `Question ${i + 1}`;

    if (type === 'short' && answer) {
      if (countWords(answer) > 220 || answer.length > 1400) {
        const sentences = answer.split(/(?<=[.!?])\s+/).filter((x) => x.length > 0);
        answer = sentences.slice(0, 5).join(' ').trim();
      }
    }

    return { type, question: questionText, answer };
  });

  const shorts = cleaned.filter((q) => q.type === 'short');
  const longs = cleaned.filter((q) => q.type === 'long');
  return {
    questions: [...shorts.slice(0, shortCount), ...longs.slice(0, longCount)]
  };
};

/**
 * Generate mock paper
 */
export const generateMockPaper = async (userContext, styleProfile, contextData, shortCount, longCount) => {
  const basePrompt = buildBasePrompt(userContext, styleProfile, contextData);
  const s = Math.min(Math.max(Number(shortCount) || 5, 0), 20);
  const l = Math.min(Math.max(Number(longCount) || 3, 0), 10);

  const prompt = `${basePrompt}

Generate a mock exam paper for this subject.

EXACT COUNTS (must match):
- Exactly ${s} questions with "type": "short"
- Exactly ${l} questions with "type": "long"
- Total questions in the array: ${s + l}
- Order: list ALL short questions first (increasing difficulty within short), then ALL long questions (more analytical / multi-part).

SHORT-answer rules:
- Questions: 1–3 sentences, test recall, definitions, short calculations, or "state / list / briefly explain".
- Answers: **concise**: about 80–220 words OR 3–5 short bullet-style sentences. Do NOT write long essays for short answers.
- Difficulty: mostly "standard" exam level; at most one slightly trickier short question.

LONG-answer rules:
- Questions: multi-part or "discuss / explain in detail / compare / design" style; may include sub-questions (a), (b).
- Answers: **substantial**: at least 350–600 words of meaningful content, structured with clear paragraphs or numbered points (Introduction, main body with depth, conclusion).
- Difficulty: require reasoning, comparison, or synthesis — clearly harder and deeper than short questions.

Tone for all answers: ${styleProfile?.tone || 'academic'}.
Use sections where helpful for long answers: ${styleProfile?.sections?.join(', ') || 'Definition, Explanation, Examples, Conclusion'}.

Output STRICTLY as JSON:
{
  "questions": [
    { "type": "short", "question": "...", "answer": "..." },
    { "type": "long", "question": "...", "answer": "..." }
  ]
}`;

  try {
    const systemInstruction =
      'You are an expert academic examiner. Always respond with strictly valid JSON. Short and long questions must be obviously different in depth; short answers must be brief, long answers must be long and structured.';
    const responseText = await internalGenerateContent(systemInstruction, prompt, { maxTokens: 16384 });

    const parsed = parseAIResponse(responseText, { questions: [] });
    return normalizeMockPaperQuestions(parsed, s, l);
  } catch (error) {
    console.error('AI Generation Error:', error);
    throw new Error(`Failed to generate mock paper: ${error.message}`);
  }
};
