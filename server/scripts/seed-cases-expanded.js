import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import SimilarCase from '../src/models/SimilarCase.js';
import config from '../src/config/env.js';

import criminalCases from './cases-criminal.js';
import constitutionalCases from './cases-constitutional.js';
import familyCases from './cases-family.js';
import otherCases from './cases-other.js';

dotenv.config();

let embeddingsAvailable = false;
let genAI = null;

if (config.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY);
  embeddingsAvailable = true;
  console.log('Gemini API key found. Will generate embeddings.');
} else {
  console.log('No Gemini API key. Seeding without embeddings.');
}

async function generateEmbedding(text) {
  if (!embeddingsAvailable || !genAI) return null;
  try {
    const truncated = text.slice(0, 8000);
    const model = genAI.getGenerativeModel({ model: 'gemini-embedding-001' });
    const result = await model.embedContent(truncated);
    return result.embedding.values;
  } catch (err) {
    if (err.message?.includes('429') || err.message?.includes('quota')) {
      console.log(`  Rate limited. Waiting 10s...`);
      await new Promise((r) => setTimeout(r, 10000));
      try {
        const truncated = text.slice(0, 8000);
        const model = genAI.getGenerativeModel({ model: 'gemini-embedding-001' });
        const result = await model.embedContent(truncated);
        return result.embedding.values;
      } catch (retryErr) {
        console.log(`  Retry failed (${retryErr.message}). Continuing without embedding.`);
        return null;
      }
    }
    console.log(`  Embedding failed (${err.message}). Continuing without.`);
    return null;
  }
}

const allCases = [
  ...criminalCases,
  ...constitutionalCases,
  ...familyCases,
  ...otherCases,
];

async function seed() {
  try {
    await mongoose.connect(config.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check existing count
    const existing = await SimilarCase.countDocuments();
    console.log(`Existing cases in DB: ${existing}`);
    console.log(`New cases to seed: ${allCases.length}`);
    console.log('---');

    let embeddingCount = 0;
    let skipped = 0;

    for (let i = 0; i < allCases.length; i++) {
      const c = allCases[i];
      console.log(`[${i + 1}/${allCases.length}] ${c.title}`);

      // Check if already exists with embedding
      const existingDoc = await SimilarCase.findOne({ caseReference: c.caseReference }).lean();
      if (existingDoc?.embedding?.length > 0) {
        console.log(`  -> Already exists with embedding, updating text only`);
        await SimilarCase.findOneAndUpdate(
          { caseReference: c.caseReference },
          { ...c },
          { upsert: true }
        );
        embeddingCount++;
        skipped++;
        continue;
      }

      const textForEmbedding = `${c.title}. ${c.summary}. ${c.fullText}`;
      const embedding = await generateEmbedding(textForEmbedding);

      const updateData = { ...c };
      if (embedding) {
        updateData.embedding = embedding;
        embeddingCount++;
      }

      await SimilarCase.findOneAndUpdate(
        { caseReference: c.caseReference },
        updateData,
        { upsert: true, new: true }
      );

      if (embedding) {
        console.log(`  -> Saved with ${embedding.length}-dim embedding`);
        // Delay to respect Gemini rate limits
        if (i < allCases.length - 1) await new Promise((r) => setTimeout(r, 1500));
      } else {
        console.log(`  -> Saved (text only, keyword search enabled)`);
      }
    }

    const total = await SimilarCase.countDocuments();
    console.log('\n=== SEED COMPLETE ===');
    console.log(`Total cases in database: ${total}`);
    console.log(`Embeddings: ${embeddingCount}/${allCases.length} (${skipped} already had embeddings)`);
    console.log(`Cases without embeddings will use keyword-based similarity search.`);

    await mongoose.disconnect();
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  }
}

seed();
