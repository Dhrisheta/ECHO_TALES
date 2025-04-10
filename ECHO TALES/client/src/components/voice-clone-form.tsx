import { FC, useState } from 'react';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { cloneVoice } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

// Import the sample voice file
import sampleVoicePath from '@assets/JAYANT RAW-enhanced-v2.wav';

interface VoiceCloneFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const VoiceCloneForm: FC<VoiceCloneFormProps> = ({ onSuccess, onCancel }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [useSample, setUseSample] = useState(false);
  const { toast } = useToast();

  const formSchema = z.object({
    name: z.string().min(2, {
      message: "Voice name must be at least 2 characters.",
    }),
    sample: z.instanceof(File, { message: "Voice sample is required" }).optional()
      .refine(file => {
        // Skip validation if using sample file
        if (useSample) return true;
        return !!file;
      }, "Voice sample is required")
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: ""
    }
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsUploading(true);
      
      const formData = new FormData();
      formData.append('name', values.name);
      
      if (useSample) {
        // Use the included sample audio file
        const response = await fetch(sampleVoicePath);
        const blob = await response.blob();
        const file = new File([blob], "sample-voice.wav", { type: "audio/wav" });
        formData.append('sample', file);
      } else if (values.sample) {
        // Use the uploaded file
        formData.append('sample', values.sample);
      } else {
        throw new Error("Voice sample is required");
      }
      
      const result = await cloneVoice(formData);
      
      if (result && result.voice_id) {
        toast({
          title: "Voice cloned successfully",
          description: `Your voice "${values.name}" is ready to use`,
          variant: "default"
        });
        
        form.reset();
        onSuccess();
      }
    } catch (error) {
      toast({
        title: "Error cloning voice",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Custom file input handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue("sample", file);
      // If user uploads a file, don't use the sample
      setUseSample(false);
    }
  };

  const toggleUseSample = () => {
    setUseSample(prev => !prev);
    if (!useSample) {
      // If switching to use sample, clear the file input
      form.setValue("sample", undefined);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Voice Name</FormLabel>
              <FormControl>
                <Input placeholder="My Custom Voice" {...field} />
              </FormControl>
              <FormDescription>
                Give your voice a unique name
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="space-y-2">
          <Button 
            type="button" 
            variant={useSample ? "default" : "outline"} 
            size="sm"
            onClick={toggleUseSample}
          >
            {useSample ? "✓ Using Included Sample" : "Use Included Sample"}
          </Button>
          <FormDescription>
            We've included a high-quality voice sample you can use for testing
          </FormDescription>
        </div>
        
        {!useSample && (
          <FormField
            control={form.control}
            name="sample"
            render={() => (
              <FormItem>
                <FormLabel>Voice Sample</FormLabel>
                <FormControl>
                  <Input 
                    type="file" 
                    accept="audio/*" 
                    onChange={handleFileChange}
                  />
                </FormControl>
                <FormDescription>
                  Upload a clear audio sample (MP3, WAV, M4A)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        
        <Separator className="my-4" />
        
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isUploading}>
            {isUploading ? "Uploading..." : "Clone Voice"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default VoiceCloneForm;