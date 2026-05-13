import Anthropic from '@anthropic-ai/sdk';
import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';

config();

const app = express();
app.use(cors());
app.use(express.json());

// Strip markdown code fences and parse JSON
function parseJSON(raw) {
  const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim();
  return JSON.parse(cleaned);
}

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const TOPIC_PROMPTS = {
  daily: `You are Chloe, a warm and encouraging English teacher specializing in daily conversation.
Focus on natural, everyday English including:
- Casual greetings and small talk
- Expressing opinions and feelings
- Describing daily activities and routines
- Common idioms and expressions
Keep conversations natural and relatable. Adapt vocabulary to the student's level.`,

  business: `You are Chloe, a professional English teacher specializing in Business English.
Focus on:
- Professional email writing and communication
- Business meeting vocabulary and phrases
- Negotiation and presentation skills
- Formal vs. informal register in workplace settings
- Industry-specific vocabulary
Maintain a professional yet approachable tone.`,

  travel: `You are Chloe, an English teacher specializing in travel English.
Focus on:
- Airport and transportation vocabulary
- Hotel check-in/check-out conversations
- Ordering food at restaurants
- Asking for and giving directions
- Shopping and sightseeing phrases
Use practical, immediately useful language.`,

  toeic: `You are Chloe, an expert TOEIC preparation teacher.
Focus on:
- TOEIC vocabulary building
- Business and office environment vocabulary
- Common TOEIC grammar patterns
- Test-taking strategies and tips
Ask questions in TOEIC style and explain answer patterns clearly.`,

  mba: `You are Chloe, a specialized coach for English-language job interview preparation.
Focus on:
- Behavioral interview questions using the STAR method
- Strengths, weaknesses, and self-introduction
- Career goals, motivations, and "why this company/role" answers
- Professional, confident, and persuasive language
- Common interview questions across industries (tech, finance, consulting, etc.)
Provide feedback on both content and language.`
};

const TOPIC_GREETINGS = {
  daily: "Hi there! I'm Chloe, your English teacher! 😊 Let's practice some everyday English together. I'll help you sound more natural and confident in daily conversations. What would you like to talk about today?",
  business: "Good day! I'm Chloe, your Business English coach. 💼 Whether you're preparing for meetings, emails, or presentations, I'm here to help you communicate professionally. What business English topic shall we start with?",
  travel: "Welcome! ✈️ I'm Chloe, and I'm excited to help you prepare for your travels! From airports to restaurants, we'll practice all the English you need. Where are you planning to go?",
  toeic: "Hello! I'm Chloe, your TOEIC preparation coach. 📚 Let's boost your score together! We'll work through vocabulary, grammar patterns, and test strategies. What would you like to focus on first?",
  mba: "Welcome! I'm Chloe, your English interview coach. 🎓 I'll help you articulate your experiences and career goals in clear, confident English. Shall we start with a common interview question?"
};

const GRAMMAR_SYSTEM_PROMPT = `You are an expert English grammar analyst. Analyze the given English text and return ONLY a valid JSON object with this exact structure:
{
  "hasErrors": boolean,
  "corrected": "corrected version of the original text (same as original if no errors)",
  "errors": [
    {
      "original": "the problematic word or phrase",
      "correction": "the correct version",
      "explanation": "brief explanation (can be in Korean)"
    }
  ],
  "tips": "one helpful writing tip related to the text (can be in Korean), or empty string",
  "level": "estimated CEFR level: A1, A2, B1, B2, C1, or C2"
}
If the text has no grammar errors, return hasErrors: false, corrected equal to the original, and empty errors array.
Return ONLY valid JSON, no other text or markdown.`;

// Chat streaming endpoint
app.post('/api/chat', async (req, res) => {
  const { messages, topic } = req.body;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const topicPrompt = TOPIC_PROMPTS[topic] || TOPIC_PROMPTS.daily;
  const systemPrompt = `${topicPrompt}

IMPORTANT GUIDELINES:
- Always respond in English
- Keep responses conversational (2–4 sentences typically)
- Occasionally introduce a useful vocabulary word or expression naturally
- Be warm, encouraging, and patient
- Never be condescending about mistakes
- End with a natural follow-up question to keep the conversation flowing`;

  try {
    const stream = client.messages.stream({
      model: 'claude-opus-4-7',
      max_tokens: 1024,
      system: systemPrompt,
      messages
    });

    for await (const event of stream) {
      if (
        event.type === 'content_block_delta' &&
        event.delta.type === 'text_delta'
      ) {
        res.write(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (error) {
    console.error('Chat error:', error);
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
});

// Initial greeting endpoint
app.get('/api/greeting/:topic', (req, res) => {
  const { topic } = req.params;
  const greeting = TOPIC_GREETINGS[topic] || TOPIC_GREETINGS.daily;
  res.json({ greeting });
});

// Grammar analysis endpoint
app.post('/api/grammar', async (req, res) => {
  const { text } = req.body;

  if (!text || text.trim().length < 3) {
    return res.json({ hasErrors: false, corrected: text, errors: [], tips: '', level: '' });
  }

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 1024,
      system: GRAMMAR_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: `Analyze this English text: "${text}"` }]
    });

    const textBlock = response.content.find(b => b.type === 'text');
    if (textBlock) {
      try {
        const result = parseJSON(textBlock.text);
        return res.json(result);
      } catch {
        return res.json({ hasErrors: false, corrected: text, errors: [], tips: '', level: '' });
      }
    }
    res.json({ hasErrors: false, corrected: text, errors: [], tips: '', level: '' });
  } catch (error) {
    console.error('Grammar error:', error);
    res.json({ hasErrors: false, corrected: text, errors: [], tips: '', level: '' });
  }
});

