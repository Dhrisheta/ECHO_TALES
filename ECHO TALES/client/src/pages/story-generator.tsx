import { FC, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { generateStory } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Book, Loader2, Image, Volume2 } from 'lucide-react';
import Sidebar from '@/components/sidebar';
import { MobileHeader, MobileBottomNav } from '@/components/mobile-nav';
import VoiceSelectionCard from '@/components/voice-selection-card';
import EmotionSelectionCard from '@/components/emotion-selection-card';
import { StoryResponse, StoryScene } from '@shared/schema';

const StoryGenerator: FC = () => {
  const [storyPrompt, setStoryPrompt] = useState('');
  const [selectedVoiceId, setSelectedVoiceId] = useState('');
  const [selectedEmotion, setSelectedEmotion] = useState('neutral');
  const [speed, setSpeed] = useState(1.0);
  const [pitch, setPitch] = useState(0);
  const [storyData, setStoryData] = useState<StoryResponse | null>(null);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [currentTab, setCurrentTab] = useState('prompt');
  
  const { toast } = useToast();
  
  const storyMutation = useMutation({
    mutationFn: generateStory,
    onSuccess: (data) => {
      setStoryData(data);
      setCurrentTab('story');
      
      toast({
        title: "Story generated!",
        description: `"${data.title}" is ready to explore`,
        variant: "default"
      });
    },
    onError: (error: any) => {
      // Customize message based on error type
      if (error.message.includes("API quota exceeded")) {
        toast({
          title: "API Quota Limit Reached",
          description: "The OpenAI API quota has been exceeded. Please contact the administrator to update the API key.",
          variant: "destructive"
        });
      } else if (error.message.includes("OpenAI API key")) {
        toast({
          title: "API Configuration Issue",
          description: "There's an issue with the OpenAI API configuration. Please contact the administrator.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error Generating Story",
          description: error.message || "An unexpected error occurred. Please try again later.",
          variant: "destructive"
        });
      }
    }
  });
  
  const handleGenerateStory = () => {
    if (!storyPrompt) {
      toast({
        title: "Prompt required",
        description: "Please enter a story prompt",
        variant: "destructive"
      });
      return;
    }
    
    if (!selectedVoiceId) {
      toast({
        title: "Voice required",
        description: "Please select a voice for narration",
        variant: "destructive"
      });
      return;
    }
    
    storyMutation.mutate({
      prompt: storyPrompt,
      voiceId: selectedVoiceId,
      emotion: selectedEmotion,
      speed,
      pitch
    });
  };
  
  const playSceneAudio = (audioUrl: string | undefined) => {
    if (!audioUrl) {
      toast({
        title: "No audio available",
        description: "This scene doesn't have a narration",
        variant: "destructive"
      });
      return;
    }

    // Stop any currently playing audio
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }

    // Create new audio element
    const audio = new Audio(audioUrl);
    setCurrentAudio(audio);
    audio.play().catch(error => {
      toast({
        title: "Error playing audio",
        description: "Could not play the scene narration",
        variant: "destructive"
      });
    });
  };
  
  const SceneCard: FC<{ scene: StoryScene }> = ({ scene }) => {
    return (
      <Card className="mb-6 overflow-hidden">
        {scene.image_url && (
          <div className="w-full h-64 bg-neutral-100">
            <img 
              src={scene.image_url} 
              alt={`Scene ${scene.scene_number}: ${scene.title}`}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <CardContent className="p-4 md:p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-heading text-xl font-medium">
              Scene {scene.scene_number}: {scene.title}
            </h3>
            {scene.audio_url && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => playSceneAudio(scene.audio_url)}
                className="flex items-center gap-2"
              >
                <Volume2 className="h-4 w-4" />
                <span>Play</span>
              </Button>
            )}
          </div>
          <p className="text-neutral-700 whitespace-pre-line">{scene.content}</p>
        </CardContent>
      </Card>
    );
  };
  
  return (
    <div className="flex h-screen">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <MobileHeader />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-neutral-100">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h2 className="font-heading font-semibold text-2xl mb-2">Echo Tales</h2>
              <p className="text-neutral-300">Generate illustrated stories from prompts with voice narration</p>
            </div>
            
            <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="prompt" className="flex items-center gap-2">
                  <Book className="h-4 w-4" />
                  <span>Create Story</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="story" 
                  disabled={!storyData}
                  className="flex items-center gap-2"
                >
                  <Image className="h-4 w-4" />
                  <span>View Story</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="prompt" className="space-y-6">
                <Card className="bg-white rounded-lg shadow-md">
                  <CardContent className="p-4 md:p-6">
                    <h3 className="font-heading font-medium text-lg mb-4">Story prompt</h3>
                    <Textarea
                      placeholder="Enter a prompt to generate your story (e.g., 'An adventurous cat who discovers a secret portal in the garden shed')"
                      className="min-h-32 mb-2"
                      value={storyPrompt}
                      onChange={(e) => setStoryPrompt(e.target.value)}
                    />
                    <p className="text-sm text-neutral-300 mb-4">
                      Be descriptive about characters, setting, and tone for better results
                    </p>
                  </CardContent>
                </Card>
                
                <VoiceSelectionCard 
                  selectedVoiceId={selectedVoiceId}
                  onVoiceSelect={setSelectedVoiceId}
                />
                
                <EmotionSelectionCard 
                  selectedEmotion={selectedEmotion}
                  onEmotionSelect={setSelectedEmotion}
                  speed={speed}
                  onSpeedChange={setSpeed}
                  pitch={pitch}
                  onPitchChange={setPitch}
                />
                
                <div className="flex justify-center">
                  <Button 
                    className="px-6 py-3 bg-primary text-white rounded-lg text-lg font-medium shadow-lg hover:bg-opacity-90 transition-all flex items-center gap-2"
                    onClick={handleGenerateStory}
                    disabled={storyMutation.isPending}
                  >
                    {storyMutation.isPending ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <Play className="h-5 w-5" />
                        <span>Generate Story</span>
                      </>
                    )}
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="story">
                {storyData && (
                  <div className="space-y-6">
                    <Card className="bg-white rounded-lg shadow-md">
                      <CardContent className="p-4 md:p-6">
                        <h2 className="font-heading font-bold text-2xl mb-2">{storyData.title}</h2>
                        <p className="text-neutral-500 italic">{storyData.summary}</p>
                      </CardContent>
                    </Card>
                    
                    <div className="space-y-6">
                      {storyData.scenes.map((scene) => (
                        <SceneCard key={scene.scene_number} scene={scene} />
                      ))}
                    </div>
                    
                    <div className="flex justify-center">
                      <Button 
                        variant="outline"
                        className="px-6 py-3 rounded-lg text-lg font-medium transition-all"
                        onClick={() => setCurrentTab('prompt')}
                      >
                        Create Another Story
                      </Button>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </main>
        
        <MobileBottomNav />
      </div>
    </div>
  );
};

export default StoryGenerator;