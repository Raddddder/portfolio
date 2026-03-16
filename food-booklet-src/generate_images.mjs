import { GoogleGenAI } from "@google/genai";
import fs from 'fs';
import path from 'path';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const prompts = [
  "A close-up, high-quality, aesthetic food photography of Chinese street food, specifically a freshly baked scallion pancake (Guanbing) with sweet bean sauce and a sausage inside. Warm lighting, appetizing.",
  "A close-up, high-quality, aesthetic food photography of a bowl of traditional Chinese mung bean soup with milk (mung bean sand). Served in a vintage bowl, summer vibe, refreshing.",
  "A close-up, high-quality, aesthetic food photography of a bowl of Luosifen (river snail rice noodle) with red chili oil, bamboo shoots, and a large golden fried egg on top. Spicy, appetizing, rich colors.",
  "A close-up, high-quality, aesthetic food photography of Longjiang pig trotter rice (braised pork trotter with rice). The pork is soft, shiny, and rich in collagen, served with rice and some greens.",
  "A close-up, high-quality, aesthetic food photography of Tom Yum Goong soup in a Thai restaurant. Spicy and sour broth with shrimp, lemongrass, and lime. Warm, vibrant colors.",
  "A close-up, high-quality, aesthetic food photography of Japanese Yakitori (grilled chicken skewers with leek) over charcoal. Served with a glass of plum wine in a dim, moody Izakaya setting.",
  "A close-up, high-quality, aesthetic food photography of an elegant brunch plate featuring poached eggs with runny yolk over avocado mash on sourdough toast. Next to a cup of latte with latte art. Bright, natural lighting.",
  "A close-up, high-quality, aesthetic food photography of a Japanese Sukiyaki hot pot with premium Wagyu beef slices and a bowl of raw egg dip. Boiling broth, cozy atmosphere.",
  "A close-up, high-quality, aesthetic food photography of black truffle mushroom risotto in a dim, romantic Italian restaurant setting. Creamy texture, elegant plating.",
  "A close-up, high-quality, aesthetic food photography of premium thick-cut beef tongue grilling on a charcoal net. Sizzling meat, pink center, high-end Yakiniku restaurant vibe."
];

async function generate() {
  const publicDir = path.join(process.cwd(), 'public', 'images');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  for (let i = 0; i < prompts.length; i++) {
    console.log(`Generating image ${i + 1}...`);
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: prompts[i],
        config: {
          imageConfig: {
            aspectRatio: "1:1"
          }
        }
      });
      
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const buffer = Buffer.from(part.inlineData.data, 'base64');
          const ext = part.inlineData.mimeType.split('/')[1] || 'jpeg';
          fs.writeFileSync(path.join(publicDir, `food_${i + 1}.${ext}`), buffer);
          console.log(`Saved food_${i + 1}.${ext}`);
          break;
        }
      }
    } catch (e) {
      console.error(`Error generating image ${i + 1}:`, e);
    }
  }
}

generate();
