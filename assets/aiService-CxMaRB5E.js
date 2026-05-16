import{g as u}from"./colorSchemes-ucW8M7Qu.js";import{g as p,f as h,h as f}from"./index-MdBiNIov.js";const S=`{
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
}`;function w(e){return`You are a professional presentation content generator. Create structured JSON data for a presentation.

RULES:
1. Respond ONLY with valid JSON matching the schema below. No markdown, no code fences, no explanation.
2. Language: ${e.language==="ko"?"한국어":"English"}
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
${S}

${e.additionalInstructions?`ADDITIONAL INSTRUCTIONS: ${e.additionalInstructions}`:""}`}function I(e){let t=`Create a presentation about: "${e.topic}"

Requirements:
- Total slides: ${e.slideCount}
- Orientation: ${e.orientation} (${e.orientation==="portrait"?"794x1123px":"1123x794px"})
- Slide type distribution: 1 cover + appropriate body slides + 1 summary/back-cover
- Use a diverse mix of slide types (charts, tables, timelines, etc.) where appropriate for the content`;if(e.referenceContent){const i=e.referenceContent.substring(0,8e3);t+=`

REFERENCE MATERIAL (use this as the basis for content):
---
${i}
---
Use the above reference material to structure and populate the slides. Maintain the key points, data, and flow from the original content.`}return t+=`

Generate the JSON now.`,t}function A(e,t){const i=t.slides.map(r=>`  - Slide ${r.index}: type="${r.suggestedType}", title="${r.title}" — ${r.description}${r.keyPoints?.length?` [Key: ${r.keyPoints.join(", ")}]`:""}`).join(`
`);let n=`Create a presentation following this EXACT outline structure.

PRESENTATION: "${t.title}"${t.subtitle?` — ${t.subtitle}`:""}
${t.targetAudience?`TARGET AUDIENCE: ${t.targetAudience}`:""}
${t.tone?`TONE: ${t.tone}`:""}

SLIDE STRUCTURE (follow exactly):
${i}

Requirements:
- Total slides: ${t.slides.length}
- Orientation: ${e.orientation} (${e.orientation==="portrait"?"794x1123px":"1123x794px"})
- Follow the slide types specified above EXACTLY
- Fill each slide with rich, detailed content appropriate for its type
- For chart slides, provide realistic data in chartConfig
- For timeline/roadmap slides, provide 4-8 events
- For matrix slides, place 3-6 items with coordinates`;if(e.referenceContent){const r=e.referenceContent.substring(0,6e3);n+=`

REFERENCE MATERIAL:
---
${r}
---
Use this material to populate slide content.`}return n+=`

Generate the full JSON now with all slide content filled in.`,n}function m(e){try{return JSON.parse(e.trim())}catch{}const t=e.match(/```(?:json)?\s*([\s\S]*?)```/);if(t)try{return JSON.parse(t[1].trim())}catch{}const i=e.indexOf("{"),n=e.lastIndexOf("}");if(i!==-1&&n>i)try{return JSON.parse(e.slice(i,n+1))}catch{}throw new Error("AI 응답에서 유효한 JSON을 추출할 수 없습니다. 다시 시도해 주세요.")}async function N(e,t){const i=u(e.colorSchemeId),n=e.orientation==="portrait"?{width:794,height:1123}:{width:1123,height:794};if(!e.topic?.trim()){const d=new Error("프레젠테이션 주제를 입력해 주세요.");throw t?.({status:"error",progress:0,message:d.message}),d}if(!e.apiKey){if(!p()){const a=new Error("API 키가 필요합니다. 설정에서 API 키를 입력하거나 MyPage에서 저장하세요.");throw t?.({status:"error",progress:0,message:a.message}),a}try{const a=await h(e.aiEngine,e.slideCount);if(!a.allowed){const l=new Error(`토큰이 부족합니다. 필요: ${a.required.toLocaleString()}토큰, 잔여: ${a.remaining.toLocaleString()}토큰. 요금제를 업그레이드하거나 직접 API 키를 사용하세요.`);throw t?.({status:"error",progress:0,message:l.message}),l}}catch(a){if(a.message?.includes("토큰이 부족합니다"))throw a}}t?.({status:"generating",progress:10,message:"AI가 프레젠테이션을 생성하고 있습니다...",totalSlides:e.slideCount});const r=w(e),c=I(e);let o;try{e.apiKey?o=await b(e.aiEngine,e.apiKey,r,c):o=await y(e.aiEngine,r,c)}catch(d){const a=v(d);throw t?.({status:"error",progress:0,message:a}),new Error(a)}t?.({status:"parsing",progress:60,message:"응답을 분석하고 있습니다...",totalSlides:o.slides.length});const s=E(o.slides);t?.({status:"rendering",progress:80,message:"슬라이드를 렌더링하고 있습니다...",totalSlides:s.length});const g={title:o.title||e.topic,description:o.description,orientation:e.orientation,colorScheme:i,designTemplateId:e.designTemplateId,canvas:n,slides:s,createdAt:new Date().toISOString()};if(!e.apiKey)try{await f("generate",e.aiEngine,s.length)}catch{}return t?.({status:"complete",progress:100,message:"프레젠테이션이 생성되었습니다!",totalSlides:s.length}),g}async function b(e,t,i,n){if(!t?.trim())throw new Error("API 키가 비어있습니다. MyPage에서 API 키를 입력해 주세요.");try{if(e==="openai"){const r=await fetch("https://api.openai.com/v1/chat/completions",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${t}`},body:JSON.stringify({model:"gpt-4o",messages:[{role:"system",content:i},{role:"user",content:n}],response_format:{type:"json_object"},temperature:.7,max_tokens:16e3})});if(!r.ok){const s=await r.json().catch(()=>({}));throw new Error(s.error?.message||`OpenAI API error: ${r.status}`)}const o=(await r.json()).choices?.[0]?.message?.content;if(!o)throw new Error("OpenAI 응답이 비어있습니다. 다시 시도해 주세요.");return m(o)}else{const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json","x-api-key":t,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:16e3,system:i,messages:[{role:"user",content:n}]})});if(!r.ok){const s=await r.json().catch(()=>({}));throw new Error(s.error?.message||`Claude API error: ${r.status}`)}const o=(await r.json()).content?.[0]?.text;if(!o)throw new Error("Claude 응답이 비어있습니다. 다시 시도해 주세요.");return m(o)}}catch(r){throw r.name==="TypeError"&&r.message==="Failed to fetch"?new Error(`${e==="openai"?"OpenAI":"Claude"} API 서버에 연결할 수 없습니다. 네트워크를 확인해 주세요.`):r}}async function y(e,t,i){const n=p();if(!n)throw new Error("Supabase가 설정되지 않았습니다. 환경 변수를 확인해 주세요.");try{const{data:r,error:c}=await n.functions.invoke("ppt-generate",{body:{engine:e,systemPrompt:t,userPrompt:i}});if(c){const s=c.message||"";throw s.includes("not found")||s.includes("404")||s.includes("Function not found")?new Error("서버 AI 기능이 아직 설정되지 않았습니다. MyPage에서 직접 API 키를 입력하고 사용해 주세요."):new Error(s||"Edge Function 호출 실패")}if(r?.error)throw new Error(r.error);if(!r?.result)throw new Error("AI 응답이 비어있습니다. 다시 시도해 주세요.");const o=typeof r.result=="string"?r.result:JSON.stringify(r.result);return m(o)}catch(r){throw r.message?.includes("Failed to fetch")||r.message?.includes("NetworkError")?new Error("서버 연결에 실패했습니다. MyPage에서 API 키를 직접 입력하고 사용해 주세요."):r}}function v(e){const t=e?.message||"";return t.includes("401")||t.includes("Unauthorized")||t.includes("Invalid API Key")||t.includes("invalid_api_key")?"API 키가 유효하지 않습니다. MyPage에서 올바른 키를 입력해 주세요.":t.includes("429")||t.includes("Rate limit")||t.includes("rate_limit")?"API 호출 한도를 초과했습니다. 잠시 후 다시 시도해 주세요.":t.includes("403")||t.includes("Forbidden")?"API 접근이 거부되었습니다. API 키 권한을 확인해 주세요.":t.includes("insufficient_quota")||t.includes("billing")?"API 사용량이 초과되었습니다. API 제공자의 결제 설정을 확인해 주세요.":t.includes("JSON")||t.includes("SyntaxError")||t.includes("Unexpected token")?"AI 응답을 처리하는 중 오류가 발생했습니다. 다시 시도해 주세요.":t.includes("Failed to fetch")||t.includes("NetworkError")||t.includes("CORS")?"네트워크 오류가 발생했습니다. 인터넷 연결을 확인하고 다시 시도해 주세요.":t.includes("Edge Function")||t.includes("not found")||t.includes("Function not found")?"서버 AI 기능이 설정되지 않았습니다. MyPage에서 직접 API 키를 입력해 주세요.":/[가-힣]/.test(t)?t:`AI 생성 중 오류: ${t||"알 수 없는 오류가 발생했습니다."}`}function E(e){if(!Array.isArray(e)||e.length===0)throw new Error("유효한 슬라이드 데이터가 없습니다.");return e.map((t,i)=>({...t,type:t.type||"content",pageNumber:t.pageNumber||i+1}))}async function C(e){const t=p();if(!t)throw new Error("Supabase가 설정되지 않았습니다.");const{data:{user:i}}=await t.auth.getUser();if(!i)throw new Error("로그인이 필요합니다. 저장하려면 로그인해 주세요.");const{data:n,error:r}=await t.from("ppt_presentations").insert({user_id:i.id,title:e.title,description:e.description||"",orientation:e.orientation,color_scheme_id:e.colorScheme.id,data_json:e,slide_count:e.slides.length}).select("id").single();if(r)throw r.message?.includes("relation")&&r.message?.includes("does not exist")?new Error("ppt_presentations 테이블이 없습니다. Supabase에서 마이그레이션 SQL을 실행해 주세요."):new Error("저장 실패: "+r.message);return n.id}async function T(){const e=p();if(!e)return[];const{data:{user:t}}=await e.auth.getUser();if(!t)return[];const{data:i,error:n}=await e.from("ppt_presentations").select("id, title, description, orientation, color_scheme_id, slide_count, created_at, updated_at").eq("user_id",t.id).order("created_at",{ascending:!1});if(n)throw new Error("로딩 실패: "+n.message);return i||[]}async function O(e){const t=p();if(!t)throw new Error("Supabase가 설정되지 않았습니다.");const{data:i,error:n}=await t.from("ppt_presentations").select("data_json").eq("id",e).single();if(n)throw new Error("로딩 실패: "+n.message);return i.data_json}async function $(e){const t=p();if(!t)throw new Error("Supabase가 설정되지 않았습니다.");const{error:i}=await t.from("ppt_presentations").delete().eq("id",e);if(i)throw new Error("삭제 실패: "+i.message)}async function P(e,t,i){const n=u(e.colorSchemeId),r=e.orientation==="portrait"?{width:794,height:1123}:{width:1123,height:794};if(!e.apiKey){if(!p())throw new Error("API 키가 필요합니다.");try{const l=await h(e.aiEngine,t.slides.length);if(!l.allowed)throw new Error(`토큰이 부족합니다. 필요: ${l.required.toLocaleString()}토큰, 잔여: ${l.remaining.toLocaleString()}토큰.`)}catch(l){if(l.message?.includes("토큰이 부족합니다"))throw l}}i?.({stage:"content",progress:40,message:"아웃라인을 기반으로 슬라이드 콘텐츠를 생성하고 있습니다...",outline:t});const c=w(e),o=A(e,t);let s;try{e.apiKey?s=await b(e.aiEngine,e.apiKey,c,o):s=await y(e.aiEngine,c,o)}catch(a){throw i?.({stage:"error",progress:0,message:a.message,outline:t}),a}i?.({stage:"refinement",progress:80,message:"슬라이드를 최적화하고 있습니다...",outline:t});const g=E(s.slides),d={title:s.title||t.title,description:s.description,orientation:e.orientation,colorScheme:n,designTemplateId:e.designTemplateId,canvas:r,slides:g,createdAt:new Date().toISOString()};if(!e.apiKey)try{await f("generate",e.aiEngine,g.length)}catch{}return i?.({stage:"complete",progress:100,message:"프레젠테이션이 생성되었습니다!",outline:t}),d}export{y as a,P as b,b as c,O as d,$ as e,N as g,T as l,C as s};
