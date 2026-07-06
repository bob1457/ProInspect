import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import multer from 'multer';

const app = express();
const PORT = 3000;

// Enable JSON and URL encoded body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup file upload handling with multer (in-memory storage)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Lazy load Gemini Client to handle missing keys gracefully
let aiClient: any = null;
function getGeminiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("WARNING: GEMINI_API_KEY is not defined. Falling back to local text matching instead of real Gemini embeddings.");
      return null;
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// In-memory Vector RAG database schemas
export interface ServerDocument {
  id: string;
  name: string;
  size: string;
  type: string;
  uploadDate: string;
  chunkCount: number;
  status: 'processing' | 'ready' | 'error';
  summary?: string;
  tokenCount?: number;
}

export interface ServerChunk {
  id: string;
  docId: string;
  docName: string;
  text: string;
  index: number;
  vector?: number[];
}

let documentsDb: ServerDocument[] = [];
let chunksDb: ServerChunk[] = [];

// Helper functions for vector similarity
function dotProduct(a: number[], b: number[]) {
  return a.reduce((sum, val, idx) => sum + val * b[idx], 0);
}

function cosineSimilarity(a: number[], b: number[]) {
  const dot = dotProduct(a, b);
  const normA = Math.sqrt(dotProduct(a, a));
  const normB = Math.sqrt(dotProduct(b, b));
  if (normA === 0 || normB === 0) return 0;
  return dot / (normA * normB);
}

// Simple text-overlap similarity when API keys are missing
function getKeywordScore(text: string, query: string): number {
  const terms = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);
  let score = 0;
  const chunkText = text.toLowerCase();
  for (const term of terms) {
    if (chunkText.includes(term)) {
      score += 1.5; // exact match
    }
  }
  return score;
}

// Generate real embedding for a text chunk
async function generateEmbedding(text: string): Promise<number[] | null> {
  const ai = getGeminiClient();
  if (!ai) return null;
  try {
    const response = await ai.models.embedContent({
      model: 'gemini-embedding-2-preview',
      contents: text,
    });
    // Support modern @google/genai schema formats
    if (response.embedding && response.embedding.values) {
      return response.embedding.values;
    }
    return null;
  } catch (error) {
    console.error('Error generating embedding with Gemini:', error);
    return null;
  }
}

// Chunking function: splits text into semantic sections or paragraphs
function chunkText(text: string, maxWords: number = 100): string[] {
  // Split by double newline first for paragraphs
  const paragraphs = text.split(/\n\s*\n+/);
  const chunks: string[] = [];
  let currentChunk = "";

  for (const p of paragraphs) {
    const cleanP = p.trim();
    if (!cleanP) continue;

    const wordCount = cleanP.split(/\s+/).length;
    if (wordCount > maxWords) {
      // If a single paragraph is too large, split by sentences
      const sentences = cleanP.match(/[^.!?]+[.!?]+(\s|$)/g) || [cleanP];
      for (const sentence of sentences) {
        const sentenceClean = sentence.trim();
        if (!sentenceClean) continue;
        
        const currentWords = currentChunk.split(/\s+/).length;
        const sentenceWords = sentenceClean.split(/\s+/).length;
        if (currentWords + sentenceWords > maxWords) {
          if (currentChunk.trim()) chunks.push(currentChunk.trim());
          currentChunk = sentenceClean;
        } else {
          currentChunk = currentChunk ? `${currentChunk} ${sentenceClean}` : sentenceClean;
        }
      }
    } else {
      const currentWords = currentChunk.split(/\s+/).length;
      if (currentWords + wordCount > maxWords) {
        if (currentChunk.trim()) chunks.push(currentChunk.trim());
        currentChunk = cleanP;
      } else {
        currentChunk = currentChunk ? `${currentChunk}\n\n${cleanP}` : cleanP;
      }
    }
  }
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }
  return chunks;
}

// Ingest standard text or mock string
async function ingestDocument(name: string, text: string, sizeStr: string) {
  const docId = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const textChunks = chunkText(text);

  const newDoc: ServerDocument = {
    id: docId,
    name: name,
    size: sizeStr,
    type: path.extname(name).replace('.', '').toUpperCase() || 'TXT',
    uploadDate: new Date().toLocaleDateString(),
    chunkCount: textChunks.length,
    status: 'processing',
    tokenCount: text.split(/\s+/).length * 1.3
  };

  documentsDb.push(newDoc);

  // Ingest chunks asynchronously / sequentially to respect rate limits
  const ingestedChunks: ServerChunk[] = [];
  for (let i = 0; i < textChunks.length; i++) {
    const chunkTextVal = textChunks[i];
    const chunkId = `chunk_${docId}_${i}`;
    
    const chunkItem: ServerChunk = {
      id: chunkId,
      docId: docId,
      docName: name,
      text: chunkTextVal,
      index: i
    };

    // Attempt real vector embedding
    const vector = await generateEmbedding(chunkTextVal);
    if (vector) {
      chunkItem.vector = vector;
    }

    ingestedChunks.push(chunkItem);
  }

  // Push chunks into DB
  chunksDb = [...chunksDb, ...ingestedChunks];
  newDoc.status = 'ready';
}

