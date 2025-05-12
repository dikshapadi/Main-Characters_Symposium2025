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

export default function VoiceCloner() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [sourceFile, setSourceFile] = useState(null);
  const [targetFile, setTargetFile] = useState(null);
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

    try {
      const health = await fetch("http://127.0.0.1:5000/health", { method: "GET", mode: "cors" });
      if (!health.ok) throw new Error("Flask server unavailable");

      setProgress(30);
      const res = await fetch("http://127.0.0.1:5000/voice-clone", {
        method: "POST",
        body: formData,
        headers: { Accept: "audio/*" },
        mode: "cors",
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Server error");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      setProgress(100);
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
            <audio controls className="w-full" src={audioUrl} />
            <div className="flex justify-between mt-2">
              <Button variant="link" onClick={() => {
                const a = document.createElement("a");
                a.href = audioUrl;
                a.download = "cloned-voice.wav";
                a.click();
              }}>Download Audio</Button>
              <Button variant="destructive" onClick={handleReset}>Clear</Button>
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
