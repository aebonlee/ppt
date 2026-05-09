import{g as p}from"./colorSchemes-ucW8M7Qu.js";const g=`{
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
}`;function d(t){return`You are a professional presentation content generator. Create structured JSON data for a presentation.

RULES:
1. Respond ONLY with valid JSON matching the schema below. No markdown, no code fences, no explanation.
2. Language: 한국어
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
${g}

${t.additionalInstructions?`ADDITIONAL INSTRUCTIONS: ${t.additionalInstructions}`:""}`}function m(t){return`Create a presentation about: "${t.topic}"

Requirements:
- Total slides: ${t.slideCount}
- Orientation: ${t.orientation} (${t.orientation==="portrait"?"794x1123px":"1123x794px"})
- Slide type distribution: 1 cover + appropriate body slides + 1 summary/back-cover

Generate the JSON now.`}async function f(t,e){const s=p(t.colorSchemeId),a=t.orientation==="portrait"?{width:794,height:1123}:{width:1123,height:794};e?.({status:"generating",progress:10,message:"AI가 프레젠테이션을 생성하고 있습니다...",totalSlides:t.slideCount});const n=d(t),i=m(t);let r;try{t.apiKey?r=await u(t.aiEngine,t.apiKey,n,i):r=await h(t.aiEngine,n,i)}catch(l){throw e?.({status:"error",progress:0,message:l.message||"AI 생성 중 오류가 발생했습니다."}),l}e?.({status:"parsing",progress:60,message:"응답을 분석하고 있습니다...",totalSlides:r.slides.length});const o=b(r.slides);e?.({status:"rendering",progress:80,message:"슬라이드를 렌더링하고 있습니다...",totalSlides:o.length});const c={title:r.title||t.topic,description:r.description,orientation:t.orientation,colorScheme:s,canvas:a,slides:o,createdAt:new Date().toISOString()};return e?.({status:"complete",progress:100,message:"프레젠테이션이 생성되었습니다!",totalSlides:o.length}),c}async function u(t,e,s,a){if(t==="openai"){const n=await fetch("https://api.openai.com/v1/chat/completions",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${e}`},body:JSON.stringify({model:"gpt-4o",messages:[{role:"system",content:s},{role:"user",content:a}],response_format:{type:"json_object"},temperature:.7,max_tokens:16e3})});if(!n.ok){const r=await n.json().catch(()=>({}));throw new Error(r.error?.message||`OpenAI API error: ${n.status}`)}const i=await n.json();return JSON.parse(i.choices[0].message.content)}else{const n=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json","x-api-key":e,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:16e3,system:s,messages:[{role:"user",content:a}]})});if(!n.ok){const c=await n.json().catch(()=>({}));throw new Error(c.error?.message||`Claude API error: ${n.status}`)}const r=(await n.json()).content[0].text,o=r.match(/```(?:json)?\s*([\s\S]*?)```/)||[null,r];return JSON.parse(o[1].trim())}}async function h(t,e,s){throw new Error("Supabase가 설정되지 않았습니다.")}function b(t){if(!Array.isArray(t)||t.length===0)throw new Error("유효한 슬라이드 데이터가 없습니다.");return t.map((e,s)=>({...e,type:e.type||"content",pageNumber:e.pageNumber||s+1}))}async function w(t){throw new Error("Supabase가 설정되지 않았습니다.")}async function S(){return[]}async function v(t){throw new Error("Supabase가 설정되지 않았습니다.")}async function k(t){throw new Error("Supabase가 설정되지 않았습니다.")}export{v as a,k as d,f as g,S as l,w as s};