// Pre-seed compliance guidelines on server boot
async function preSeedComplianceDatabase() {
  console.log("Pre-seeding compliance RAG knowledge base...");
  
  const austinFireCode = `
Austin Property Fire & Safety Manual (2026 Edition)

Section 101.4 Roof and Attic Ventilation: All residential properties in Austin must maintain at least 1 square foot of ventilation for every 150 square feet of attic floor space. Standard clearances of 2 inches are required between roof deck sheathing and fiberglass batt insulation.

Section 203.1 Fire Safety Clearance: Structural roofing timbers, joists, and decking sheets must have a minimum safety clearance of 18 inches from all single-wall flue pipes and chimney venting ducts. Chimneys must extend at least 3 feet above the highest point where they pass through the roof.

Section 304.5 Balcony & Guardrail Clearance: Every balcony, deck, elevated patio, or landing situated more than 30 inches above finished grade must have safety guardrails installed. Guardrails must be at least 36 inches in height, with vertical baluster spacing not exceeding 4 inches clearance.
  `;

  const austinPlumbingSafety = `
Austin Property Plumbing & Water Temperature Safety Guidelines

Code 504.1 Water Heater Temperature Limit: To prevent severe thermal scalds, all domestic gas and electric water heaters must be calibrated to deliver water at a maximum temperature of 120 degrees Fahrenheit (49°C) at any single fixture.

Code 508.2 Boiler and Water Storage Clearances: All commercial boilers and vertical water heaters exceeding 50 gallons capacity must maintain a clear operational workspace of 30 inches on all control sides, and 18 inches clearance from combustible partition walls.

Code 602.3 Drainage and Sump Pump Clearances: Drainage basins, backflow preventers, and sump pump stations must have a clearance of at least 24 inches from structural columns or foundations to allow access for inspection and prevent structural seepage.
  `;

  const texasFireAlarmCode = `
National Fire Code - Texas Regional Annex

NFC Section 4.2 Smoke Alarms: Approved smoke alarms must be installed in all sleeping rooms, outside each separate sleeping area in the immediate vicinity of the bedrooms, and on each level of the dwelling unit, including basements.

NFC Section 5.8 Portable Fire Extinguishers: Single-family rental properties and multi-family units must be equipped with at least one 2-A:10-B:C portable fire extinguisher on each residential floor, within 30 feet of travel distance from the kitchen area.
  `;

  try {
    await ingestDocument("Austin_Fire_Safety_Manual_2026.txt", austinFireCode, "1.2 KB");
    await ingestDocument("Austin_Plumbing_Safety_Guidelines.txt", austinPlumbingSafety, "1.1 KB");
    await ingestDocument("Texas_Smoke_Alarm_Fire_Extinguishers.txt", texasFireAlarmCode, "0.9 KB");
    console.log("Compliance RAG knowledge base pre-seeded successfully!");
  } catch (err) {
    console.error("Failed to pre-seed compliance database:", err);
  }
}

// Run pre-seeding
preSeedComplianceDatabase();

// API Endpoints for Knowledge Base & RAG

// 1. Get List of Indexed Documents
app.get('/api/knowledge/documents', (req, res) => {
  res.json({ documents: documentsDb });
});

// 2. Upload and Ingest File
app.post('/api/knowledge/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  try {
    const name = req.file.originalname;
    const text = req.file.buffer.toString('utf-8');
    const sizeKB = `${(req.file.size / 1024).toFixed(1)} KB`;

    await ingestDocument(name, text, sizeKB);
    res.json({ success: true });
  } catch (error) {
    console.error('Error uploading and indexing document:', error);
    res.status(500).send('Error indexing document.');
  }
});

// 3. Retrieve chunks of a document
app.get('/api/knowledge/chunks', (req, res) => {
  const docId = req.query.docId as string;
  if (!docId) {
    return res.status(400).send('docId is required');
  }
  const docChunks = chunksDb.filter(c => c.docId === docId);
  res.json({ chunks: docChunks });
});

