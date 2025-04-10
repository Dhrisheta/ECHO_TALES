import { FC, useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  RefreshCw, 
  Download, 
  Share2, 
  Play, 
  Pause, 
  RotateCcw, 
  RotateCw 
} from 'lucide-react';
import WaveSurfer from 'wavesurfer.js';

interface AudioResultProps {
  isLoading: boolean;
  isGenerated: boolean;
  audioBlob?: Blob;
  onRegenerate: () => void;
}

const AudioResult: FC<AudioResultProps> = ({
  isLoading,
  isGenerated,
  audioBlob,
  onRegenerate
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState('0:00');
  const [totalTime, setTotalTime] = useState('0:00');
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const audioUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (!waveformRef.current) return;
    
    if (!wavesurferRef.current) {
      wavesurferRef.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: '#7c4dff',
        progressColor: '#5e35b1',
        cursorColor: '#f50057',
        height: 64,
        barWidth: 3,
        barGap: 1,
        barRadius: 1,
        responsive: true,
      });
      
      wavesurferRef.current.on('ready', () => {
        if (wavesurferRef.current) {
          const duration = wavesurferRef.current.getDuration();
          setTotalTime(formatTime(duration));
        }
      });
      
      wavesurferRef.current.on('audioprocess', () => {
        if (wavesurferRef.current) {
          const currentTime = wavesurferRef.current.getCurrentTime();
          setCurrentTime(formatTime(currentTime));
        }
      });
      
      wavesurferRef.current.on('finish', () => {
        setIsPlaying(false);
      });
    }
    
    // If we have a new audio blob, load it into wavesurfer
    if (audioBlob && isGenerated) {
      // Clean up previous audio URL
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
      }
      
      // Create new audio URL
      const audioUrl = URL.createObjectURL(audioBlob);
      audioUrlRef.current = audioUrl;
      
      wavesurferRef.current.load(audioUrl);
    }
    
    // Cleanup function
    return () => {
      if (wavesurferRef.current) {
        wavesurferRef.current.destroy();
        wavesurferRef.current = null;
      }
      
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
      }
    };
  }, [audioBlob, isGenerated]);

  const formatTime = (timeInSeconds: number): string => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handlePlayPause = () => {
    if (wavesurferRef.current) {
      wavesurferRef.current.playPause();
      setIsPlaying(!isPlaying);
    }
  };

  const handleRewind = () => {
    if (wavesurferRef.current) {
      const currentTime = wavesurferRef.current.getCurrentTime();
      wavesurferRef.current.seekTo((currentTime - 10) / wavesurferRef.current.getDuration());
    }
  };

  const handleForward = () => {
    if (wavesurferRef.current) {
      const currentTime = wavesurferRef.current.getCurrentTime();
      wavesurferRef.current.seekTo((currentTime + 10) / wavesurferRef.current.getDuration());
    }
  };

  const handleDownload = () => {
    if (!audioBlob) return;
    
    const url = URL.createObjectURL(audioBlob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = 'narration.mp3';
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleShare = () => {
    if (!audioBlob) return;
    
    if (navigator.share) {
      const file = new File([audioBlob], 'narration.mp3', {
        type: 'audio/mpeg'
      });
      
      navigator.share({
        title: 'Voice Narration',
        files: [file]
      }).catch(console.error);
    } else {
      console.log('Web Share API not supported in your browser');
    }
  };

  return (
    <Card className="bg-white rounded-lg shadow-md mb-6">
      <CardContent className="p-4 md:p-6">
        <h3 className="font-heading font-medium text-lg mb-4">Audio Result</h3>
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-10">
            <div className="w-16 h-16 border-4 border-neutral-200 border-t-primary rounded-full animate-spin mb-4"></div>
            <p className="text-neutral-300">Generating your narration...</p>
          </div>
        ) : isGenerated ? (
          <div>
            <div ref={waveformRef} className="mb-4 bg-neutral-100 rounded-lg p-2"></div>
            
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-neutral-300">{currentTime}</div>
              <div className="flex items-center space-x-2">
                <button 
                  className="p-2 rounded-full hover:bg-neutral-100"
                  onClick={handleRewind}
                >
                  <RotateCcw className="h-5 w-5" />
                </button>
                <button 
                  className="p-3 bg-primary text-white rounded-full shadow-md hover:bg-opacity-90"
                  onClick={handlePlayPause}
                >
                  {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </button>
                <button 
                  className="p-2 rounded-full hover:bg-neutral-100"
                  onClick={handleForward}
                >
                  <RotateCw className="h-5 w-5" />
                </button>
              </div>
              <div className="text-sm text-neutral-300">{totalTime}</div>
            </div>
            
            <div className="flex flex-wrap justify-center gap-3">
              <Button 
                variant="outline" 
                className="flex items-center"
                onClick={onRegenerate}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Regenerate
              </Button>
              <Button 
                variant="default" 
                className="flex items-center bg-accent text-white hover:bg-opacity-90"
                onClick={handleDownload}
              >
                <Download className="mr-2 h-4 w-4" />
                Download MP3
              </Button>
              <Button 
                variant="outline" 
                className="flex items-center"
                onClick={handleShare}
              >
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <p className="text-neutral-300 mb-2">No audio generated yet</p>
            <p className="text-sm text-neutral-300">Enter your text, select a voice and click "Generate Narration"</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AudioResult;
