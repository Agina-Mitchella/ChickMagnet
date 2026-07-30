import express from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { createServer as createHttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type, ThinkingLevel, GenerateVideosOperation } from '@google/genai';

// Application and configuration imports
import app from './app.ts';
import { startWorkers } from './jobs/index.ts';
import { prisma, redis } from './config/index.ts';

dotenv.config();

const PORT = 3000;
const httpServer = createHttpServer(app);

// ==========================================
// REAL-TIME SOCKET.IO COOP CHAT ENGINE
// ==========================================
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log(`[SOCKET]: Celestial connection established - Socket ID: ${socket.id}`);
  
  socket.on('join_thread', (threadId) => {
    socket.join(threadId);
    console.log(`[SOCKET]: Socket joining chat thread circle: ${threadId}`);
  });

  socket.on('send_message', (data) => {
    // Broadcast message in thread circle
    io.to(data.threadId).emit('receive_message', data);
  });

  socket.on('disconnect', () => {
    console.log(`[SOCKET]: Celestial connection closed - Socket ID: ${socket.id}`);
  });
});

// ==========================================
// GEMINI API LORE SERVICES (BACKWARD-COMPATIBLE)
// ==========================================

let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('Warning: GEMINI_API_KEY is not defined. AI-powered custom commission drafting will fall back to local templates.');
      return null;
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

function generateLocalFallbackProduct(itemType: string, materials: string[], theme: string, details: string) {
  const finalMaterials = [...(materials || []), 'Spun-Thread Lace', 'Sunlight-Washed Linen'];
  const name = `Spun-Gold ${itemType || 'Shop Trinket'} of the ${theme || 'Emberglow'} Wood`;
  const desc = `A beautifully handcrafted ${itemType || 'keepsake'} fashioned from ${(materials && materials.join(', ')) || 'reclaimed woodland twigs'}, carrying a soft, warm cream vibe. Perfect for fairy-like rooms.`;
  const backstory = `Hand-assembled at sunset in the heart of Amberwood Hollow. The maker hummed an ancient dandelion lullaby while weaving ${materials?.[0] || 'natural fibres'} together under a warm orange lanterns glow. ${details ? `Special whisper: ${details}` : ''}`;
  
  return {
    name,
    description: desc,
    price: (Math.floor(Math.random() * 30) + 20) * 130,
    category: 'Enchanted Decor',
    materials: finalMaterials,
    origin: 'Amberwood Hollow (Local Fallback)',
    backstory,
    magicalStats: [
      { name: 'Warmth Glow', value: '+15 Cozy' },
      { name: 'Local Magic', value: 'Offline Crafted' }
    ]
  };
}

