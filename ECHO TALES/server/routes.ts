import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { ttsRequestSchema, storyRequestSchema } from "@shared/schema";
import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import FormData from "form-data";
import { generateStory, generateSceneImages } from "./openai";

// Configure this with environment variable
const ELEVEN_LABS_API_KEY = process.env.ELEVEN_LABS_API_KEY || "";
const ELEVEN_LABS_API_URL = "https://api.elevenlabs.io/v1";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes
  
  // Text-to-speech endpoint
  app.post("/api/tts", async (req, res) => {
    try {
      // Validate request body
      const parsedBody = ttsRequestSchema.safeParse(req.body);
      
      if (!parsedBody.success) {
        return res.status(400).json({ 
          message: "Invalid request body", 
          errors: parsedBody.error.errors 
        });
      }
      
      const { text, voiceId, emotion, speed, pitch } = parsedBody.data;
      
      if (!ELEVEN_LABS_API_KEY) {
        return res.status(500).json({ message: "ElevenLabs API key not configured" });
      }
      
      // Prepare request to ElevenLabs API
      const ttsRequestBody = {
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: emotion === "neutral" ? 0 : 0.5,
          use_speaker_boost: true,
          style_exaggeration: ["happy", "excited"].includes(emotion) ? 0.75 : 0.3,
        }
      };
      
      // Adjust voice settings based on emotion and other parameters
      if (emotion === "whisper") {
        ttsRequestBody.voice_settings.stability = 0.8;
        ttsRequestBody.voice_settings.similarity_boost = 0.3;
      }
      
      // Make request to ElevenLabs
      const apiResponse = await fetch(
        `${ELEVEN_LABS_API_URL}/text-to-speech/${voiceId}?optimize_streaming_latency=0`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "xi-api-key": ELEVEN_LABS_API_KEY,
          },
          body: JSON.stringify(ttsRequestBody),
        }
      );
      
      if (!apiResponse.ok) {
        const errorBody = await apiResponse.text();
        return res.status(apiResponse.status).json({ 
          message: "Error from ElevenLabs API", 
          details: errorBody 
        });
      }
      
      // Send audio stream back to client
      const audioBuffer = await apiResponse.arrayBuffer();
      
      res.set('Content-Type', 'audio/mpeg');
      res.set('Content-Length', audioBuffer.byteLength.toString());
      res.set('Content-Disposition', 'attachment; filename="narration.mp3"');
      res.send(Buffer.from(audioBuffer));
      
    } catch (error) {
      console.error("Error processing TTS request:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Voice cloning endpoint
  app.post("/api/voices/clone", async (req, res) => {
    try {
      // Check if multipart form data contains file
      if (!req.files || !req.files.sample) {
        return res.status(400).json({ message: "Voice sample file required" });
      }
      
      const { name } = req.body;
      if (!name) {
        return res.status(400).json({ message: "Voice name required" });
      }
      
      if (!ELEVEN_LABS_API_KEY) {
        return res.status(500).json({ message: "ElevenLabs API key not configured" });
      }
      
      const voiceSample = req.files.sample;
      
      // Create form data for ElevenLabs API
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", "Custom voice created via VoiceForge");
      
      // Add voice sample
      if (Array.isArray(voiceSample)) {
        // Handle multiple files
        voiceSample.forEach((file) => {
          const fileBuffer = fs.readFileSync(file.tempFilePath);
          formData.append("files", fileBuffer, { filename: file.name });
        });
      } else {
        // Handle single file
        const fileBuffer = fs.readFileSync(voiceSample.tempFilePath);
        formData.append("files", fileBuffer, { filename: voiceSample.name });
      }
      
      // Make request to ElevenLabs
      const apiResponse = await fetch(
        `${ELEVEN_LABS_API_URL}/voices/add`,
        {
          method: "POST",
          headers: {
            "xi-api-key": ELEVEN_LABS_API_KEY,
            ...formData.getHeaders()
          },
          body: formData
        }
      );
      
      if (!apiResponse.ok) {
        const errorBody = await apiResponse.text();
        return res.status(apiResponse.status).json({ 
          message: "Error from ElevenLabs API", 
          details: errorBody 
        });
      }
      
      const responseData = await apiResponse.json();
      
      // Return the new voice data
      res.status(201).json(responseData);
      
    } catch (error) {
      console.error("Error processing voice cloning request:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Get available voices
  app.get("/api/voices", async (req, res) => {
    try {
      if (!ELEVEN_LABS_API_KEY) {
        return res.status(500).json({ message: "ElevenLabs API key not configured" });
      }
      
      // Fetch voices from ElevenLabs API
      const apiResponse = await fetch(
        `${ELEVEN_LABS_API_URL}/voices`,
        {
          headers: {
            "xi-api-key": ELEVEN_LABS_API_KEY,
          }
        }
      );
      
      if (!apiResponse.ok) {
        const errorBody = await apiResponse.text();
        return res.status(apiResponse.status).json({ 
          message: "Error from ElevenLabs API", 
          details: errorBody 
        });
      }
      
      const voices = await apiResponse.json();
      res.json(voices);
      
    } catch (error) {
      console.error("Error fetching voices:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Generate story with scenes and images
  app.post("/api/stories", async (req, res) => {
    try {
      // Validate request body
      const parsedBody = storyRequestSchema.safeParse(req.body);
      
      if (!parsedBody.success) {
        return res.status(400).json({ 
          message: "Invalid request body", 
          errors: parsedBody.error.errors 
        });
      }
      
      const { prompt, voiceId, emotion, speed, pitch } = parsedBody.data;
      
      if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({ message: "OpenAI API key not configured" });
      }
      
      if (!ELEVEN_LABS_API_KEY) {
        return res.status(500).json({ message: "ElevenLabs API key not configured" });
      }
      
      // Generate story with OpenAI
      try {
        // Generate story with OpenAI
        const storyData = await generateStory(prompt);
        
        // Generate images for each scene
        const scenesWithImages = await generateSceneImages(storyData.scenes);
        
        // Replace the scenes with the ones containing images
        storyData.scenes = scenesWithImages;
        
        // Generate audio for each scene
        for (let i = 0; i < storyData.scenes.length; i++) {
          const scene = storyData.scenes[i];
          
          // Prepare request to ElevenLabs API
          const ttsRequestBody = {
            text: scene.content,
            model_id: "eleven_multilingual_v2",
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75,
              style: emotion === "neutral" ? 0 : 0.5,
              use_speaker_boost: true,
              style_exaggeration: ["happy", "excited"].includes(emotion) ? 0.75 : 0.3,
            }
          };
          
          // Adjust voice settings based on emotion and other parameters
          if (emotion === "whisper") {
            ttsRequestBody.voice_settings.stability = 0.8;
            ttsRequestBody.voice_settings.similarity_boost = 0.3;
          }
          
          try {
            // Make request to ElevenLabs
            const apiResponse = await fetch(
              `${ELEVEN_LABS_API_URL}/text-to-speech/${voiceId}?optimize_streaming_latency=0`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "xi-api-key": ELEVEN_LABS_API_KEY,
                },
                body: JSON.stringify(ttsRequestBody),
              }
            );
            
            if (apiResponse.ok) {
              // We should save this to a file and serve it back later
              // For now, let's just mark that we have audio
              storyData.scenes[i].audio_url = `scene_${i + 1}_audio.mp3`;
            }
          } catch (sceneError) {
            console.error(`Error generating audio for scene ${i + 1}:`, sceneError);
          }
        }
        
        // Return the story data with images and audio URLs
        res.json(storyData);
      } catch (openaiError: any) {
        console.error("Error generating story with OpenAI:", openaiError);
        
        // Check for specific OpenAI errors
        if (openaiError.error?.type === 'insufficient_quota' || 
            (openaiError.type === 'insufficient_quota') || 
            openaiError.message?.includes('quota')) {
          return res.status(402).json({ 
            message: "API quota exceeded", 
            details: "The OpenAI API quota has been exceeded. Please update your API key or try again later."
          });
        } else if (openaiError.error?.type === 'invalid_request_error' || 
                 (openaiError.type === 'invalid_request_error')) {
          return res.status(400).json({ 
            message: "Invalid request to OpenAI API", 
            details: openaiError.message || "The request to OpenAI API was invalid."
          });
        } else {
          return res.status(500).json({ 
            message: "Error with OpenAI services", 
            details: "Unable to generate story content at this time."
          });
        }
      }
    } catch (error) {
      console.error("Error generating story:", error);
      res.status(500).json({ 
        message: "Error generating story", 
        details: "An unexpected error occurred while generating your story. Please try again later."
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
