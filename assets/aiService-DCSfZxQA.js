import{g as p}from"./colorSchemes-ucW8M7Qu.js";import{g as c}from"./index-BQ5VfNCG.js";const g=`{
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
}`;function u(t){return`You are a professional presentation content generator. Create structured JSON data for a presentation.

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

Generate the JSON now.`}async function S(t,e){const n=p(t.colorSchemeId),i=t.orientation==="portrait"?{width:794,height:1123}:{width:1123,height:794};e?.({status:"generating",progress:10,message:"AI가 프레젠테이션을 생성하고 있습니다...",totalSlides:t.slideCount});const r=u(t),o=m(t);let s;try{t.apiKey?s=await h(t.aiEngine,t.apiKey,r,o):s=await f(t.aiEngine,r,o)}catch(d){throw e?.({status:"error",progress:0,message:d.message||"AI 생성 중 오류가 발생했습니다."}),d}e?.({status:"parsing",progress:60,message:"응답을 분석하고 있습니다...",totalSlides:s.slides.length});const a=b(s.slides);e?.({status:"rendering",progress:80,message:"슬라이드를 렌더링하고 있습니다...",totalSlides:a.length});const l={title:s.title||t.topic,description:s.description,orientation:t.orientation,colorScheme:n,canvas:i,slides:a,createdAt:new Date().toISOString()};return e?.({status:"complete",progress:100,message:"프레젠테이션이 생성되었습니다!",totalSlides:a.length}),l}async function h(t,e,n,i){if(t==="openai"){const r=await fetch("https://api.openai.com/v1/chat/completions",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${e}`},body:JSON.stringify({model:"gpt-4o",messages:[{role:"system",content:n},{role:"user",content:i}],response_format:{type:"json_object"},temperature:.7,max_tokens:16e3})});if(!r.ok){const s=await r.json().catch(()=>({}));throw new Error(s.error?.message||`OpenAI API error: ${r.status}`)}const o=await r.json();return JSON.parse(o.choices[0].message.content)}else{const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json","x-api-key":e,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:16e3,system:n,messages:[{role:"user",content:i}]})});if(!r.ok){const l=await r.json().catch(()=>({}));throw new Error(l.error?.message||`Claude API error: ${r.status}`)}const s=(await r.json()).content[0].text,a=s.match(/```(?:json)?\s*([\s\S]*?)```/)||[null,s];return JSON.parse(a[1].trim())}}async function f(t,e,n){const i=c();if(!i)throw new Error("Supabase가 설정되지 않았습니다.");const{data:r,error:o}=await i.functions.invoke("ppt-generate",{body:{engine:t,systemPrompt:e,userPrompt:n}});if(o)throw new Error(o.message||"Edge Function 호출 실패");if(!r?.result)throw new Error("AI 응답이 비어있습니다.");return typeof r.result=="string"?JSON.parse(r.result):r.result}function b(t){if(!Array.isArray(t)||t.length===0)throw new Error("유효한 슬라이드 데이터가 없습니다.");return t.map((e,n)=>({...e,type:e.type||"content",pageNumber:e.pageNumber||n+1}))}async function v(t){const e=c();if(!e)throw new Error("Supabase가 설정되지 않았습니다.");const{data:{user:n}}=await e.auth.getUser();if(!n)throw new Error("로그인이 필요합니다.");const{data:i,error:r}=await e.from("ppt_presentations").insert({user_id:n.id,title:t.title,description:t.description||"",orientation:t.orientation,color_scheme_id:t.colorScheme.id,data_json:t,slide_count:t.slides.length}).select("id").single();if(r)throw new Error("저장 실패: "+r.message);return i.id}async function k(){const t=c();if(!t)return[];const{data:{user:e}}=await t.auth.getUser();if(!e)return[];const{data:n,error:i}=await t.from("ppt_presentations").select("id, title, description, orientation, color_scheme_id, slide_count, created_at, updated_at").eq("user_id",e.id).order("created_at",{ascending:!1});if(i)throw new Error("로딩 실패: "+i.message);return n||[]}async function N(t){const e=c();if(!e)throw new Error("Supabase가 설정되지 않았습니다.");const{data:n,error:i}=await e.from("ppt_presentations").select("data_json").eq("id",t).single();if(i)throw new Error("로딩 실패: "+i.message);return n.data_json}async function E(t){const e=c();if(!e)throw new Error("Supabase가 설정되지 않았습니다.");const{error:n}=await e.from("ppt_presentations").delete().eq("id",t);if(n)throw new Error("삭제 실패: "+n.message)}export{N as a,E as d,S as g,k as l,v as s};
