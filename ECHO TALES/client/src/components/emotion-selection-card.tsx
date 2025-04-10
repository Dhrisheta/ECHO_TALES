import { FC } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import VoiceAdjustments from './voice-adjustments';

interface EmotionOption {
  id: string;
  name: string;
}

interface EmotionSelectionCardProps {
  selectedEmotion: string;
  onEmotionSelect: (emotion: string) => void;
  speed: number;
  onSpeedChange: (speed: number) => void;
  pitch: number;
  onPitchChange: (pitch: number) => void;
}

const EmotionSelectionCard: FC<EmotionSelectionCardProps> = ({ 
  selectedEmotion, 
  onEmotionSelect,
  speed,
  onSpeedChange,
  pitch,
  onPitchChange
}) => {
  const emotions: EmotionOption[] = [
    { id: 'neutral', name: 'Neutral' },
    { id: 'happy', name: 'Happy' },
    { id: 'sad', name: 'Sad' },
    { id: 'excited', name: 'Excited' },
    { id: 'angry', name: 'Angry' },
    { id: 'whisper', name: 'Whisper' }
  ];

  return (
    <Card className="bg-white rounded-lg shadow-md mb-6">
      <CardContent className="p-4 md:p-6">
        <h3 className="font-heading font-medium text-lg mb-4">Voice emotion</h3>
        
        <div className="flex flex-wrap gap-2 mb-6">
          {emotions.map((emotion) => (
            <button
              key={emotion.id}
              className={`px-4 py-2 ${
                selectedEmotion === emotion.id
                  ? 'bg-primary text-white'
                  : 'border border-neutral-200 hover:border-primary hover:bg-primary hover:bg-opacity-5'
              } rounded-full cursor-pointer`}
              onClick={() => onEmotionSelect(emotion.id)}
            >
              {emotion.name}
            </button>
          ))}
        </div>
        
        <VoiceAdjustments 
          speed={speed}
          onSpeedChange={onSpeedChange}
          pitch={pitch}
          onPitchChange={onPitchChange}
        />
      </CardContent>
    </Card>
  );
};

export default EmotionSelectionCard;
