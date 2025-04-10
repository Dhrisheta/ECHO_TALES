import OpenAI from "openai";
import { StoryResponse, StoryScene } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Generate a story with scenes based on a user prompt
 */
export async function generateStory(prompt: string): Promise<StoryResponse> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: 
            "You are a professional storyteller and comic book writer. You will create engaging, age-appropriate short stories in a comic book style, divided into scenes. Each scene should be vivid and visual with a focus on action and dialogue."
        },
        {
          role: "user",
          content: `Create a story based on this prompt: "${prompt}". Format your response as a JSON object with the following structure:
          {
            "title": "Story title",
            "summary": "A brief summary of the story",
            "scenes": [
              {
                "scene_number": 1,
                "title": "Scene title",
                "content": "Scene narrative text",
                "image_prompt": "Detailed visual prompt for generating an image of this scene in comic book style"
              },
              ... (more scenes)
            ]
          }
          
          Generate 3-5 scenes, each with descriptive scene content and very specific image prompts. The image prompts should be detailed for comic-book style illustrations.`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = response.choices[0].message.content || '{}';
    const result = JSON.parse(content);
    return result as StoryResponse;
  } catch (error: any) {
    console.error("Error generating story:", error);
    
    // Pass along the OpenAI error for better client-side handling
    if (error.error?.type || error.type) {
      throw error;
    }
    
    throw new Error("Failed to generate story");
  }
}

/**
 * Generate an image for a story scene
 */
export async function generateImage(prompt: string): Promise<string> {
  try {
    const enhancedPrompt = `Comic book style illustration of ${prompt}. Vibrant colors, dynamic composition, strong line work, dramatic lighting, superhero comic aesthetic.`;
    
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: enhancedPrompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
      style: "vivid",
    });

    return response.data[0].url || '';
  } catch (error: any) {
    console.error("Error generating image:", error);
    
    // Pass along the OpenAI error for better client-side handling
    if (error.error?.type || error.type) {
      throw error;
    }
    
    throw new Error("Failed to generate image");
  }
}

/**
 * Generate images for all scenes in a story
 */
export async function generateSceneImages(scenes: StoryScene[]): Promise<StoryScene[]> {
  const updatedScenes = [...scenes];
  
  for (let i = 0; i < updatedScenes.length; i++) {
    try {
      const imageUrl = await generateImage(updatedScenes[i].image_prompt);
      updatedScenes[i].image_url = imageUrl;
    } catch (error) {
      console.error(`Error generating image for scene ${i + 1}:`, error);
    }
  }
  
  return updatedScenes;
}