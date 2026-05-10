// Supabase Edge Function: ppt-generate
// Calls OpenAI or Claude API using server-side API keys
// Deploy: supabase functions deploy ppt-generate
// Secrets needed: OPENAI_API_KEY, ANTHROPIC_API_KEY

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { engine, systemPrompt, userPrompt } = await req.json();

    if (!engine || !systemPrompt || !userPrompt) {
      return new Response(
        JSON.stringify({ error: 'engine, systemPrompt, userPrompt 파라미터가 필요합니다.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let result: string;

    if (engine === 'openai') {
      const apiKey = Deno.env.get('OPENAI_API_KEY');
      if (!apiKey) {
        return new Response(
          JSON.stringify({ error: '서버에 OpenAI API 키가 설정되지 않았습니다. MyPage에서 직접 API 키를 입력해 주세요.' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.7,
          max_tokens: 16000,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || `OpenAI API error: ${res.status}`);
      }

      const data = await res.json();
      result = data.choices[0].message.content;

    } else if (engine === 'claude') {
      const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
      if (!apiKey) {
        return new Response(
          JSON.stringify({ error: '서버에 Claude API 키가 설정되지 않았습니다. MyPage에서 직접 API 키를 입력해 주세요.' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 16000,
          system: systemPrompt,
          messages: [{ role: 'user', content: userPrompt }],
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || `Claude API error: ${res.status}`);
      }

      const data = await res.json();
      result = data.content[0].text;

    } else {
      return new Response(
        JSON.stringify({ error: `지원하지 않는 AI 엔진: ${engine}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('ppt-generate error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'AI 생성 중 오류가 발생했습니다.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