// Attach stubs on app before mounting Vite middleware
app.post('/api/craft-commission', async (req, res) => {
  try {
    const { itemType, materials, theme, details } = req.body;
    
    const client = getGeminiClient();
    if (!client) {
      console.log('No Gemini API key found, generating a whimsical local fallback product.');
      const fallback = generateLocalFallbackProduct(itemType, materials, theme, details);
      return res.json(fallback);
    }

    const prompt = `
      You are "The AI Tools" - an elite fairy craftsman who takes requests for handmade items and uses magical natural elements to build them.
      Craft a highly detailed, whimsical, fairy-themed product based on this shopper request:
      - Item Type: ${itemType || 'Any beautiful keepsake'}
      - Primary Magical Materials Selected: ${materials ? materials.join(', ') : 'Wild beeswax, dried orange peels'}
      - Artistic Theme / Vibe: ${theme || 'warm orange embers and cozy cream lace'}
      - Extra Details / Customization: ${details || 'None'}

      The tone of the description, story, and names should be highly poetic, cozy, cottagecore, fairy-like, and focus on HANDMADE CRAFT, orange/warm tones, and cream aesthetics.
    `;

    console.log(`Calling Gemini 3.6-flash to craft custom commission: ${itemType}...`);
    
    const response = await client.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are an ancient fairy artisan who speaks with warmth, whimsy, and cozy language. You craft handmade, nature-blessed home decorations, wearables, and charms focusing on sweet orange hues, honey, copper, dried flora, and soft cream lace.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: 'A creative, elegant, whimsical name for the handmade item. Must include themes of orange, cream, fae, or light.' },
            description: { type: Type.STRING, description: 'A highly descriptive, artistic, and cozy retail description of the item (2-3 sentences), highlighting how it is handmade and its physical texture.' },
            price: { type: Type.NUMBER, description: 'A reasonable handmade item price in Kenyan Shilling (numeric only, e.g., 4500.00).' },
            category: { type: Type.STRING, description: 'Must be one of: "Wandering Wearables", "Enchanted Decor", "Outdoor Magic", "Pixie Potions & Balms".' },
            materials: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '3 to 5 handmade or magical ingredients, containing at least one orange/cream colored flower or material.'
            },
            origin: { type: Type.STRING, description: 'A fantastical place in the woods, e.g. "Location", "Thistleberry Market", "Emberglow Orchards", "Whispering Falls".' },
            backstory: { type: Type.STRING, description: 'A rich, enchanting backstory of how you crafted it by hand, what spells, runes, or blessings were cast upon it, and the magical feeling it brings (3-4 sentences).' },
            magicalStats: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: 'Magical aura name (e.g., Cozy Aura, Sunset Radiance, Pixie Blessing).' },
                  value: { type: Type.STRING, description: 'A whimsical strength value (e.g., +15 Whimsy, Golden Glow, +10 Luck).' }
                },
                required: ['name', 'value']
              },
              description: 'Exactly 2 custom magical stats'
            }
          },
          required: ['name', 'description', 'price', 'category', 'materials', 'origin', 'backstory', 'magicalStats']
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error('Received empty response from Gemini API');
    }

    const craftedProduct = JSON.parse(text.trim());
    res.json(craftedProduct);
  } catch (err: any) {
    console.error('Error in /api/craft-commission:', err);
    res.status(500).json({ 
      error: 'Failed to craft commission due to an enchanted wind. Please try again!',
      message: err.message 
    });
  }
});

app.post('/api/generate-fairy-story', async (req, res) => {
  try {
    const { productName, materials } = req.body;
    const client = getGeminiClient();
    if (!client) {
      return res.json({
        story: `The legendary ${productName || 'Handmade Keepsake'} was forged by starlight in the deepest woods. Every stitch is laced with silent prayers for your ultimate cozy comfort and good dreams. Styled in beautiful sun-bleached cream cotton and scented with sweet orange wood.`
      });
    }

    const prompt = `
      Write a beautiful, tiny, whimsical 3-sentence fairy-tale story/legend about a handmade product named "${productName}".
      It is meticulously crafted using these materials: ${materials ? materials.join(', ') : 'orange peels and lace'}.
      Infuse warm orange-cream twilight tones, cottagecore cozy warmth, and pixie whimsy.
    `;

    const response = await client.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are a cozy bard fairy writing microscopic legends for beautiful artisan items.'
      }
    });

    res.json({ story: response.text?.trim() });
  } catch (err: any) {
    console.error('Error in /api/generate-fairy-story:', err);
    res.json({ 
      story: `Legends say the ${req.body?.productName || 'Handmade Keepsake'} was spun deep in sylvan woods by fairy hands, carrying a blessing of safety and comfort.` 
    });
  }
});

// ==========================================
// SYLVAN AI FORGE & ART STUDIO SERVICES
// ==========================================

