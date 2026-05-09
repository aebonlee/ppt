import type { GenerateRequest } from '../types';

// JSON schema definition for AI output
const SLIDE_JSON_SCHEMA = `{
  "title": "string - presentation title",
  "description": "string - short description",
  "slides": [
    {
      "type": "cover | toc | section-cover | content | diagram | workbook | summary | back-cover",
      "title": "string",
      "subtitle": "string (optional)",
      "partNumber": "number (optional)",
      "partTitle": "string (optional)",
      "chapterNumber": "number (optional)",
      "chapterTitle": "string (optional)",
      "pageNumber": "number",
      "headline": "string (for cover slides)",
      "categoryChip": "string (for cover)",
      "modules": [{ "unitNumber": "string", "title": "string" }],
      "partIndex": [{ "partNumber": "string", "title": "string" }],
      "publisherInfo": { "left": "string", "right": "string" },
      "tocSections": [{ "partNumber": "string", "partTitle": "string", "items": [{ "number": "string", "title": "string", "page": "string" }] }],
      "howToUse": "string",
      "chapters": [{ "number": "number", "title": "string", "description": "string" }],
      "sections": [{
        "subTitle": "string",
        "keyTopic": "string",
        "body": "string (can include \\n for line breaks)",
        "table": { "headers": ["string"], "rows": [["string"]] },
        "codeBlock": { "label": "string", "title": "string", "content": "string" },
        "keyPoint": { "type": "key-point | caution | tip", "title": "string", "content": "string" }
      }],
      "footnote": "string",
      "diagramCards": [{ "title": "string", "headerColor": "string (hex)", "items": [{ "label": "string", "value": "string" }], "difficulty": "string" }],
      "listItems": [{ "label": "string", "description": "string" }],
      "stepNumber": "number",
      "stepLabel": "string",
      "learningObjective": "string",
      "scenario": "string",
      "steps": [{ "number": "number", "title": "string", "description": "string" }],
      "checklist": [{ "label": "string", "options": ["string"] }],
      "caution": "string",
      "workbookCode": { "label": "string", "title": "string", "content": "string" },
      "summaryHeadline": "string",
      "summaryItems": [{ "partLabel": "string", "title": "string", "description": "string" }],
      "fromHere": "string"
    }
  ]
}`;

export function buildSystemPrompt(request: GenerateRequest): string {
  const lang = request.language === 'ko' ? '한국어' : 'English';
  return `You are a professional presentation content generator. Create structured JSON data for a presentation.

RULES:
1. Respond ONLY with valid JSON matching the schema below. No markdown, no code fences, no explanation.
2. Language: ${lang}
3. Every slide must have a "type" field and a "pageNumber" field.
4. The first slide must be type "cover". The last slide should be type "back-cover" or "summary".
5. Include a "toc" slide after the cover if slideCount >= 8.
6. Use "section-cover" to introduce each major part/section.
7. "content" slides are the main body slides with sections array.
8. Use "diagram" slides for comparisons, matrices, or visual concepts.
9. Use "workbook" slides for exercises or hands-on activities (optional, for educational content).
10. End with a "summary" slide before the back-cover.
11. Keep text concise - each body text should be 2-4 sentences maximum.
12. For keyPoint, use type "key-point" for important facts, "caution" for warnings, "tip" for helpful hints.

JSON SCHEMA:
${SLIDE_JSON_SCHEMA}

${request.additionalInstructions ? `ADDITIONAL INSTRUCTIONS: ${request.additionalInstructions}` : ''}`;
}

export function buildUserPrompt(request: GenerateRequest): string {
  let prompt = `Create a presentation about: "${request.topic}"

Requirements:
- Total slides: ${request.slideCount}
- Orientation: ${request.orientation} (${request.orientation === 'portrait' ? '794x1123px' : '1123x794px'})
- Slide type distribution: 1 cover + appropriate body slides + 1 summary/back-cover`;

  if (request.referenceContent) {
    const trimmed = request.referenceContent.substring(0, 8000);
    prompt += `

REFERENCE MATERIAL (use this as the basis for content):
---
${trimmed}
---
Use the above reference material to structure and populate the slides. Maintain the key points, data, and flow from the original content.`;
  }

  prompt += '\n\nGenerate the JSON now.';
  return prompt;
}