// 4. Summarize document with Gemini
app.post('/api/knowledge/summarize', async (req, res) => {
  const { id } = req.body;
  const doc = documentsDb.find(d => d.id === id);
  if (!doc) {
    return res.status(404).send('Document not found');
  }

  const ai = getGeminiClient();
  if (!ai) {
    // Local fallback summary
    doc.summary = `This document "${doc.name}" consists of ${doc.chunkCount} safety compliance sections with specific regulations regarding clearances, safety limits, and standard protocols. It outlines crucial standards for professional property audits.`;
    return res.json({ success: true, summary: doc.summary });
  }

  try {
    const docChunksText = chunksDb
      .filter(c => c.docId === id)
      .map(c => c.text)
      .join("\n\n");

    const prompt = `Please read this property safety document and compile a precise, 2-3 sentence technical executive summary highlighting major clearances, temperature limits, or safety rules defined within. Keep it humble, literal, and highly professional.
    
    Document Content:
    ${docChunksText}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    if (response.text) {
      doc.summary = response.text.trim();
      res.json({ success: true, summary: doc.summary });
    } else {
      res.status(500).send('No summary returned from Gemini API.');
    }
  } catch (err) {
    console.error('Error generating summary via Gemini API:', err);
    res.status(500).send('Error summarizing document with Gemini API.');
  }
});

// 5. Delete Document
app.post('/api/knowledge/delete', (req, res) => {
  const { id } = req.body;
  documentsDb = documentsDb.filter(d => d.id !== id);
  chunksDb = chunksDb.filter(c => c.docId !== id);
  res.json({ success: true });
});

// 6. RAG Grounded Query Engine (Real Embedding and Local fallbacks)
app.post('/api/knowledge/query', async (req, res) => {
  const { query } = req.body;
  if (!query) {
    return res.status(400).send('Query is required');
  }

  try {
    const ai = getGeminiClient();
    let queryVector: number[] | null = null;
    let scoredChunks: { chunk: ServerChunk; score: number }[] = [];

    // Attempt to generate embedding for search query if client is active
    if (ai) {
      queryVector = await generateEmbedding(query);
    }

    if (queryVector) {
      // Calculate real cosine similarity
      scoredChunks = chunksDb
        .map(c => {
          let score = 0;
          if (c.vector) {
            score = cosineSimilarity(queryVector!, c.vector);
          } else {
            // Fallback inside vector loop just in case
            score = getKeywordScore(c.text, query) * 0.1;
          }
          return { chunk: c, score };
        })
        .filter(item => item.score > 0.15) // Similarity filter threshold
        .sort((a, b) => b.score - a.score);
    } else {
      // Keyword fallback scoring
      scoredChunks = chunksDb
        .map(c => {
          const score = getKeywordScore(c.text, query);
          return { chunk: c, score };
        })
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score);
    }

    // Grab top 3 grounded chunks
    const topScored = scoredChunks.slice(0, 3);
    const topChunks = topScored.map(item => item.chunk);

    if (topChunks.length === 0) {
      // Fallback answer when no matching document chunk is found
      let fallbackText = "I searched through the compliance manuals, but could not find specific matches for your query. Here is general guidance: Please ensure all chimneys, gas boilers, electrical panels, and attic vents comply with standard municipal codes. Let me know if you would like me to analyze other guidelines.";
      
      if (ai) {
        try {
          const generalResponse = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: `The user is asking about: "${query}". I have no specific uploaded documents on this, so provide a professional general answer for property inspectors. Clarify that no matching documents were found in the knowledge base, but offer standard professional advice. Keep it under 100 words, direct and scannable.`,
          });
          fallbackText = generalResponse.text || fallbackText;
        } catch (e) {
          console.error('Error generating fallback answer:', e);
        }
      }

      return res.json({
        answer: fallbackText,
        sources: []
      });
    }

    // Build context block for Gemini
    const contextText = topChunks
      .map((c, idx) => `[Document: ${c.docName}, Segment: ${c.index + 1}]\n"${c.text}"`)
      .join("\n\n");

    let finalAnswer = "";

    if (ai) {
      const prompt = `You are an expert Property Safety & Fire Compliance Auditor. Provide a clear, precise, and direct answer to the user's question, grounded strictly in the provided Source Segments. 
      - Always cite the document names explicitly when referring to rules.
      - Never state details that are not in the provided Source Segments.
      - If multiple guidelines exist, state them clearly.
      - Keep your language scannable, humble, and strictly factual.
      
      User Question: "${query}"
      
      Grounded Source Segments:
      ${contextText}
      
      Direct Answer (Be concise and clear, keep it under 150 words):`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
      });

      finalAnswer = response.text || "Could not generate grounded answer from context.";
    } else {
      // Local rule synthesizer for absolute offline mode
      finalAnswer = `Based on your query, here is the grounded information extracted from our compliance registries:\n\n` + 
        topChunks.map(c => `• From ${c.docName} (Segment ${c.index + 1}): "${c.text}"`).join("\n\n") + 
        `\n\n[Note: Real-time Gemini LLM synthesis is offline (GEMINI_API_KEY is not configured), showing direct document segment matches instead.]`;
    }

    // Map server chunks to client chunks (omit vectors)
    const clientSources = topChunks.map(c => ({
      id: c.id,
      docId: c.docId,
      docName: c.docName,
      text: c.text,
      index: c.index
    }));

    res.json({
      answer: finalAnswer,
      sources: clientSources
    });

  } catch (error) {
    console.error('Error in RAG query router:', error);
    res.status(500).send('Error querying knowledge base.');
  }
});


// Serve static files and route fallback
async function startServer() {
  // Vite Dev server integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development middleware mounted successfully.");
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log("Serving static production files from /dist.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express server running on http://localhost:${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
}

startServer();
