"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mic, Square, UploadCloud, SlidersHorizontal, Download, Trash2, Loader2, User, Volume2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function VoiceClarityPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("record");
  const [targetVoiceTab, setTargetVoiceTab] = useState("personal");
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [recordingTime, setRecordingTime] = useState(0);
  const recordingIntervalRef = useRef(null);

  const [enhancementLevel, setEnhancementLevel] = useState("moderate");
  const [noiseReduction, setNoiseReduction] = useState(75);
  const [clarityEnhancement, setClarityEnhancement] = useState(50);
  const [voicePreservation, setVoicePreservation] = useState(80);

  // Voice reference states
  const [savedVoices, setSavedVoices] = useState([
    { id: "voice1", name: "My Clear Voice 1" },
    { id: "voice2", name: "Professional Voice" }
  ]);
  const [selectedSavedVoice, setSelectedSavedVoice] = useState("voice1");
  const [referenceVoiceURL, setReferenceVoiceURL] = useState(null);
  const [referenceVoiceBlob, setReferenceVoiceBlob] = useState(null);
  const referenceFileInputRef = useRef(null);

  const [processedAudioURL, setProcessedAudioURL] = useState(null);
  const [processedAudioBlob, setProcessedAudioBlob] = useState(null);
  const [isLoadingProcessing, setIsLoadingProcessing] = useState(false);
  const [analysisSummary, setAnalysisSummary] = useState("");

  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);

  const [targetFile, setTargetFile] = useState(null);
  const [targetAudioURL, setTargetAudioURL] = useState(null);

  const [personalVoiceId, setPersonalVoiceId] = useState(null);

  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
      }
      cleanup();
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

  const handleReferenceVoiceUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type.startsWith("audio/")) {
        setReferenceVoiceBlob(file);
        const url = URL.createObjectURL(file);
        setReferenceVoiceURL(url);
        toast({ title: "Reference voice uploaded" });
      } else {
        toast({
          title: "Invalid File Type",
          description: "Please upload a valid audio file.",
          variant: "destructive",
        });
      }
    }
  };

  const handleTargetFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type.startsWith("audio/")) {
        setTargetFile(file);
        const url = URL.createObjectURL(file);
        setTargetAudioURL(url);
        toast({ title: "Target audio file uploaded" });
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

  const clearReferenceVoice = () => {
    setReferenceVoiceURL(null);
    setReferenceVoiceBlob(null);
    if (referenceFileInputRef.current) referenceFileInputRef.current.value = "";
    toast({ title: "Reference voice cleared" });
  };

  const handleProcessAudio = async () => {
    if (!audioBlob) {
      toast({
        title: "Missing audio",
        description: "Please record or upload an audio file first",
        variant: "destructive",
      });
      return;
    }

    // Get target voice based on selected tab
    let targetVoiceBlob = null;
    if (targetVoiceTab === "custom" && referenceVoiceBlob) {
      targetVoiceBlob = referenceVoiceBlob;
    } else if (targetVoiceTab === "saved" && selectedSavedVoice) {
      // Handle saved voice selection
      // You might need to fetch the saved voice file here
      toast({
        title: "Using saved voice",
        description: `Selected voice: ${savedVoices.find(v => v.id === selectedSavedVoice)?.name}`,
      });
      return;
    } else if (targetVoiceTab === "personal") {
      // Use personal voice settings without a target voice
      targetVoiceBlob = audioBlob;
    }

    if (!targetVoiceBlob) {
      toast({
        title: "Missing target voice",
        description: "Please select or upload a target voice",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setProgress(0);
    const formData = new FormData();

    // Add source and target files
    formData.append("source", audioBlob, "source.wav");
    formData.append("target", targetVoiceBlob, "target.wav");

    // Add settings
    formData.append("enhancement_level", enhancementLevel);
    formData.append("background_noise_reduction", noiseReduction / 100);
    formData.append("clarity_enhancement", clarityEnhancement / 100);
    formData.append("voice_preservation", voicePreservation / 100);

    try {
      // Health check
      const healthCheck = await fetch("http://127.0.0.1:5000/health");
      if (!healthCheck.ok) {
        throw new Error("Server is not available");
      }

      console.log("Sending voice clone request...");
      const response = await fetch("http://127.0.0.1:5000/voice-clone", {
        method: "POST",
        body: formData,
        mode: "cors",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to process audio");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setProcessedAudioURL(url);
      setProcessedAudioBlob(blob);
      
      setProgress(100);
      toast({ 
        title: "Success", 
        description: "Voice processed successfully"
      });

    } catch (err) {
      console.error("Processing error:", err);
      setError(err.message);
      toast({ 
        title: "Error", 
        description: err.message, 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadProcessedAudio = () => {
    if (processedAudioURL) {
      const a = document.createElement("a");
      a.href = processedAudioURL;
      a.download = "enhanced-voice.wav";
      a.click();
    }
  };

  const cleanup = () => {
    if (processedAudioURL) {
      URL.revokeObjectURL(processedAudioURL);
    }
    if (audioURL) {
      URL.revokeObjectURL(audioURL);
    }
    if (referenceVoiceURL) {
      URL.revokeObjectURL(referenceVoiceURL);
    }
  };

  const handleSaveVoice = () => {
    if (processedAudioBlob) {
      const voiceName = prompt("Enter a name for this voice:");
      if (voiceName) {
        const newVoiceId = `voice${Date.now()}`;
        setSavedVoices([...savedVoices, { id: newVoiceId, name: voiceName }]);
        toast({ title: "Voice saved", description: `"${voiceName}" added to your saved voices.` });
      }
    } else {
      toast({ 
        title: "No processed voice", 
        description: "Please enhance your audio first before saving the voice.", 
        variant: "destructive" 
      });
    }
  };

  const handleSaveReferenceVoice = () => {
    if (referenceVoiceBlob) {
      const voiceName = prompt("Enter a name for this voice profile:");
      if (voiceName) {
        const newVoiceId = `voice${Date.now()}`;
        const newVoice = {
          id: newVoiceId,
          name: voiceName,
          url: referenceVoiceURL,
          blob: referenceVoiceBlob
        };
        setSavedVoices([...savedVoices, newVoice]);
        toast({ 
          title: "Voice saved", 
          description: `"${voiceName}" added to your saved voices.` 
        });
      }
    }
  };

  const handleSetPersonalVoice = (voiceId) => {
    setPersonalVoiceId(voiceId);
    toast({ 
      title: "Personal voice updated",
      description: `Set "${savedVoices.find(v => v.id === voiceId)?.name}" as personal voice`
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Record/Upload Card */}
          <Card>
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

            {/* Merged Processing Section */}
            <CardContent className="border-t pt-6">
              <div className="space-y-6">
                <div>
                  <CardTitle className="text-xl">Process & Enhanced Audio</CardTitle>
                  <CardDescription>Apply the configured enhancements to your audio.</CardDescription>
                </div>

                <Button 
                  onClick={handleProcessAudio} 
                  disabled={!audioBlob || loading} 
                  className="w-full sm:w-auto"
                >
                  {loading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
                  ) : (
                    "Enhance Audio Clarity"
                  )}
                </Button>
                
                {loading && (
                  <div className="space-y-2">
                    <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="text-sm text-center text-muted-foreground">
                      Processing: {progress}%
                    </p>
                  </div>
                )}
                
                {processedAudioURL && (
                  <div className="mt-6 space-y-4">
                    <div>
                      <Label>Enhanced Audio:</Label>
                      <audio controls src={processedAudioURL} className="w-full mt-1" />
                    </div>
                    {analysisSummary && (
                      <div>
                        <Label>Summary:</Label>
                        <p className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-md">
                          {analysisSummary}
                        </p>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-3">
                      <Button variant="outline" onClick={handleDownloadProcessedAudio}>
                        <Download className="mr-2 h-4 w-4" /> Download Enhanced Audio
                      </Button>
                      <Button variant="outline" onClick={handleSaveVoice}>
                        <User className="mr-2 h-4 w-4" /> Save as Voice Profile
                      </Button>
                    </div>
                  </div>
                )}
                
                {loading && !processedAudioURL && (
                  <div className="flex items-center justify-center p-8 mt-4">
                    <Loader2 className="h-10 w-10 text-primary animate-spin" />
                    <p className="ml-3 text-muted-foreground">
                      Enhancing your audio, please wait...
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Voice Settings Card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><SlidersHorizontal className="h-5 w-5 text-primary" /> Voice Settings</CardTitle>
            <CardDescription>Configure how you want your voice to sound.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Target Voice Selection Tabs */}
            <div className="space-y-6">
              <div className="flex flex-col gap-2">
                <Label className="text-base font-semibold">Target Voice</Label>
                <Tabs value={targetVoiceTab} onValueChange={setTargetVoiceTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-3 p-1 bg-muted rounded-lg h-11">
                    <TabsTrigger 
                      value="personal" 
                      className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md"
                    >
                      <div className="flex items-center justify-center gap-2 px-1">
                        <User className="h-4 w-4 shrink-0" />
                        <span className="text-sm font-medium">Personal</span>
                      </div>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="saved"
                      className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md"
                    >
                      <div className="flex items-center justify-center gap-2 px-1">
                        <Volume2 className="h-4 w-4 shrink-0" />
                        <span className="text-sm font-medium">Saved</span>
                      </div>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="custom"
                      className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md"
                    >
                      <div className="flex items-center justify-center gap-2 px-1">
                        <UploadCloud className="h-4 w-4 shrink-0" />
                        <span className="text-sm font-medium">Upload</span>
                      </div>
                    </TabsTrigger>
                  </TabsList>

                  <div className="mt-4 rounded-lg border bg-card">
                    <TabsContent value="personal" className="p-4 space-y-2">
                      {personalVoiceId ? (
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <Label className="text-sm font-medium">Current Personal Voice:</Label>
                            <span className="text-sm text-muted-foreground">
                              {savedVoices.find(v => v.id === personalVoiceId)?.name}
                            </span>
                          </div>
                          <audio 
                            controls 
                            src={savedVoices.find(v => v.id === personalVoiceId)?.url} 
                            className="w-full" 
                          />
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setPersonalVoiceId(null)}
                            className="w-full"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Clear Personal Voice
                          </Button>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          No personal voice set. Save a voice and set it as personal from the "Saved" tab.
                        </p>
                      )}
                    </TabsContent>

                    <TabsContent value="saved" className="p-4 space-y-3">
                      <Select value={selectedSavedVoice} onValueChange={setSelectedSavedVoice}>
                        <SelectTrigger className="w-full h-10">
                          <SelectValue placeholder="Select a saved voice" />
                        </SelectTrigger>
                        <SelectContent>
                          {savedVoices.map(voice => (
                            <SelectItem key={voice.id} value={voice.id} className="py-2">
                              {voice.name} {voice.id === personalVoiceId && "(Personal)"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      {selectedSavedVoice && (
                        <div className="space-y-3">
                          <audio 
                            controls 
                            src={savedVoices.find(v => v.id === selectedSavedVoice)?.url} 
                            className="w-full" 
                          />
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleSetPersonalVoice(selectedSavedVoice)}
                              className="flex-1"
                            >
                              <User className="h-4 w-4 mr-2" />
                              Set as Personal
                            </Button>
                          </div>
                        </div>
                      )}
                      <p className="text-sm text-muted-foreground">
                        Use one of your previously saved voice profiles.
                      </p>
                    </TabsContent>

                    <TabsContent value="custom" className="p-4 space-y-4">
                      <Button 
                        variant="outline" 
                        onClick={() => referenceFileInputRef.current?.click()} 
                        className="w-full h-16 border-dashed border-2"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <UploadCloud className="h-5 w-5" />
                          <span className="text-sm font-medium">Upload Reference Voice</span>
                        </div>
                      </Button>
                      <Input
                        ref={referenceFileInputRef}
                        type="file"
                        accept="audio/*"
                        onChange={handleReferenceVoiceUpload}
                        className="hidden"
                      />
                      {referenceVoiceURL && (
                        <div className="space-y-3 pt-2">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Reference Voice:</Label>
                            <audio controls src={referenceVoiceURL} className="w-full" />
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={clearReferenceVoice} 
                              className="flex-1"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Clear
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleSaveReferenceVoice}
                              className="flex-1"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Save Voice
                            </Button>
                          </div>
                        </div>
                      )}
                    </TabsContent>
                  </div>
                </Tabs>
              </div>
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
              <p className="text-xs text-muted-foreground">Lower values will sound more like target voice, higher values preserve your original voice characteristics.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}