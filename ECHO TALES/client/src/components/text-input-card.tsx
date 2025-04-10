import { FC, useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TextInputCardProps {
  text: string;
  onTextChange: (text: string) => void;
}

const TextInputCard: FC<TextInputCardProps> = ({ text, onTextChange }) => {
  const [charCount, setCharCount] = useState(0);
  const { toast } = useToast();
  
  useEffect(() => {
    setCharCount(text.length);
  }, [text]);
  
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    onTextChange(newText);
    setCharCount(newText.length);
  };
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (!file) return;
    
    // Check if file is text or document
    if (!file.type.match('text/plain') && !file.name.endsWith('.txt') && !file.name.endsWith('.docx')) {
      toast({
        title: "Unsupported file format",
        description: "Please upload a .txt or .docx file",
        variant: "destructive"
      });
      return;
    }
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === 'string') {
        onTextChange(result);
      }
    };
    
    reader.onerror = () => {
      toast({
        title: "Error reading file",
        description: "There was an error reading your file",
        variant: "destructive"
      });
    };
    
    reader.readAsText(file);
  };
  
  return (
    <Card className="bg-white rounded-lg shadow-md mb-6">
      <CardContent className="p-4 md:p-6">
        <h3 className="font-heading font-medium text-lg mb-4">Enter your text</h3>
        <div className="relative mb-4">
          <Textarea
            className="w-full h-40 p-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            placeholder="Type or paste your text here..."
            value={text}
            onChange={handleTextChange}
          />
          <div className="absolute bottom-3 right-3 text-xs text-neutral-300">
            <span>{charCount}</span> / 1000 characters
          </div>
        </div>
        
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center">
            <input
              type="file"
              id="text-file-upload"
              accept=".txt,.docx"
              className="hidden"
              onChange={handleFileUpload}
            />
            <Button 
              variant="default" 
              className="inline-flex items-center bg-primary text-white"
              onClick={() => document.getElementById('text-file-upload')?.click()}
            >
              <Upload className="mr-2 h-4 w-4" />
              Import from file
            </Button>
          </div>
          <div className="text-sm text-neutral-300">Supported formats: .txt, .docx</div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TextInputCard;
