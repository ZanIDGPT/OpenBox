// OpenBox API - Vercel Serverless Function
// Integrates with OpenRouter.ai for AI chat completions

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages, mode = 'instant', image, modelOverride } = req.body;
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'OPENROUTER_API_KEY not configured. Please add it to Vercel Environment Variables.' });
    }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    // Model selection based on mode
    let model = modelOverride;
    let systemPrompt = '';

    if (!model) {
      switch (mode) {
        case 'thinking':
          model = 'deepseek/deepseek-r1';
          systemPrompt = `You are OpenBox, an advanced AI assistant with deep reasoning capabilities.
When responding to complex questions, first analyze and reason through the problem inside <thinking> tags.
Show your step-by-step reasoning process, considerations, and analysis.
After closing the thinking tags, provide your final, concise answer.
Example format:
<thinking>
Your detailed reasoning here...
</thinking>
Your final answer here.`;
          break;
        case 'search':
          model = 'perplexity/sonar';
          systemPrompt = `You are OpenBox with web search capabilities. You have access to real-time web search.
When searching, clearly indicate what you found from the web. Cite sources when possible.
Provide accurate, up-to-date information based on web search results.`;
          break;
        case 'instant':
        default:
          model = 'openai/gpt-4o-mini';
          systemPrompt = `You are OpenBox, a helpful AI assistant. Respond clearly and concisely.`;
          break;
      }
    }

    // Build message array
    const apiMessages = [];

    if (systemPrompt) {
      apiMessages.push({ role: 'system', content: systemPrompt });
    }

    // Process messages - handle image if present
    messages.forEach((msg) => {
      if (msg.role === 'user' && image && msg.isLastUser) {
        // Vision message with image
        apiMessages.push({
          role: 'user',
          content: [
            { type: 'text', text: msg.content || 'What do you see in this image?' },
            { type: 'image_url', image_url: { url: image } }
          ]
        });
      } else {
        apiMessages.push({
          role: msg.role,
          content: msg.content
        });
      }
    });

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    // Call OpenRouter API
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': req.headers.referer || 'https://openbox.vercel.app',
        'X-Title': 'OpenBox'
      },
      body: JSON.stringify({
        model: model,
        messages: apiMessages,
        stream: true,
        max_tokens: 4000,
        temperature: mode === 'thinking' ? 0.7 : 0.8,
        top_p: 1,
        transforms: ["middle-out"]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      res.write(`data: ${JSON.stringify({ error: true, message: `OpenRouter error: ${response.status} - ${errorText}` })}\n\n`);
      res.write('data: [DONE]\n\n');
      return res.end();
    }

    if (!response.body) {
      res.write(`data: ${JSON.stringify({ error: true, message: 'Empty response body from OpenRouter' })}\n\n`);
      res.write('data: [DONE]\n\n');
      return res.end();
    }

    // Stream the response
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      // Convert Uint8Array to string and process
      buffer += decoder.decode(value, { stream: true });

      // Process complete lines
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Keep incomplete line in buffer

      for (const line of lines) {
        if (line.trim() === '') continue;
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            res.write('data: [DONE]\n\n');
          } else {
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content || '';
              const reasoning = parsed.choices?.[0]?.delta?.reasoning || '';
              res.write(`data: ${JSON.stringify({ content, reasoning, raw: parsed })}\n\n`);
            } catch (e) {
              // Forward raw data if parse fails
              res.write(`data: ${JSON.stringify({ content: '', raw: data })}\n\n`);
            }
          }
        }
      }
    }

    // Process any remaining buffer
    if (buffer.trim()) {
      const line = buffer.trim();
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data === '[DONE]') {
          res.write('data: [DONE]\n\n');
        } else {
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content || '';
            const reasoning = parsed.choices?.[0]?.delta?.reasoning || '';
            res.write(`data: ${JSON.stringify({ content, reasoning, raw: parsed })}\n\n`);
          } catch (e) {
            res.write(`data: ${JSON.stringify({ content: '', raw: data })}\n\n`);
          }
        }
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();

  } catch (error) {
    console.error('API Error:', error);
    res.write(`data: ${JSON.stringify({ error: true, message: error.message })}\n\n`);
    res.write('data: [DONE]\n\n');
    res.end();
  }
}
