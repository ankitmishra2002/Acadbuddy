import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY || '';
const MODEL_NAME = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(API_KEY);

/**
 * Test API key function without unnecessary diagnostics
 */
export async function testAPIKey() {
  if (!API_KEY) {
    return {
      valid: false,
      error: 'GEMINI_API_KEY is not configured in .env'
    };
  }

  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const result = await model.generateContent("Say 'test' if you can read this.");
    
    if (result.response.text()) {
      return {
        valid: true,
        message: 'API key is valid and working via Google Generative AI!'
      };
    }

    return {
      valid: false,
      error: 'Empty response from Google Generative AI'
    };
  } catch (error) {
    return {
      valid: false,
      error: error.message
    };
  }
}

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
 * Internal helper to generate content using Gemini API
 */
const internalGenerateContent = async (systemInstruction, userPrompt) => {
  if (!API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured in .env');
  }

  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
    systemInstruction,
    generationConfig: {
      temperature: 0.7,
    }
  });

  const result = await model.generateContent(userPrompt);
  return result.response.text();
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

${customPrompt && customPrompt.trim() ? `\n IMPORTANT - USER-SPECIFIED REQUIREMENTS (MUST FOLLOW):\n${customPrompt}\n\nThese instructions are CRITICAL and must be strictly adhered to in the generated content.\n` : ''}

Output format as JSON:
{
  "title": "Presentation Title",
  "slides": [
    {
      "slideNumber": 1,
      "title": "Slide Title",
      "content": "Main points...",
      "notes": "Speaker notes..."
    }
  ]
}`;

  try {
    const systemInstruction = "You are an expert presentation designer. Always respond with strictly valid JSON.";
    const responseText = await internalGenerateContent(systemInstruction, prompt);

    return parseAIResponse(responseText, {
      title: topic,
      slides: [{
        slideNumber: 1,
        title: topic,
        content: responseText,
        notes: ''
      }]
    });
  } catch (error) {
    console.error('AI Generation Error:', error);
    throw new Error(`Failed to generate PPT: ${error.message}`);
  }
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

Generate a comprehensive exam blueprint/strategy.

Output format as JSON:
{
  "topics": [
    {
      "name": "Topic Name",
      "importance": "high/medium/low",
      "estimatedMarks": 20,
      "timeToStudy": "5 hours"
    }
  ],
  "strategy": "Overall exam strategy...",
  "focusAreas": ["Area 1", "Area 2"]
}`;

  try {
    const systemInstruction = "You are an expert exam strategist. Always respond with strictly valid JSON.";
    const responseText = await internalGenerateContent(systemInstruction, prompt);

    return parseAIResponse(responseText, {
      topics: [],
      strategy: responseText,
      focusAreas: []
    });
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
 * Generate rapid revision sheets
 */
export const generateRapidRevisionSheets = async (userContext, styleProfile, contextData, topics) => {
  const basePrompt = buildBasePrompt(userContext, styleProfile, contextData);

  const prompt = `${basePrompt}

Generate quick revision sheets for rapid learning.

Topics: ${topics?.join(', ')}

Requirements:
- Key points only (bullet format)
- Important formulae
- Critical definitions
- Quick tips for exam

Output format as JSON:
{
  "keyPoints": ["Point 1", "Point 2"],
  "formulae": ["Formula 1", "Formula 2"],
  "definitions": ["Definition 1", "Definition 2"]
}`;

  try {
    const systemInstruction = "You are an expert academic assistant. Always respond with strictly valid JSON.";
    const responseText = await internalGenerateContent(systemInstruction, prompt);

    return parseAIResponse(responseText, {
      keyPoints: [],
      formulae: [],
      definitions: []
    });
  } catch (error) {
    console.error('AI Generation Error:', error);
    throw new Error(`Failed to generate revision sheets: ${error.message}`);
  }
};

/**
 * Generate mock paper
 */
export const generateMockPaper = async (userContext, styleProfile, contextData, shortCount, longCount) => {
  const basePrompt = buildBasePrompt(userContext, styleProfile, contextData);

  const prompt = `${basePrompt}

Generate a mock exam paper.

Pattern:
- Short Answer Questions: ${shortCount}
- Long Answer Questions: ${longCount}

Requirements:
1. Questions should align with syllabus
2. Follow patterns from PYQs
3. Include outline answers in ${styleProfile?.tone || 'academic'} tone
4. Follow ${styleProfile?.sections?.join(', ') || ''} structure for answers

Output format as JSON:
{
  "questions": [
    {
      "type": "short",
      "question": "Question text",
      "answer": "Answer outline..."
    },
    {
      "type": "long",
      "question": "Question text",
      "answer": "Detailed answer..."
    }
  ]
}`;

  try {
    const systemInstruction = "You are an expert academic assistant. Always respond with strictly valid JSON.";
    const responseText = await internalGenerateContent(systemInstruction, prompt);

    return parseAIResponse(responseText, {
      questions: []
    });
  } catch (error) {
    console.error('AI Generation Error:', error);
    throw new Error(`Failed to generate mock paper: ${error.message}`);
  }
};