// 1. Create and Edit Images (gemini-3.1-flash-image & gemini-3-pro-image)
app.post('/api/ai/generate-image', async (req, res) => {
  try {
    const { prompt, model, aspectRatio, resolution } = req.body;
    const client = getGeminiClient();
    if (!client) {
      return res.status(400).json({ error: 'Gemini API is not configured. Please define GEMINI_API_KEY.' });
    }

    // Determine target model
    const targetModel = model === 'high-quality' ? 'gemini-3-pro-image' : 'gemini-3.1-flash-image';

    // Premium handcrafted/sylvan visual directives
    const artisanDirectives = "Premium professional artisan product photography of a handmade craft item. Apply warm, natural ambient soft lighting and soft, realistic drop shadows so the product looks physically placed on a surface. Avoid flat, sterile, or pure white backdrops, pairing instead with warm, organic background colors (such as soft creams, earthy neutrals, or subtle natural textures like linen). Celebrate imperfections by ensuring a high detail, close-up shot that preserves the product's natural textures, raw edges, and handcrafted details (such as wire wraps, clay textures, stitching, or wood grain) without over-cropping or blurring.";

    // Decorate prompt with specified resolution (1K, 2K, 4K) to command maximum fidelity
    let decoratedPrompt = prompt;
    if (resolution === '4K') {
      decoratedPrompt = `${prompt}. ${artisanDirectives} Masterpiece, ultra-high resolution 4K UHD, hyper-detailed craftsmanship, 4096x4096px density, crystal clear.`;
    } else if (resolution === '2K') {
      decoratedPrompt = `${prompt}. ${artisanDirectives} Masterpiece, high resolution 2K HD, extremely high detail, studio product lighting, 2048x2048px density.`;
    } else {
      decoratedPrompt = `${prompt}. ${artisanDirectives} Beautiful 1K artisan render, 1024x1024px, warm cozy cottagecore craft lighting.`;
    }

    console.log(`[AI FORGE]: Generating image using ${targetModel} with aspect ratio ${aspectRatio || '1:1'} and prompt: "${prompt}"`);

    const response = await client.models.generateContent({
      model: targetModel,
      contents: {
        parts: [
          {
            text: decoratedPrompt,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio || '1:1',
          imageSize: resolution || '1K'
        }
      }
    });

    let imageBytes = '';
    const candidates = response.candidates;
    if (candidates && candidates[0]?.content?.parts) {
      for (const part of candidates[0].content.parts) {
        if (part.inlineData?.data) {
          imageBytes = part.inlineData.data;
          break;
        }
      }
    }

    if (!imageBytes) {
      throw new Error('No image bytes returned from Imagen model.');
    }

    res.json({
      success: true,
      imageUrl: `data:image/jpeg;base64,${imageBytes}`
    });
  } catch (err: any) {
    console.error('Error in /api/ai/generate-image:', err);
    res.status(500).json({ error: 'Enchanted winds disrupted the Sylvan Forge: ' + err.message });
  }
});

// Image editing with prompt (using gemini-3.1-flash-image)
app.post('/api/ai/edit-image', async (req, res) => {
  try {
    const { prompt, imageBase64, aspectRatio } = req.body;
    const client = getGeminiClient();
    if (!client) {
      return res.status(400).json({ error: 'Gemini API is not configured.' });
    }

    if (!imageBase64) {
      return res.status(400).json({ error: 'Original image is required for editing.' });
    }

    // Clean base64 input
    const matches = imageBase64.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
    let rawBase64 = imageBase64;
    let mimeType = 'image/jpeg';
    if (matches && matches.length === 3) {
      mimeType = matches[1];
      rawBase64 = matches[2];
    }

    // Premium handcrafted/sylvan visual directives
    const artisanDirectives = "Ensure the result looks like premium professional artisan product photography of a handmade craft item. Apply warm, natural ambient soft lighting and soft, realistic drop shadows so the product looks physically placed on a surface. Avoid flat, sterile, or pure white backdrops, pairing instead with warm, organic background colors (such as soft creams, earthy neutrals, or subtle natural textures like linen). Celebrate imperfections by preserving the product's natural textures, raw edges, and handcrafted details (such as wire wraps, clay textures, stitching, or wood grain) without over-cropping or blurring.";

    const editedPrompt = prompt 
      ? `${prompt}. ${artisanDirectives}`
      : `Enhance this image to look like a premium handmade product. ${artisanDirectives}`;

    console.log(`[AI FORGE]: Editing image using gemini-3.1-flash-image. Prompt: "${editedPrompt}"`);

    const response = await client.models.generateContent({
      model: 'gemini-3.1-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: rawBase64,
              mimeType: mimeType
            }
          },
          {
            text: editedPrompt
          }
        ]
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio || '1:1'
        }
      }
    });

    let editedBytes = '';
    const candidates = response.candidates;
    if (candidates && candidates[0]?.content?.parts) {
      for (const part of candidates[0].content.parts) {
        if (part.inlineData?.data) {
          editedBytes = part.inlineData.data;
          break;
        }
      }
    }

    if (!editedBytes) {
      throw new Error('No edited image bytes returned from Imagen edit model.');
    }

    res.json({
      success: true,
      imageUrl: `data:image/jpeg;base64,${editedBytes}`
    });
  } catch (err: any) {
    console.error('Error in /api/ai/edit-image:', err);
    res.status(500).json({ error: 'Enchanted forces resisted editing: ' + err.message });
  }
});

