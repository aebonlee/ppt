import type { GenerateRequest } from '../types';

// JSON schema definition for AI output
const SLIDE_JSON_SCHEMA = `{
  "title": "string - presentation title",
  "description": "string - short description",
  "slides": [
    {
      "type": "cover | toc | section-cover | content | diagram | workbook | summary | back-cover | column-chart | line-chart | pie-chart | bubble-chart | kpi-dashboard | comparison-table | bcg-matrix | priority-matrix | assessment-table | org-chart | timeline | roadmap | process-flow | quote | two-column | three-column | stat-card",
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
      "fromHere": "string",

      "chartConfig": {
        "type": "column | line | pie | bubble | bar",
        "title": "string (optional)",
        "categories": ["string"],
        "series": [{ "name": "string", "data": [number], "color": "string (optional hex)" }],
        "xAxisLabel": "string (optional)",
        "yAxisLabel": "string (optional)",
        "showLegend": "boolean (optional, default true)"
      },
      "kpiMetrics": [{ "label": "string", "value": "string", "unit": "string (optional)", "trend": "up | down | neutral (optional)", "trendValue": "string (optional)" }],
      "matrixConfig": {
        "type": "bcg | priority | custom",
        "xAxisLabel": "string (optional)",
        "yAxisLabel": "string (optional)",
        "quadrants": [{ "label": "string", "description": "string (optional)" }],
        "items": [{ "label": "string", "x": "number (0-100)", "y": "number (0-100)", "size": "number (optional)" }]
      },
      "timelineEvents": [{ "date": "string", "title": "string", "description": "string (optional)", "status": "completed | in-progress | planned (optional)" }],
      "orgChart": { "name": "string", "title": "string (optional)", "children": [{ "name": "string", "title": "string", "children": [] }] },
      "processSteps": [{ "label": "string", "description": "string (optional)", "type": "start | process | decision | end (optional)" }],
      "quote": { "text": "string", "author": "string (optional)", "source": "string (optional)" },
      "columns": [{ "title": "string (optional)", "body": "string (optional)", "icon": "string (optional)", "items": ["string"] }],
      "statHighlight": [{ "value": "string", "label": "string", "description": "string (optional)", "color": "string (optional hex)" }],
      "comparisonHeaders": ["string"],
      "comparisonRows": [{ "label": "string", "values": ["string"] }]
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

ADVANCED SLIDE TYPE SELECTION RULES:
13. When presenting numerical data or statistics, prefer chart slides:
    - "column-chart" for comparing quantities across categories
    - "line-chart" for trends over time
    - "pie-chart" for showing proportions/market share
    - "bubble-chart" for multi-dimensional comparisons
14. When presenting key metrics or KPIs, use "kpi-dashboard" (3-6 metrics with trends).
15. When comparing options/products/services side-by-side, use "comparison-table".
16. For strategic positioning analysis, use "bcg-matrix" or "priority-matrix".
17. For scoring/evaluation criteria, use "assessment-table".
18. For organizational hierarchy or team structure, use "org-chart".
19. For chronological events or milestones, use "timeline".
20. For future plans or project phases, use "roadmap".
21. For step-by-step processes or workflows, use "process-flow".
22. For impactful quotes or testimonials, use "quote".
23. For presenting 2-3 parallel concepts/pillars, use "two-column" or "three-column".
24. For highlighting 1-4 key statistics with large numbers, use "stat-card".
25. Mix slide types for variety. Avoid more than 3 consecutive "content" slides.
26. For chart slides, always provide realistic sample data in chartConfig.series.
27. For matrix slides, place 3-6 items with x/y coordinates (0-100 scale).
28. For timeline/roadmap, provide 4-8 events with dates and status.

JSON SCHEMA:
${SLIDE_JSON_SCHEMA}

${request.additionalInstructions ? `ADDITIONAL INSTRUCTIONS: ${request.additionalInstructions}` : ''}`;
}

export function buildUserPrompt(request: GenerateRequest): string {
  let prompt = `Create a presentation about: "${request.topic}"

Requirements:
- Total slides: ${request.slideCount}
- Orientation: ${request.orientation} (${request.orientation === 'portrait' ? '794x1123px' : '1123x794px'})
- Slide type distribution: 1 cover + appropriate body slides + 1 summary/back-cover
- Use a diverse mix of slide types (charts, tables, timelines, etc.) where appropriate for the content`;

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
