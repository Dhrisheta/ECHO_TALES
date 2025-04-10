import { TTSRequest, StoryRequest, StoryResponse } from "@shared/schema";

export async function generateSpeech(request: TTSRequest): Promise<Blob> {
  const response = await fetch('/api/tts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to generate speech');
  }

  return await response.blob();
}

export async function fetchVoices() {
  const response = await fetch('/api/voices', {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch voices');
  }

  return await response.json();
}

export async function cloneVoice(formData: FormData) {
  const response = await fetch('/api/voices/clone', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to clone voice');
  }

  return await response.json();
}

export async function generateStory(request: StoryRequest): Promise<StoryResponse> {
  const response = await fetch('/api/stories', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json();
    
    // Create a more descriptive error that includes details if available
    const errorMessage = errorData.details 
      ? `${errorData.message}: ${errorData.details}` 
      : errorData.message || 'Failed to generate story';
      
    throw new Error(errorMessage);
  }

  return await response.json();
}
