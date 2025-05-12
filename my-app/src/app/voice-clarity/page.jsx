
"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Mic, Square, UploadCloud, SlidersHorizontal, Download, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { enhanceVoiceClarity } from "@/ai/flows/voice-clarity-flow";

export default function VoiceClarityPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("record");
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [recordingTime, setRecordingTime] = useState(0);
  const recordingIntervalRef = useRef(null);

  const [voiceReference, setVoiceReference] = useState("personal");
  const [enhancementLevel, setEnhancementLevel] = useState("moderate");
  const [noiseReduction, setNoiseReduction] = useState(75);
  const [clarityEnhancement, setClarityEnhancement] = useState(50);
  const [voicePreservation, setVoicePreservation] = useState(80);

  const [processedAudioURL, setProcessedAudioURL] = useState(null);
  const [processedAudioBlob, setProcessedAudioBlob] = useState(null);
  const [isLoadingProcessing, setIsLoadingProcessing] = useState(false);
  const [analysisSummary, setAnalysisSummary] = useState("");

  const fileInputRef = useRef(null);

  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const startRecording = async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        audioChunksRef.current = [];

        mediaRecorderRef.current.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };

        mediaRecorderRef.current.onstop = () => {
          const blob = new Blob(audioChunksRef.current, { type: "audio/wav" });
          setAudioBlob(blob);
          const url = URL.createObjectURL(blob);
          setAudioURL(url);
          stream.getTracks().forEach(track => track.stop()); // Stop microphone access
          clearInterval(recordingIntervalRef.current);
        };

        mediaRecorderRef.current.start();
        setIsRecording(true);
        setRecordingTime(0);
        recordingIntervalRef.current = setInterval(() => {
          setRecordingTime(prevTime => prevTime + 1);
        }, 1000);
        toast({ title: "Recording started" });
      } catch (err) {
        console.error("Error accessing microphone:", err);
        toast({
          title: "Microphone Error",
          description: "Could not access microphone. Please check permissions.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Unsupported Browser",
        description: "Audio recording is not supported in your browser.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    toast({ title: "Recording stopped" });
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type.startsWith("audio/")) {
        setAudioBlob(file);
        const url = URL.createObjectURL(file);
        setAudioURL(url);
        setProcessedAudioURL(null);
        setProcessedAudioBlob(null);
        setAnalysisSummary("");
        toast({ title: "Audio file uploaded" });
      } else {
        toast({
          title: "Invalid File Type",
          description: "Please upload a valid audio file.",
          variant: "destructive",
        });
      }
    }
  };
  
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const clearAudio = () => {
    setAudioURL(null);
    setAudioBlob(null);
    setProcessedAudioURL(null);
    setProcessedAudioBlob(null);
    setAnalysisSummary("");
    setRecordingTime(0);
    if (isRecording) stopRecording();
    if (fileInputRef.current) fileInputRef.current.value = ""; // Reset file input
    toast({ title: "Audio cleared" });
  };

  const blobToDataURL = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleProcessAudio = async () => {
    if (!audioBlob) {
      toast({ title: "No audio to process", description: "Please record or upload audio first.", variant: "destructive" });
      return;
    }
    setIsLoadingProcessing(true);
    setProcessedAudioURL(null);
    setProcessedAudioBlob(null);
    setAnalysisSummary("");

    try {
      const audioDataUri = await blobToDataURL(audioBlob);
      const settings = {
        voiceReference,
        enhancementLevel,
        noiseReduction,
        clarityEnhancement,
        voicePreservation,
      };
      
      const result = await enhanceVoiceClarity({ audioDataUri, settings });

      if (result && result.processedAudioDataUri) {
        // Convert data URI back to Blob for the audio player and download
        const fetchRes = await fetch(result.processedAudioDataUri);
        const blob = await fetchRes.blob();
        setProcessedAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setProcessedAudioURL(url);
        setAnalysisSummary(result.analysis || "Voice clarity enhanced.");
        toast({ title: "Voice Clarity Enhanced", description: result.analysis });
      } else {
        throw new Error("Processing failed to return audio data.");
      }
    } catch (error) {
      console.error("Error processing audio:", error);
      toast({ title: "Processing Error", description: error.message || "Could not enhance voice clarity.", variant: "destructive" });
    } finally {
      setIsLoadingProcessing(false);
    }
  };

  const handleDownloadProcessedAudio = () => {
    if (processedAudioBlob) {
      const url = URL.createObjectURL(processedAudioBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "enhanced_audio.wav"; // Or derive from original filename if available
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="space-y-6">
      <CardHeader className="p-0 mb-6">
        <CardTitle className="text-3xl font-bold tracking-tight">Voice-to-Voice Clarity Conversion</CardTitle>
        <CardDescription>Convert unclear speech into a clearer version using voice processing.</CardDescription>
      </CardHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="record">Record Audio</TabsTrigger>
              <TabsTrigger value="upload">Upload Audio</TabsTrigger>
            </TabsList>
            <TabsContent value="record">
              <CardHeader>
                <CardTitle>Record Your Voice</CardTitle>
                <CardDescription>Speak into your microphone and we&apos;ll enhance the clarity.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center space-y-4 min-h-[250px]">
                <Button
                  size="lg"
                  className="w-24 h-24 rounded-full"
                  variant={isRecording ? "destructive" : "default"}
                  onClick={isRecording ? stopRecording : startRecording}
                >
                  {isRecording ? <Square className="h-10 w-10" /> : <Mic className="h-10 w-10" />}
                </Button>
                <p className="text-sm text-muted-foreground">
                  {isRecording ? `Recording: ${formatTime(recordingTime)}` : "Tap the button to start recording"}
                </p>
              </CardContent>
            </TabsContent>
            <TabsContent value="upload">
              <CardHeader>
                <CardTitle>Upload Audio File</CardTitle>
                <CardDescription>Select an audio file from your device to enhance.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center space-y-4 min-h-[250px]">
                <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="w-full max-w-xs">
                  <UploadCloud className="mr-2 h-5 w-5" /> Select Audio File
                </Button>
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <p className="text-sm text-muted-foreground">Supported formats: WAV, MP3, OGG, etc.</p>
              </CardContent>
            </TabsContent>
          </Tabs>
           {audioURL && (
            <CardFooter className="flex flex-col items-start space-y-2 pt-4 border-t">
                <Label>Original Audio:</Label>
                <audio controls src={audioURL} className="w-full" />
                <Button variant="outline" size="sm" onClick={clearAudio}>
                    <Trash2 className="mr-2 h-4 w-4" /> Clear Audio
                </Button>
            </CardFooter>
          )}
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><SlidersHorizontal className="h-5 w-5 text-primary" /> Voice Model Settings</CardTitle>
            <CardDescription>Configure the voice model for optimal clarity.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label>Voice Reference</Label>
              <ToggleGroup type="single" value={voiceReference} onValueChange={(value) => value && setVoiceReference(value)} className="grid grid-cols-2 gap-2 mt-1">
                <ToggleGroupItem value="personal" aria-label="Personal reference">Personal</ToggleGroupItem>
                <ToggleGroupItem value="generic" aria-label="Generic reference">Generic</ToggleGroupItem>
              </ToggleGroup>
              <p className="text-xs text-muted-foreground mt-1">Using your previous voice recordings as reference (Personal) or a general model (Generic).</p>
            </div>
            <div>
              <Label>Enhancement Level</Label>
              <ToggleGroup type="single" value={enhancementLevel} onValueChange={(value) => value && setEnhancementLevel(value)} className="grid grid-cols-3 gap-2 mt-1">
                <ToggleGroupItem value="light" aria-label="Light enhancement">Light</ToggleGroupItem>
                <ToggleGroupItem value="moderate" aria-label="Moderate enhancement">Moderate</ToggleGroupItem>
                <ToggleGroupItem value="strong" aria-label="Strong enhancement">Strong</ToggleGroupItem>
              </ToggleGroup>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <Label htmlFor="noise-reduction">Background Noise Reduction</Label>
                <span className="text-sm font-medium">{noiseReduction}%</span>
              </div>
              <Slider id="noise-reduction" defaultValue={[noiseReduction]} max={100} step={1} onValueChange={(value) => setNoiseReduction(value[0])} />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <Label htmlFor="clarity-enhancement">Clarity Enhancement</Label>
                <span className="text-sm font-medium">{clarityEnhancement}%</span>
              </div>
              <Slider id="clarity-enhancement" defaultValue={[clarityEnhancement]} max={100} step={1} onValueChange={(value) => setClarityEnhancement(value[0])} />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <Label htmlFor="voice-preservation">Voice Preservation</Label>
                <span className="text-sm font-medium">{voicePreservation}%</span>
              </div>
              <Slider id="voice-preservation" defaultValue={[voicePreservation]} max={100} step={1} onValueChange={(value) => setVoicePreservation(value[0])} />
            </div>
          </CardContent>
          <CardFooter className="border-t pt-4">
            <Button variant="outline" className="w-full" disabled>
              <SlidersHorizontal className="mr-2 h-4 w-4" /> Advanced Settings
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Process & Enhanced Audio</CardTitle>
          <CardDescription>Apply the configured enhancements to your audio.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleProcessAudio} disabled={!audioBlob || isLoadingProcessing} className="w-full sm:w-auto">
            {isLoadingProcessing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</> : "Enhance Audio Clarity"}
          </Button>
          {processedAudioURL && (
            <div className="mt-6 space-y-4">
              <div>
                <Label>Enhanced Audio:</Label>
                <audio controls src={processedAudioURL} className="w-full mt-1" />
              </div>
              {analysisSummary && (
                <div>
                  <Label>Summary:</Label>
                  <p className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-md">{analysisSummary}</p>
                </div>
              )}
              <Button variant="outline" onClick={handleDownloadProcessedAudio}>
                <Download className="mr-2 h-4 w-4" /> Download Enhanced Audio
              </Button>
            </div>
          )}
          {isLoadingProcessing && !processedAudioURL && (
             <div className="flex items-center justify-center p-8 mt-4">
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
                <p className="ml-3 text-muted-foreground">Enhancing your audio, please wait...</p>
             </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