// 2. Animate image into video (using veo-3.1-lite-generate-preview - 3-step Pattern)
app.post('/api/ai/generate-video', async (req, res) => {
  try {
    const { imageBase64, aspectRatio, prompt } = req.body;
    const client = getGeminiClient();
    if (!client) {
      return res.status(400).json({ error: 'Gemini API is not configured.' });
    }

    let rawBase64 = '';
    let mimeType = 'image/jpeg';
    
    if (imageBase64) {
      const matches = imageBase64.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        mimeType = matches[1];
        rawBase64 = matches[2];
      } else {
        rawBase64 = imageBase64;
      }
    }

    const videoPrompt = prompt || 'Gently animate this sylvan artwork. Let the lights flicker warmly, dust motes drift cozy, and tree branches sway elegantly with professional cinematic lighting.';

    console.log(`[AI FORGE]: Requesting video generation from veo-3.1-lite-generate-preview. Aspect Ratio: ${aspectRatio || '16:9'}`);

    const config: any = {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: aspectRatio === '9:16' ? '9:16' : '16:9'
    };

    const payload: any = {
      model: 'veo-3.1-lite-generate-preview',
      prompt: videoPrompt,
      config: config
    };

    if (rawBase64) {
      payload.image = {
        imageBytes: rawBase64,
        mimeType: mimeType
      };
    }

    const operation = await client.models.generateVideos(payload);

    res.json({
      success: true,
      operationName: operation.name
    });
  } catch (err: any) {
    console.error('Error in /api/ai/generate-video:', err);
    res.status(500).json({ error: 'Sylvan winds blew out the animation forge: ' + err.message });
  }
});

// Polling status endpoint
app.post('/api/ai/video-status', async (req, res) => {
  try {
    const { operationName } = req.body;
    const client = getGeminiClient();
    if (!client) {
      return res.status(400).json({ error: 'Gemini API is not configured.' });
    }

    const op = new GenerateVideosOperation();
    op.name = operationName;

    const updated = await client.operations.getVideosOperation({ operation: op });
    res.json({
      success: true,
      done: updated.done
    });
  } catch (err: any) {
    console.error('Error in /api/ai/video-status:', err);
    res.status(500).json({ error: 'Failed to poll video status: ' + err.message });
  }
});

// Download/Stream endpoint
app.post('/api/ai/video-download', async (req, res) => {
  try {
    const { operationName } = req.body;
    const client = getGeminiClient();
    const apiKey = process.env.GEMINI_API_KEY;
    if (!client || !apiKey) {
      return res.status(400).json({ error: 'Gemini API is not configured.' });
    }

    const op = new GenerateVideosOperation();
    op.name = operationName;

    const updated = await client.operations.getVideosOperation({ operation: op });
    const uri = updated.response?.generatedVideos?.[0]?.video?.uri;
    if (!uri) {
      return res.status(400).json({ error: 'Video is not generated or URI not found.' });
    }

    console.log(`[AI FORGE]: Downloading video from uri: ${uri}`);
    const videoRes = await fetch(uri, {
      headers: { 'x-goog-api-key': apiKey },
    });

    res.setHeader('Content-Type', 'video/mp4');
    
    const arrayBuffer = await videoRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    res.send(buffer);
  } catch (err: any) {
    console.error('Error in /api/ai/video-download:', err);
    res.status(500).json({ error: 'Failed to download video bytes: ' + err.message });
  }
});

