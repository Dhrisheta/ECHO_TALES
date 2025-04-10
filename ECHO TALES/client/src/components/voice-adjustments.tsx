import { FC } from 'react';
import { Slider } from '@/components/ui/slider';

interface VoiceAdjustmentsProps {
  speed: number;
  onSpeedChange: (speed: number) => void;
  pitch: number;
  onPitchChange: (pitch: number) => void;
}

const VoiceAdjustments: FC<VoiceAdjustmentsProps> = ({
  speed,
  onSpeedChange,
  pitch,
  onPitchChange
}) => {
  const handleSpeedChange = (value: number[]) => {
    onSpeedChange(value[0]);
  };

  const handlePitchChange = (value: number[]) => {
    onPitchChange(value[0]);
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex justify-between mb-2">
          <label className="text-sm font-medium">Speed</label>
          <span className="text-sm text-neutral-300">{speed.toFixed(1)}x</span>
        </div>
        <Slider
          value={[speed]}
          min={0.5}
          max={2.0}
          step={0.1}
          onValueChange={handleSpeedChange}
          className="w-full h-2"
        />
        <div className="flex justify-between text-xs text-neutral-300 mt-1">
          <span>Slow</span>
          <span>Fast</span>
        </div>
      </div>
      
      <div>
        <div className="flex justify-between mb-2">
          <label className="text-sm font-medium">Pitch</label>
          <span className="text-sm text-neutral-300">{pitch}</span>
        </div>
        <Slider
          value={[pitch]}
          min={-10}
          max={10}
          step={1}
          onValueChange={handlePitchChange}
          className="w-full h-2"
        />
        <div className="flex justify-between text-xs text-neutral-300 mt-1">
          <span>Lower</span>
          <span>Higher</span>
        </div>
      </div>
    </div>
  );
};

export default VoiceAdjustments;
