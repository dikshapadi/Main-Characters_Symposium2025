"use client";

import { useState, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wand2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

export default function VoiceCloner() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [sourceFile, setSourceFile] = useState(null);
  const [targetFile, setTargetFile] = useState(null);
  const [settings, setSettings] = useState({
    enhancement_level: "moderate",
    background_noise_reduction: 0.75,
    clarity_enhancement: 0.50,
    voice_preservation: 0.80,
  });
  const formRef = useRef(null);

  const validateFileType = (file) => {
    const validTypes = ["audio/wav", "audio/mp3", "audio/mpeg"];
    return file && validTypes.includes(file.type);
  };

  const handleFileChange = (e, fileType) => {
    const file = e.target.files?.[0];
    if (!file || !validateFileType(file)) {
      setError("Invalid file type. Use WAV or MP3.");
      toast({ title: "Invalid file", description: "Only WAV and MP3 allowed", variant: "destructive" });
      return;
    }

    if (fileType === "source") setSourceFile(file);
    else setTargetFile(file);
    setError(null);
  };

  const handleClone = async () => {
    if (!sourceFile || !targetFile) {
        toast({
            title: "Missing files",
            description: "Please upload both source and target audio files",
            variant: "destructive",
        });
        return;
    }

    setLoading(true);
    setProgress(10);
    const formData = new FormData();
    formData.append("source", sourceFile);
    formData.append("target", targetFile);
    formData.append("settings", JSON.stringify(settings));

    try {
        // Start processing
        const res = await fetch("http://127.0.0.1:5000/voice-clone", {
            method: "POST",
            body: formData,
            mode: "cors",
        });

        if (!res.ok) {
            throw new Error("Failed to start processing");
        }

        const { job_id } = await res.json();
        
        // Poll for status
        while (true) {
            const statusRes = await fetch(`http://127.0.0.1:5000/status/${job_id}`);
            
            if (statusRes.headers.get("Content-Type").includes("audio/wav")) {
                // Final result received
                const blob = await statusRes.blob();
                const url = URL.createObjectURL(blob);
                setAudioUrl(url);
                setProgress(100);
                break;
            }

            const status = await statusRes.json();
            
            if (status.status === 'failed') {
                throw new Error(status.error || "Processing failed");
            }
            
            setProgress(status.progress);
            
            if (status.status === 'completed') {
                continue; // Get the file in the next iteration
            }

            // Wait before next poll
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        toast({ title: "Voice cloned successfully" });
    } catch (err) {
        setError(err.message);
        toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
        setLoading(false);
    }
};

  const handleReset = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setSourceFile(null);
    setTargetFile(null);
    setError(null);
    setProgress(0);
    if (formRef.current) formRef.current.reset();
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <CardHeader className="p-0">
        <CardTitle className="text-3xl font-bold tracking-tight">Voice Cloning</CardTitle>
        <CardDescription>Transform your voice using AI voice cloning technology.</CardDescription>
      </CardHeader>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Source Voice</CardTitle>
            <CardDescription>The voice you want to clone</CardDescription>
          </CardHeader>
          <CardContent>
            <Label htmlFor="source">Source Audio</Label>
            <Input id="source" type="file" accept="audio/*" onChange={(e) => handleFileChange(e, "source")} />
            {sourceFile && <audio controls src={URL.createObjectURL(sourceFile)} className="w-full mt-2" />}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Target Voice</CardTitle>
            <CardDescription>The audio you want to transform</CardDescription>
          </CardHeader>
          <CardContent>
            <Label htmlFor="target">Target Audio</Label>
            <Input id="target" type="file" accept="audio/*" onChange={(e) => handleFileChange(e, "target")} />
            {targetFile && <audio controls src={URL.createObjectURL(targetFile)} className="w-full mt-2" />}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Model Settings</CardTitle>
          <CardDescription>Adjust voice cloning parameters</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Enhancement Level</Label>
            <Select
              value={settings.enhancement_level}
              onValueChange={(value) => setSettings({...settings, enhancement_level: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light (30%)</SelectItem>
                <SelectItem value="moderate">Moderate (60%)</SelectItem>
                <SelectItem value="strong">Strong (90%)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>
              Background Noise Reduction ({Math.round(settings.background_noise_reduction * 100)}%)
            </Label>
            <Slider
              value={[settings.background_noise_reduction * 100]}
              onValueChange={(value) => setSettings({
                ...settings,
                background_noise_reduction: value[0] / 100
              })}
              min={0}
              max={100}
              step={1}
            />
          </div>

          <div className="space-y-2">
            <Label>
              Clarity Enhancement ({Math.round(settings.clarity_enhancement * 100)}%)
            </Label>
            <Slider
              value={[settings.clarity_enhancement * 100]}
              onValueChange={(value) => setSettings({
                ...settings,
                clarity_enhancement: value[0] / 100
              })}
              min={0}
              max={100}
              step={1}
            />
          </div>

          <div className="space-y-2">
            <Label>
              Voice Preservation ({Math.round(settings.voice_preservation * 100)}%)
            </Label>
            <Slider
              value={[settings.voice_preservation * 100]}
              onValueChange={(value) => setSettings({
                ...settings,
                voice_preservation: value[0] / 100
              })}
              min={0}
              max={100}
              step={1}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <Button
            className="w-full"
            size="lg"
            onClick={handleClone}
            disabled={loading || !sourceFile || !targetFile}
          >
            <Wand2 className="mr-2 h-5 w-5" />
            {loading ? "Processing..." : "Clone Voice"}
          </Button>

          {progress > 0 && (
            <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {audioUrl && (
        <Card>
          <CardHeader>
            <CardTitle>Result</CardTitle>
          </CardHeader>
          <CardContent>
            <audio 
              controls 
              className="w-full" 
              src={audioUrl}
            />
            <div className="flex justify-between mt-2">
              <Button 
                variant="link" 
                onClick={() => {
                  const a = document.createElement("a");
                  a.href = audioUrl;
                  a.download = "cloned-voice.wav";
                  a.click();
                }}
              >
                Download Audio
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleReset}
              >
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
          {error}
        </div>
      )}
    </div>
  );
}
