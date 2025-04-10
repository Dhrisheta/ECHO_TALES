import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import VoiceNarration from "@/pages/voice-narration";
import StoryGenerator from "@/pages/story-generator";

function Router() {
  return (
    <Switch>
      <Route path="/" component={StoryGenerator} />
      <Route path="/voice" component={VoiceNarration} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