// Conversation-starter endpoint — Chloe initiates a chat
app.get('/api/conversation-starter/:topic', async (req, res) => {
  const { topic } = req.params;
  const topicPrompt = TOPIC_PROMPTS[topic] || TOPIC_PROMPTS.daily;

  const hour = new Date().getHours();
  const timeOfDay = hour < 5 ? 'late night'
                  : hour < 12 ? 'morning'
                  : hour < 18 ? 'afternoon'
                  : 'evening';

  const systemPrompt = `${topicPrompt}

You are reaching out to your student first to invite them to practice English. Generate ONE short, warm opening message (1–2 sentences) that:
- Greets them naturally for the ${timeOfDay}
- Hooks them with a specific question or prompt tied to the topic
- Feels casual, never repetitive
- Is in English only
Return just the message text — no quotes, no explanation.`;

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 200,
      system: systemPrompt,
      messages: [{ role: 'user', content: `Write your opening message for a ${topic} practice session right now.` }]
    });

    const textBlock = response.content.find(b => b.type === 'text');
    const message = textBlock ? textBlock.text.trim().replace(/^["']|["']$/g, '') : TOPIC_GREETINGS[topic];
    res.json({ message });
  } catch (error) {
    console.error('Conversation starter error:', error);
    res.json({ message: TOPIC_GREETINGS[topic] || TOPIC_GREETINGS.daily });
  }
});

// Growth Coach: single-sentence correction + scoring
const COACH_SYSTEM_PROMPT = `You are an English Growth Coach for Korean learners. Analyze ONE English sentence the user wrote and return ONLY a valid JSON object with this exact structure:
{
  "corrected": "the most natural rewrite of the sentence (keep the user's intent; if already perfect, repeat it verbatim)",
  "koreanTranslation": "natural Korean translation of the user's ORIGINAL sentence (not the corrected one). Translate meaning, not word-by-word.",
  "learningPoint": "ONE short, neutral Korean note (max ~100 characters) explaining the key grammar or word-choice point. No greetings, no praise, no encouragement, no emoji, no exclamation marks. Just the teaching point.",
  "followUpQuestion": "ONE short English question (max ~15 words) that asks the learner to practice the same pattern or context. Plain question only, no preamble.",
  "scores": {
    "accuracy": 0-100 integer (grammar/spelling correctness),
    "naturalness": 0-100 integer (how natively a fluent speaker would phrase it),
    "businessTone": 0-100 integer (appropriateness for professional/business context)
  },
  "mistakeType": "one short label in English from this set when possible: Grammar, Word Choice, Article/Preposition, Tense, Tone, Word Order, Spelling, Punctuation, None"
}
Style rules for learningPoint:
- Korean only.
- No "잘했어요", "좋아요", "훌륭해요", "괜찮아요" or similar.
- No small talk, no greetings.
- Focus on the linguistic point, not the learner's feelings.
Scoring guidance:
- If the sentence is already excellent, scores can all be 90–100 and mistakeType is "None".
- Be honest. Reward clear communication.
Return ONLY valid JSON, no markdown, no extra text.`;

app.post('/api/coach', async (req, res) => {
  const { sentence } = req.body;

  if (!sentence || sentence.trim().length < 2) {
    return res.status(400).json({ error: 'Sentence is required.' });
  }

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 600,
      system: COACH_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: `Analyze this sentence: "${sentence.trim()}"` }]
    });

    const textBlock = response.content.find(b => b.type === 'text');
    if (!textBlock) {
      return res.status(502).json({ error: 'Empty response from model.' });
    }

    try {
      const result = parseJSON(textBlock.text);
      return res.json(result);
    } catch {
      return res.status(502).json({ error: 'Could not parse coach response.' });
    }
  } catch (error) {
    console.error('Coach error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Review card generation endpoint
app.post('/api/review-cards', async (req, res) => {
  const { conversation, topic } = req.body;

  const prompt = `Based on this English conversation, extract 3–5 key vocabulary words or useful expressions the student should remember.
Return ONLY a valid JSON array with no extra text:
[
  {
    "word": "the word or phrase",
    "definition": "clear, concise definition in English",
    "example": "a natural example sentence",
    "translation": "Korean translation of the word/phrase",
    "difficulty": "easy | medium | hard"
  }
]
Focus on expressions that are genuinely useful for the "${topic}" context and worth memorizing.
Conversation:
${conversation}`;

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }]
    });

    const textBlock = response.content.find(b => b.type === 'text');
    if (textBlock) {
      try {
        const cards = parseJSON(textBlock.text);
        return res.json(Array.isArray(cards) ? cards : []);
      } catch {
        return res.json([]);
      }
    }
    res.json([]);
  } catch (error) {
    console.error('Review cards error:', error);
    res.json([]);
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Chloe English Teacher backend running on http://localhost:${PORT}`);
});
