import { SYSTEM_PROMPT, RESPONSE_SCHEMA } from '../agent/brain.js';

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400'
  };
}

function allowedOrigin(origin, env) {
  var allow = (env.ALLOWED_ORIGINS || '*').trim();
  if (allow === '*' || !origin) return origin || '*';
  var list = allow.split(',').map(function (s) { return s.trim(); });
  return list.indexOf(origin) !== -1 ? origin : list[0];
}

export default {
  async fetch(request, env) {
    var origin = allowedOrigin(request.headers.get('Origin'), env);
    var headers = corsHeaders(origin);
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: headers });
    }
    if (request.method !== 'POST') {
      return new Response('POST only', { status: 405, headers: headers });
    }
    if (!env.GEMINI_API_KEY) {
      return Response.json({ error: 'GEMINI_API_KEY not set on the Worker' }, { status: 500, headers: headers });
    }

    var body;
    try {
      body = await request.json();
    } catch (e) {
      return Response.json({ error: 'Invalid JSON' }, { status: 400, headers: headers });
    }

    var message = String(body.message || '').slice(0, 8000);
    var snapshot = String(body.snapshot || '').slice(0, 12000);
    var history = Array.isArray(body.history) ? body.history.slice(-12) : [];
    var contents = [];
    history.forEach(function (m) {
      if (!m || !m.text) return;
      contents.push({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: String(m.text).slice(0, 2000) }]
      });
    });
    if (!contents.length || contents[contents.length - 1].parts[0].text !== message) {
      contents.push({ role: 'user', parts: [{ text: message }] });
    }
    if (contents.length && contents[0].role === 'model') {
      contents.unshift({ role: 'user', parts: [{ text: 'Hi.' }] });
    }

    var models = ['gemini-2.5-flash', 'gemini-2.0-flash'];
    var lastErr = 'no model';
    for (var i = 0; i < models.length; i++) {
      var url = 'https://generativelanguage.googleapis.com/v1beta/models/' + models[i] + ':generateContent?key=' + encodeURIComponent(env.GEMINI_API_KEY);
      var res = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: SYSTEM_PROMPT + '\n\nIntent hint from the app (obey this): ' + String(body.intent || 'unknown') + '\n\nToday and week snapshot:\n' + snapshot }]
          },
          contents: contents,
          generationConfig: {
            temperature: 0.35,
            maxOutputTokens: 1400,
            responseMimeType: 'application/json',
            responseSchema: RESPONSE_SCHEMA
          }
        })
      });
      var raw = await res.text();
      if (!res.ok) {
        lastErr = models[i] + ' ' + res.status + ' ' + raw.slice(0, 180);
        if (res.status === 404 || res.status === 400) continue;
        return Response.json({ error: lastErr }, { status: 502, headers: headers });
      }
      var data;
      try {
        data = JSON.parse(raw);
      } catch (e) {
        lastErr = 'bad Gemini envelope';
        continue;
      }
      var text = ((((data.candidates || [])[0] || {}).content || {}).parts || [])
        .map(function (p) { return p.text || ''; })
        .join('');
      try {
        var parsed = JSON.parse(text);
        parsed.reply = parsed.reply || '';
        parsed.actions = parsed.actions || [];
        return Response.json(parsed, { headers: headers });
      } catch (e2) {
        lastErr = 'bad model JSON';
      }
    }
    return Response.json({ error: lastErr }, { status: 502, headers: headers });
  }
};
