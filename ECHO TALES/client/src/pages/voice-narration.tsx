import { FC, useState } from 'react';
import Sidebar from '@/components/sidebar';
import { MobileHeader, MobileBottomNav } from '@/components/mobile-nav';
import TextInputCard from '@/components/text-input-card';
import VoiceSelectionCard from '@/components/voice-selection-card';
import EmotionSelectionCard from '@/components/emotion-selection-card';
import AudioResult from '@/components/audio-result';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { generateSpeech } from '@/lib/api';
import { useMutation } from '@tanstack/react-query';

const VoiceNarration: FC = () => {
  const [narrationText, setNarrationText] = useState('');
  const [selectedVoiceId, setSelectedVoiceId] = useState('');
  const [selectedEmotion, setSelectedEmotion] = useState('neutral');
  const [speed, setSpeed] = useState(1.0);
  const [pitch, setPitch] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | undefined>(undefined);
  const [isGenerated, setIsGenerated] = useState(false);
  
  const { toast } = useToast();
  
  const narrationMutation = useMutation({
    mutationFn: generateSpeech,
    onSuccess: (data) => {
      setAudioBlob(data);
      setIsGenerated(true);
    },
    onError: (error: Error) => {
      toast({
        title: "Error generating narration",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  const handleGenerate = () => {
    if (!narrationText) {
      toast({
        title: "Text required",
        description: "Please enter some text to narrate",
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
    
    // Call the API to generate speech
    narrationMutation.mutate({
      text: narrationText,
      voiceId: selectedVoiceId,
      emotion: selectedEmotion,
      speed: speed,
      pitch: pitch
    });
  };
  
  const handleRegenerate = () => {
    handleGenerate();
  };
  
  return (
    <div className="flex h-screen">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <MobileHeader />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-neutral-100">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h2 className="font-heading font-semibold text-2xl mb-2">Voice Narration</h2>
              <p className="text-neutral-300">Convert your text to lifelike speech with custom voices</p>
            </div>
            
            <TextInputCard 
              text={narrationText}
              onTextChange={setNarrationText}
            />
            
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
            
            <div className="flex justify-center mb-6">
              <Button 
                className="px-6 py-3 bg-primary text-white rounded-lg text-lg font-medium shadow-lg hover:bg-opacity-90 transition-all"
                onClick={handleGenerate}
                disabled={narrationMutation.isPending}
              >
                {narrationMutation.isPending ? "Generating..." : "Generate Narration"}
              </Button>
            </div>
            
            <AudioResult 
              isLoading={narrationMutation.isPending}
              isGenerated={isGenerated}
              audioBlob={audioBlob}
              onRegenerate={handleRegenerate}
            />
          </div>
        </main>
        
        <MobileBottomNav />
      </div>
    </div>
  );
};

export default VoiceNarration;
