import { FC, useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { fetchVoices } from '@/lib/api';
import VoiceCloneForm from '@/components/voice-clone-form';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Voice {
  voice_id: string;
  name: string;
  category: string;
  description: string;
  preview_url?: string;
  gender?: string;
}

interface VoiceSelectionCardProps {
  selectedVoiceId: string;
  onVoiceSelect: (voiceId: string) => void;
}

const VoiceSelectionCard: FC<VoiceSelectionCardProps> = ({ 
  selectedVoiceId, 
  onVoiceSelect 
}) => {
  const [voices, setVoices] = useState<Voice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [voiceAudio, setVoiceAudio] = useState<HTMLAudioElement | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadVoices();
  }, []);

  const loadVoices = async () => {
    try {
      setIsLoading(true);
      const voicesData = await fetchVoices();
      
      if (voicesData && voicesData.voices) {
        setVoices(voicesData.voices);
        
        // Set default selected voice if none is selected
        if (!selectedVoiceId && voicesData.voices.length > 0) {
          onVoiceSelect(voicesData.voices[0].voice_id);
        }
      }
    } catch (error) {
      toast({
        title: "Error fetching voices",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const playVoiceSample = (previewUrl?: string) => {
    if (!previewUrl) {
      toast({
        title: "No preview available",
        description: "This voice doesn't have a preview sample",
        variant: "destructive"
      });
      return;
    }

    // Stop any currently playing audio
    if (voiceAudio) {
      voiceAudio.pause();
      voiceAudio.currentTime = 0;
    }

    // Create new audio element
    const audio = new Audio(previewUrl);
    setVoiceAudio(audio);
    audio.play().catch(error => {
      toast({
        title: "Error playing audio",
        description: "Could not play the voice sample",
        variant: "destructive"
      });
    });
  };

  const handleVoiceSelect = (voiceId: string) => {
    onVoiceSelect(voiceId);
  };

  const handleVoiceCloneSuccess = () => {
    loadVoices();
    setDialogOpen(false);
  };

  const getVoiceCategory = (voice: Voice) => {
    if (voice.category === "cloned") return "Uploaded";
    if (voice.category === "premium") return "Premium";
    return "Default";
  };

  const getVoiceDetails = (voice: Voice) => {
    const gender = voice.gender || 'Unknown';
    return `${gender} · Natural`;
  };

  return (
    <Card className="bg-white rounded-lg shadow-md mb-6">
      <CardContent className="p-4 md:p-6">
        <h3 className="font-heading font-medium text-lg mb-4">Select voice</h3>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {[1, 2, 3].map((_, index) => (
              <div 
                key={index}
                className="border border-neutral-200 rounded-lg p-3 h-20 animate-pulse bg-neutral-100"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {voices.map((voice) => (
              <div 
                key={voice.voice_id}
                className={`border ${voice.voice_id === selectedVoiceId ? 'border-primary bg-primary bg-opacity-5' : 'border-neutral-200 hover:border-primary hover:bg-primary hover:bg-opacity-5'} rounded-lg p-3 cursor-pointer`}
                onClick={() => handleVoiceSelect(voice.voice_id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium">{voice.name}</div>
                  <div className={`text-xs px-2 py-1 ${voice.category === 'cloned' ? 'bg-accent bg-opacity-10 text-accent' : 'bg-neutral-200'} rounded-full`}>
                    {getVoiceCategory(voice)}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <button 
                    className={`p-1 rounded-full ${voice.voice_id === selectedVoiceId ? 'bg-primary' : 'bg-neutral-300'} text-white`}
                    onClick={(e) => {
                      e.stopPropagation();
                      playVoiceSample(voice.preview_url);
                    }}
                  >
                    <Play className="h-4 w-4" />
                  </button>
                  <div className="text-sm text-neutral-300">{getVoiceDetails(voice)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="inline-flex items-center bg-secondary text-white hover:bg-opacity-90">
                <Plus className="mr-2 h-4 w-4" />
                Clone your voice
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Clone your voice</DialogTitle>
                <DialogDescription>
                  Upload a voice sample to create your custom voice. The audio should be clear with no background noise.
                </DialogDescription>
              </DialogHeader>
              <VoiceCloneForm 
                onSuccess={handleVoiceCloneSuccess}
                onCancel={() => setDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
          <div className="text-sm text-neutral-300">Upload a sample to clone your own voice</div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VoiceSelectionCard;
