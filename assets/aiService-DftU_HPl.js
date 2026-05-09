import{g as p}from"./colorSchemes-ucW8M7Qu.js";import{g as c}from"./index-DvJfsr4_.js";const g=`{
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
}`;function m(t){return`You are a professional presentation content generator. Create structured JSON data for a presentation.

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

${t.additionalInstructions?`ADDITIONAL INSTRUCTIONS: ${t.additionalInstructions}`:""}`}function u(t){let e=`Create a presentation about: "${t.topic}"

Requirements:
- Total slides: ${t.slideCount}
- Orientation: ${t.orientation} (${t.orientation==="portrait"?"794x1123px":"1123x794px"})
- Slide type distribution: 1 cover + appropriate body slides + 1 summary/back-cover`;if(t.referenceContent){const r=t.referenceContent.substring(0,8e3);e+=`

REFERENCE MATERIAL (use this as the basis for content):
---
${r}
---
Use the above reference material to structure and populate the slides. Maintain the key points, data, and flow from the original content.`}return e+=`

Generate the JSON now.`,e}async function S(t,e){const r=p(t.colorSchemeId),i=t.orientation==="portrait"?{width:794,height:1123}:{width:1123,height:794};e?.({status:"generating",progress:10,message:"AI가 프레젠테이션을 생성하고 있습니다...",totalSlides:t.slideCount});const n=m(t),o=u(t);let s;try{t.apiKey?s=await h(t.aiEngine,t.apiKey,n,o):s=await f(t.aiEngine,n,o)}catch(d){throw e?.({status:"error",progress:0,message:d.message||"AI 생성 중 오류가 발생했습니다."}),d}e?.({status:"parsing",progress:60,message:"응답을 분석하고 있습니다...",totalSlides:s.slides.length});const a=b(s.slides);e?.({status:"rendering",progress:80,message:"슬라이드를 렌더링하고 있습니다...",totalSlides:a.length});const l={title:s.title||t.topic,description:s.description,orientation:t.orientation,colorScheme:r,designTemplateId:t.designTemplateId,canvas:i,slides:a,createdAt:new Date().toISOString()};return e?.({status:"complete",progress:100,message:"프레젠테이션이 생성되었습니다!",totalSlides:a.length}),l}async function h(t,e,r,i){if(t==="openai"){const n=await fetch("https://api.openai.com/v1/chat/completions",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${e}`},body:JSON.stringify({model:"gpt-4o",messages:[{role:"system",content:r},{role:"user",content:i}],response_format:{type:"json_object"},temperature:.7,max_tokens:16e3})});if(!n.ok){const s=await n.json().catch(()=>({}));throw new Error(s.error?.message||`OpenAI API error: ${n.status}`)}const o=await n.json();return JSON.parse(o.choices[0].message.content)}else{const n=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json","x-api-key":e,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:16e3,system:r,messages:[{role:"user",content:i}]})});if(!n.ok){const l=await n.json().catch(()=>({}));throw new Error(l.error?.message||`Claude API error: ${n.status}`)}const s=(await n.json()).content[0].text,a=s.match(/```(?:json)?\s*([\s\S]*?)```/)||[null,s];return JSON.parse(a[1].trim())}}async function f(t,e,r){const i=c();if(!i)throw new Error("Supabase가 설정되지 않았습니다.");const{data:n,error:o}=await i.functions.invoke("ppt-generate",{body:{engine:t,systemPrompt:e,userPrompt:r}});if(o)throw new Error(o.message||"Edge Function 호출 실패");if(!n?.result)throw new Error("AI 응답이 비어있습니다.");return typeof n.result=="string"?JSON.parse(n.result):n.result}function b(t){if(!Array.isArray(t)||t.length===0)throw new Error("유효한 슬라이드 데이터가 없습니다.");return t.map((e,r)=>({...e,type:e.type||"content",pageNumber:e.pageNumber||r+1}))}async function E(t){const e=c();if(!e)throw new Error("Supabase가 설정되지 않았습니다.");const{data:{user:r}}=await e.auth.getUser();if(!r)throw new Error("로그인이 필요합니다.");const{data:i,error:n}=await e.from("ppt_presentations").insert({user_id:r.id,title:t.title,description:t.description||"",orientation:t.orientation,color_scheme_id:t.colorScheme.id,data_json:t,slide_count:t.slides.length}).select("id").single();if(n)throw new Error("저장 실패: "+n.message);return i.id}async function v(){const t=c();if(!t)return[];const{data:{user:e}}=await t.auth.getUser();if(!e)return[];const{data:r,error:i}=await t.from("ppt_presentations").select("id, title, description, orientation, color_scheme_id, slide_count, created_at, updated_at").eq("user_id",e.id).order("created_at",{ascending:!1});if(i)throw new Error("로딩 실패: "+i.message);return r||[]}async function k(t){const e=c();if(!e)throw new Error("Supabase가 설정되지 않았습니다.");const{data:r,error:i}=await e.from("ppt_presentations").select("data_json").eq("id",t).single();if(i)throw new Error("로딩 실패: "+i.message);return r.data_json}async function N(t){const e=c();if(!e)throw new Error("Supabase가 설정되지 않았습니다.");const{error:r}=await e.from("ppt_presentations").delete().eq("id",t);if(r)throw new Error("삭제 실패: "+r.message)}export{k as a,N as d,S as g,v as l,E as s};
