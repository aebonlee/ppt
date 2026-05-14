import{g as m}from"./colorSchemes-ucW8M7Qu.js";import{g as l,c as h,d as f}from"./index-k6djGyTR.js";const w=`{
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
}`;function y(t){return`You are a professional presentation content generator. Create structured JSON data for a presentation.

RULES:
1. Respond ONLY with valid JSON matching the schema below. No markdown, no code fences, no explanation.
2. Language: ${t.language==="ko"?"한국어":"English"}
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
${w}

${t.additionalInstructions?`ADDITIONAL INSTRUCTIONS: ${t.additionalInstructions}`:""}`}function b(t){let e=`Create a presentation about: "${t.topic}"

Requirements:
- Total slides: ${t.slideCount}
- Orientation: ${t.orientation} (${t.orientation==="portrait"?"794x1123px":"1123x794px"})
- Slide type distribution: 1 cover + appropriate body slides + 1 summary/back-cover`;if(t.referenceContent){const n=t.referenceContent.substring(0,8e3);e+=`

REFERENCE MATERIAL (use this as the basis for content):
---
${n}
---
Use the above reference material to structure and populate the slides. Maintain the key points, data, and flow from the original content.`}return e+=`

Generate the JSON now.`,e}function g(t){try{return JSON.parse(t.trim())}catch{}const e=t.match(/```(?:json)?\s*([\s\S]*?)```/);if(e)try{return JSON.parse(e[1].trim())}catch{}const n=t.indexOf("{"),i=t.lastIndexOf("}");if(n!==-1&&i>n)try{return JSON.parse(t.slice(n,i+1))}catch{}throw new Error("AI 응답에서 유효한 JSON을 추출할 수 없습니다. 다시 시도해 주세요.")}async function v(t,e){const n=m(t.colorSchemeId),i=t.orientation==="portrait"?{width:794,height:1123}:{width:1123,height:794};if(!t.topic?.trim()){const d=new Error("프레젠테이션 주제를 입력해 주세요.");throw e?.({status:"error",progress:0,message:d.message}),d}if(!t.apiKey){if(!l()){const a=new Error("API 키가 필요합니다. 설정에서 API 키를 입력하거나 MyPage에서 저장하세요.");throw e?.({status:"error",progress:0,message:a.message}),a}try{const a=await h(t.aiEngine,t.slideCount);if(!a.allowed){const u=new Error(`토큰이 부족합니다. 필요: ${a.required.toLocaleString()}토큰, 잔여: ${a.remaining.toLocaleString()}토큰. 요금제를 업그레이드하거나 직접 API 키를 사용하세요.`);throw e?.({status:"error",progress:0,message:u.message}),u}}catch(a){if(a.message?.includes("토큰이 부족합니다"))throw a}}e?.({status:"generating",progress:10,message:"AI가 프레젠테이션을 생성하고 있습니다...",totalSlides:t.slideCount});const r=y(t),c=b(t);let s;try{t.apiKey?s=await E(t.aiEngine,t.apiKey,r,c):s=await S(t.aiEngine,r,c)}catch(d){const a=I(d);throw e?.({status:"error",progress:0,message:a}),new Error(a)}e?.({status:"parsing",progress:60,message:"응답을 분석하고 있습니다...",totalSlides:s.slides.length});const o=A(s.slides);e?.({status:"rendering",progress:80,message:"슬라이드를 렌더링하고 있습니다...",totalSlides:o.length});const p={title:s.title||t.topic,description:s.description,orientation:t.orientation,colorScheme:n,designTemplateId:t.designTemplateId,canvas:i,slides:o,createdAt:new Date().toISOString()};if(!t.apiKey)try{await f("generate",t.aiEngine,o.length)}catch{}return e?.({status:"complete",progress:100,message:"프레젠테이션이 생성되었습니다!",totalSlides:o.length}),p}async function E(t,e,n,i){if(!e?.trim())throw new Error("API 키가 비어있습니다. MyPage에서 API 키를 입력해 주세요.");try{if(t==="openai"){const r=await fetch("https://api.openai.com/v1/chat/completions",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${e}`},body:JSON.stringify({model:"gpt-4o",messages:[{role:"system",content:n},{role:"user",content:i}],response_format:{type:"json_object"},temperature:.7,max_tokens:16e3})});if(!r.ok){const o=await r.json().catch(()=>({}));throw new Error(o.error?.message||`OpenAI API error: ${r.status}`)}const s=(await r.json()).choices?.[0]?.message?.content;if(!s)throw new Error("OpenAI 응답이 비어있습니다. 다시 시도해 주세요.");return g(s)}else{const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json","x-api-key":e,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:16e3,system:n,messages:[{role:"user",content:i}]})});if(!r.ok){const o=await r.json().catch(()=>({}));throw new Error(o.error?.message||`Claude API error: ${r.status}`)}const s=(await r.json()).content?.[0]?.text;if(!s)throw new Error("Claude 응답이 비어있습니다. 다시 시도해 주세요.");return g(s)}}catch(r){throw r.name==="TypeError"&&r.message==="Failed to fetch"?new Error(`${t==="openai"?"OpenAI":"Claude"} API 서버에 연결할 수 없습니다. 네트워크를 확인해 주세요.`):r}}async function S(t,e,n){const i=l();if(!i)throw new Error("Supabase가 설정되지 않았습니다. 환경 변수를 확인해 주세요.");try{const{data:r,error:c}=await i.functions.invoke("ppt-generate",{body:{engine:t,systemPrompt:e,userPrompt:n}});if(c){const o=c.message||"";throw o.includes("not found")||o.includes("404")||o.includes("Function not found")?new Error("서버 AI 기능이 아직 설정되지 않았습니다. MyPage에서 직접 API 키를 입력하고 사용해 주세요."):new Error(o||"Edge Function 호출 실패")}if(r?.error)throw new Error(r.error);if(!r?.result)throw new Error("AI 응답이 비어있습니다. 다시 시도해 주세요.");const s=typeof r.result=="string"?r.result:JSON.stringify(r.result);return g(s)}catch(r){throw r.message?.includes("Failed to fetch")||r.message?.includes("NetworkError")?new Error("서버 연결에 실패했습니다. MyPage에서 API 키를 직접 입력하고 사용해 주세요."):r}}function I(t){const e=t?.message||"";return e.includes("401")||e.includes("Unauthorized")||e.includes("Invalid API Key")||e.includes("invalid_api_key")?"API 키가 유효하지 않습니다. MyPage에서 올바른 키를 입력해 주세요.":e.includes("429")||e.includes("Rate limit")||e.includes("rate_limit")?"API 호출 한도를 초과했습니다. 잠시 후 다시 시도해 주세요.":e.includes("403")||e.includes("Forbidden")?"API 접근이 거부되었습니다. API 키 권한을 확인해 주세요.":e.includes("insufficient_quota")||e.includes("billing")?"API 사용량이 초과되었습니다. API 제공자의 결제 설정을 확인해 주세요.":e.includes("JSON")||e.includes("SyntaxError")||e.includes("Unexpected token")?"AI 응답을 처리하는 중 오류가 발생했습니다. 다시 시도해 주세요.":e.includes("Failed to fetch")||e.includes("NetworkError")||e.includes("CORS")?"네트워크 오류가 발생했습니다. 인터넷 연결을 확인하고 다시 시도해 주세요.":e.includes("Edge Function")||e.includes("not found")||e.includes("Function not found")?"서버 AI 기능이 설정되지 않았습니다. MyPage에서 직접 API 키를 입력해 주세요.":/[가-힣]/.test(e)?e:`AI 생성 중 오류: ${e||"알 수 없는 오류가 발생했습니다."}`}function A(t){if(!Array.isArray(t)||t.length===0)throw new Error("유효한 슬라이드 데이터가 없습니다.");return t.map((e,n)=>({...e,type:e.type||"content",pageNumber:e.pageNumber||n+1}))}async function _(t){const e=l();if(!e)throw new Error("Supabase가 설정되지 않았습니다.");const{data:{user:n}}=await e.auth.getUser();if(!n)throw new Error("로그인이 필요합니다. 저장하려면 로그인해 주세요.");const{data:i,error:r}=await e.from("ppt_presentations").insert({user_id:n.id,title:t.title,description:t.description||"",orientation:t.orientation,color_scheme_id:t.colorScheme.id,data_json:t,slide_count:t.slides.length}).select("id").single();if(r)throw r.message?.includes("relation")&&r.message?.includes("does not exist")?new Error("ppt_presentations 테이블이 없습니다. Supabase에서 마이그레이션 SQL을 실행해 주세요."):new Error("저장 실패: "+r.message);return i.id}async function O(){const t=l();if(!t)return[];const{data:{user:e}}=await t.auth.getUser();if(!e)return[];const{data:n,error:i}=await t.from("ppt_presentations").select("id, title, description, orientation, color_scheme_id, slide_count, created_at, updated_at").eq("user_id",e.id).order("created_at",{ascending:!1});if(i)throw new Error("로딩 실패: "+i.message);return n||[]}async function P(t){const e=l();if(!e)throw new Error("Supabase가 설정되지 않았습니다.");const{data:n,error:i}=await e.from("ppt_presentations").select("data_json").eq("id",t).single();if(i)throw new Error("로딩 실패: "+i.message);return n.data_json}async function C(t){const e=l();if(!e)throw new Error("Supabase가 설정되지 않았습니다.");const{error:n}=await e.from("ppt_presentations").delete().eq("id",t);if(n)throw new Error("삭제 실패: "+n.message)}export{P as a,C as d,v as g,O as l,_ as s};
