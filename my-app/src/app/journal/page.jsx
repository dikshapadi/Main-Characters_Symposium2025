"use client";

import { useState, useEffect } from "react";
import { analyzeSentiment } from "@/ai/flows/sentiment-analysis";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Wand2, Smile, Meh, Frown, Edit3, Trash2, Save, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export default function JournalPage() {
  const [journalEntry, setJournalEntry] = useState("");
  const [entries, setEntries] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    const storedEntries = localStorage.getItem("journalEntries");
    if (storedEntries) {
      setEntries(JSON.parse(storedEntries));
    }
  }, []);

  useEffect(() => {
    if (entries.length > 0) {
      localStorage.setItem("journalEntries", JSON.stringify(entries));
    } else {
      localStorage.removeItem("journalEntries"); 
    }
  }, [entries]);


  const handleAnalyzeSentiment = async (textToAnalyze) => {
    if (!textToAnalyze.trim()) {
      toast({
        title: "Input Required",
        description: "Please write something in your journal before analyzing.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    setAnalysisResult(null);
    try {
      const result = await analyzeSentiment({ journalEntry: textToAnalyze });
      setAnalysisResult(result);
      if (selectedEntry) {
        setEntries(prevEntries => prevEntries.map(e => e.id === selectedEntry.id ? {...e, sentiment: result} : e));
        setSelectedEntry(prev => prev ? {...prev, sentiment: result} : null);
      }
      toast({
        title: "Sentiment Analyzed",
        description: "Emotional trends identified in your journal entry.",
      });
    } catch (error) {
      console.error("Sentiment analysis error:", error);
      toast({
        title: "Analysis Error",
        description: "Could not analyze sentiment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveEntry = () => {
    if (!journalEntry.trim()) {
      toast({ title: "Cannot save empty entry", variant: "destructive" });
      return;
    }
    const newEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      content: journalEntry,
    };
    setEntries([newEntry, ...entries]);
    setJournalEntry("");
    setSelectedEntry(newEntry);
    setAnalysisResult(null); 
    toast({ title: "Journal entry saved!" });
  };
  
  const handleSelectEntry = (entry) => {
    setSelectedEntry(entry);
    setJournalEntry(entry.content);
    setAnalysisResult(entry.sentiment || null);
  };

  const handleDeleteEntry = (id) => {
    setEntries(entries.filter(entry => entry.id !== id));
    if (selectedEntry?.id === id) {
      setSelectedEntry(null);
      setJournalEntry("");
      setAnalysisResult(null);
    }
    toast({ title: "Entry deleted" });
  };

  const getSentimentIcon = (score) => {
    if (score > 0.3) return <Smile className="h-5 w-5 text-green-500" />;
    if (score < -0.3) return <Frown className="h-5 w-5 text-red-500" />;
    return <Meh className="h-5 w-5 text-yellow-500" />;
  };


  return (
    <div className="grid md:grid-cols-[300px_1fr] gap-6 h-full max-h-[calc(100vh-theme(spacing.24))]">
      <Card className="flex flex-col relative">
        <CardHeader>
          <CardTitle>Your Entries</CardTitle>
          {/* <CardDescription>Review your previous journal entries.</CardDescription> */}
          <Button
            variant="default"
            size="icon"
            className="absolute top-4 right-4 rounded-full shadow-md hover:scale-110 transition-transform duration-150"
            aria-label="Add New Entry"
            onClick={() => {
              setSelectedEntry(null);
              setJournalEntry("");
              setAnalysisResult(null);
            }}
          >
            <Plus className="h-5 w-5" />
          </Button>
        </CardHeader>
        <CardContent className="flex-grow overflow-hidden p-0">
          <ScrollArea className="h-full p-4">
            {entries.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No entries yet.</p>
            ) : (
              <div className="space-y-3">
                {entries.map((entry) => (
                  <Button
                    key={entry.id}
                    variant="ghost"
                    className={`w-full justify-start h-auto p-3 text-left flex flex-col items-start ${selectedEntry?.id === entry.id ? 'bg-accent' : ''}`}
                    onClick={() => handleSelectEntry(entry)}
                  >
                    <span className="font-semibold text-sm">{new Date(entry.date).toLocaleDateString()}</span>
                    <p className="text-xs text-muted-foreground truncate w-full">{entry.content}</p>
                    {entry.sentiment && (
                       <Badge variant="outline" className="mt-1 text-xs">
                         {getSentimentIcon(entry.sentiment.score)}
                         <span className="ml-1">{entry.sentiment.sentiment} ({entry.sentiment.score.toFixed(2)})</span>
                       </Badge>
                    )}
                  </Button>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-6">
        <Card className="flex-grow flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Edit3 className="h-6 w-6 text-primary" />
              {selectedEntry ? "Edit Journal Entry" : "New Journal Entry"}
            </CardTitle>
            {selectedEntry && <CardDescription>Date: {new Date(selectedEntry.date).toLocaleString()}</CardDescription>}
          </CardHeader>
          <CardContent className="flex-grow flex flex-col">
            <Label htmlFor="journalEntry" className="sr-only">
              Journal Entry
            </Label>
            <Textarea
              id="journalEntry"
              placeholder="How are you feeling today? What's on your mind?"
              value={journalEntry}
              onChange={(e) => setJournalEntry(e.target.value)}
              className="flex-grow min-h-[200px] resize-none text-base bg-input/30"
              rows={10}
            />
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row justify-between gap-2 pt-4 border-t">
            <div className="flex gap-2">
              <Button onClick={handleSaveEntry} disabled={isLoading || !journalEntry.trim()} className="w-full sm:w-auto">
                <Save className="mr-2 h-4 w-4" /> Save Entry
              </Button>
              {selectedEntry && (
                <Button variant="outline" onClick={() => handleDeleteEntry(selectedEntry.id)} className="w-full sm:w-auto">
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </Button>
              )}
            </div>
            <Button onClick={() => handleAnalyzeSentiment(journalEntry)} disabled={isLoading || !journalEntry.trim()} className="w-full sm:w-auto">
              {isLoading ? "Analyzing..." : <><Wand2 className="mr-2 h-4 w-4" /> Analyze Sentiment</>}
            </Button>
          </CardFooter>
        </Card>

        {isLoading && !analysisResult && (
          <Card className="min-h-[150px] flex items-center justify-center">
             <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
             <p className="ml-3 text-muted-foreground">Analyzing your thoughts...</p>
          </Card>
        )}

        {analysisResult && (
          <Card className="shadow-lg animate-in fade-in-50 duration-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getSentimentIcon(analysisResult.score)}
                Sentiment Analysis Result
              </CardTitle>
              <CardDescription>
                Overall Sentiment: <Badge variant="secondary">{analysisResult.sentiment}</Badge> | Score: <Badge variant="secondary">{analysisResult.score.toFixed(2)}</Badge>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Label>Detailed Analysis:</Label>
              <p className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-md whitespace-pre-wrap">
                {analysisResult.analysis}
              </p>
              {analysisResult.score < -0.3 && (
                <Button asChild className="mt-4 w-full">
                  <a href="/ai-therapist">Talk to your AI therapist</a>
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