// 3. AI Oracle endpoint with model scaling, Search Grounding, Maps Grounding, and High Thinking
app.post('/api/ai/oracle', async (req, res) => {
  try {
    const { prompt, mode, grounding, thinking } = req.body;
    const client = getGeminiClient();
    if (!client) {
      return res.status(400).json({ error: 'Gemini API is not configured.' });
    }

    // Determine target model based on complexity hierarchy
    // Complex / High Thinking -> gemini-3.1-pro-preview
    // General -> gemini-3.6-flash
    // Fast -> gemini-3.1-flash-lite
    let targetModel = 'gemini-3.6-flash';
    if (mode === 'complex' || thinking) {
      targetModel = 'gemini-3.1-pro-preview';
    } else if (mode === 'fast') {
      targetModel = 'gemini-3.1-flash-lite';
    }

    // Setup Tools for Google Search or Google Maps grounding
    const tools: any[] = [];
    if (grounding === 'search') {
      tools.push({ googleSearch: {} });
    } else if (grounding === 'maps') {
      tools.push({ googleMaps: {} });
    }

    // Construct configuration
    const config: any = {
      systemInstruction: 'You are the "Sylvan Oracle" - an omniscient woodland spirit representing Sol Handmades. You assist visitors with crafting, design aesthetics (specifically warm orange tones, copper, beeswax, and cream lace), local artisan locations, pricing in Kenyan Shillings (KES), and handmading lore. Be поэтичным, accurate, and extremely helpful.'
    };

    if (tools.length > 0) {
      config.tools = tools;
    }

    // High thinking level requested (no maxOutputTokens)
    if (thinking && targetModel === 'gemini-3.1-pro-preview') {
      config.thinkingLevel = ThinkingLevel.HIGH;
      console.log('[ORACLE]: Enabling High Thinking mode on gemini-3.1-pro-preview');
    }

    console.log(`[ORACLE]: Prompting ${targetModel} (grounding: ${grounding || 'none'}, thinking: ${!!thinking})`);

    const response = await client.models.generateContent({
      model: targetModel,
      contents: prompt,
      config: config
    });

    res.json({
      success: true,
      text: response.text || 'The Oracle is silent. Try again with a different whisper.'
    });
  } catch (err: any) {
    console.error('Error in /api/ai/oracle:', err);
    res.status(500).json({ error: 'The Oracle suffered an cosmic distortion: ' + err.message });
  }
});

// 4. Image Analysis (using gemini-3.1-pro-preview)
app.post('/api/ai/analyze-image', async (req, res) => {
  try {
    const { prompt, imageBase64 } = req.body;
    const client = getGeminiClient();
    if (!client) {
      return res.status(400).json({ error: 'Gemini API is not configured.' });
    }

    if (!imageBase64) {
      return res.status(400).json({ error: 'An image is required for sylvan analysis.' });
    }

    const matches = imageBase64.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
    let rawBase64 = imageBase64;
    let mimeType = 'image/jpeg';
    if (matches && matches.length === 3) {
      mimeType = matches[1];
      rawBase64 = matches[2];
    }

    console.log('[AI FORGE]: Analyzing image using gemini-3.1-pro-preview...');

    const response = await client.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: [
        prompt || 'Analyze this handmade craft design. Describe its materials, aesthetics, warm/orange/cream tones, and suggest Sylvan fairy crafting modifications to make it more magical.',
        {
          inlineData: {
            data: rawBase64,
            mimeType: mimeType
          }
        }
      ],
      config: {
        systemInstruction: 'You are an ancient fairy artisan evaluator who details handmade crafts and gives warm, poetic, and cottagecore suggestions for woodland magic.'
      }
    });

    res.json({
      success: true,
      analysis: response.text || 'Silent inspection. The evaluation is empty.'
    });
  } catch (err: any) {
    console.error('Error in /api/ai/analyze-image:', err);
    res.status(500).json({ error: 'The Artisan lens cracked: ' + err.message });
  }
});

// ==========================================
// WEB DEVELOPMENT / STATIC ROUTING HANDLERS
// ==========================================

async function startServer() {
  try {
    // Spawn BullMQ Workers
    try {
      startWorkers();
    } catch (err) {
      console.error('Error initializing background queues:', err);
    }

    if (process.env.NODE_ENV !== 'production') {
      const vite = await createViteServer({
        server: { middlewareMode: true, hmr: false },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } else {
      const distPath = path.join(process.cwd(), 'dist');
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }

    httpServer.listen(PORT, '0.0.0.0', () => {
      console.log(`[SERVER_START]: Server successfully started. Listening on port ${PORT}`);
    });
  } catch (err: any) {
    console.error('[SERVER_ERROR] Critical: Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
export { httpServer };
