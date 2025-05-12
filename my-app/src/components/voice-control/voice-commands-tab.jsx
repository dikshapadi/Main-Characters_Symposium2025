"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { PlusCircle, Play, Trash2, Settings, ListChecks, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axios from "axios"; 
import { useActivity } from "@/context/activity-context";

const initialCommands = [
  {
    id: 1,
    title: "Get My Meetings",
    description: "Fetches your meetings for today from the calendar.",
    phrase: "Get my meetings",
    enabled: true,
  },

];

export default function VoiceCommandsTab() {
  const { toast } = useToast();
  const { addActivity } = useActivity(); // Access the activity context
  const [commands, setCommands] = useState(initialCommands);
  const [editingPhrases, setEditingPhrases] = useState({});

  const handlePhraseChange = (id, value) => {
    setEditingPhrases(prev => ({ ...prev, [id]: value }));
  };

  const handleSavePhrase = (id) => {
    setCommands(prevCmds => 
      prevCmds.map(cmd => 
        cmd.id === id ? { ...cmd, phrase: editingPhrases[id] } : cmd
      )
    );
    const { [id]: _, ...rest } = editingPhrases; 
    setEditingPhrases(rest);
    toast({ title: "Command phrase updated!" });
  };

  const handleToggleCommand = (id, enabled) => {
    setCommands(prevCmds =>
      prevCmds.map(cmd =>
        cmd.id === id ? { ...cmd, enabled } : cmd
      )
    );
    toast({ title: `Command ${enabled ? 'enabled' : 'disabled'}` });
  };
  
  const handleCommandSettings = (command) => {
    toast({
        title: "Settings Clicked",
        description: `Configure settings for "${command.title}". (Functionality not implemented yet)`,
      });
  };

  const handleRunCommand = async (command) => {
    if (!command.enabled) {
      toast({
        title: "Command Disabled",
        description: `"${command.title}" is currently disabled. Enable it to run.`,
        variant: "destructive",
      });
      return;
    }

    if (command.title === "Get My Meetings") {
      try {
        toast({ title: "Fetching Meetings", description: "Please wait..." });

        // Send a POST request to the ngrok URL
        const response = await axios.post(
          "https://a4f3-2405-201-d023-90af-89c5-b297-7c43-e856.ngrok-free.app",
          {
            request: {
              type: "IntentRequest",
              intent: {
                name: "GetMeetingsIntent",
              },
            },
          }
        );

        const details = response.data.response.outputSpeech.text;

        // Log the activity
        addActivity({
          id: Date.now(),
          timestamp: new Date().toISOString(),
          command: command.phrase,
          status: "success",
          details,
        });

        // Display the response
        toast({
          title: `${command.title} Executed`,
          description: details,
        });

        // Speak the response aloud
        const utterance = new SpeechSynthesisUtterance(details);
        utterance.lang = "en-IN"; 

        const voices = speechSynthesis.getVoices();

        const femaleVoice = voices.find((voice) => 
          voice.name.toLowerCase().includes("female") || 
          voice.name.toLowerCase().includes("google us english")
        );

        if (femaleVoice) {
          utterance.voice = femaleVoice;
        } else {
          console.warn("No female voice found. Using default voice.");
        }

        // Speak the text
        speechSynthesis.speak(utterance);
      } catch (error) {
        console.error("Error executing command:", error);

        // Log the failure
        addActivity({
          id: Date.now(),
          timestamp: new Date().toISOString(),
          command: command.phrase,
          status: "failure",
          details: "Failed to execute the command.",
        });

        toast({
          title: "Error",
          description: "Failed to execute the command. Please try again.",
          variant: "destructive",
        });
      }
      return;
    }

    // Default behavior for other commands
    toast({
      title: "Simulating Command Run",
      description: `Executing: "${command.phrase}"`,
    });
  };

  const handleDeleteCommand = (id) => { 
    setCommands(prevCmds => prevCmds.filter(cmd => cmd.id !== id));
    toast({
      title: "Command Deleted",
      description: "The voice command has been removed.",
      variant: "destructive"
    });
  };
  
  const handleAddNewCommand = () => {
    const newId = commands.length > 0 ? Math.max(...commands.map(c => c.id)) + 1 : 1;
    const newCommand = {
      id: newId,
      title: "New Custom Command",
      description: "Describe what this command does.",
      phrase: "Hey AssistNow, do something new",
      enabled: true,
    };
    setCommands(prev => [newCommand, ...prev]);
    setEditingPhrases(prev => ({...prev, [newId]: newCommand.phrase }));
    toast({ title: "New command added", description: "Edit the details below."});
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Available automation Commands</CardTitle>
          <CardDescription>
            Click on the run button against each command to get a response.
          </CardDescription>
        </div>
        
      </CardHeader>
      <CardContent>
        {commands.length > 0 ? (
          <div className="space-y-4">
            {commands.map((command) => (
              <Card key={command.id} className="p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{command.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{command.description}</p>
                  </div>
                  <div className="flex items-center gap-1">
                     <Button variant="ghost" size="icon" onClick={() => handleCommandSettings(command)} aria-label="Command settings">
                      <Settings className="h-5 w-5 text-muted-foreground hover:text-primary" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleRunCommand(command)} aria-label="Run command" disabled={!command.enabled}>
                      <Play className={`h-5 w-5 ${command.enabled ? 'text-green-600' : 'text-muted-foreground'}`} />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteCommand(command.id)} aria-label="Delete command">
                      <Trash2 className="h-5 w-5 text-destructive" />
                    </Button>
                  </div>
                </div>
                <Textarea
                  value={editingPhrases[command.id] !== undefined ? editingPhrases[command.id] : command.phrase}
                  onChange={(e) => handlePhraseChange(command.id, e.target.value)}
                  onBlur={() => {
                    if (editingPhrases[command.id] !== undefined && editingPhrases[command.id] !== command.phrase) {
                       handleSavePhrase(command.id);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      if (editingPhrases[command.id] !== undefined && editingPhrases[command.id] !== command.phrase) {
                        handleSavePhrase(command.id);
                      }
                      e.target.blur(); // unfocus the textarea
                    }
                  }}
                  placeholder="Enter command phrase..."
                  className="mt-1 bg-muted/50 font-mono text-sm p-2 h-auto min-h-[40px] focus-visible:ring-primary"
                  rows={1}
                />
                <div className="flex items-center space-x-2 mt-3">
                  <Switch
                    id={`enable-command-${command.id}`}
                    checked={command.enabled}
                    onCheckedChange={(checked) => handleToggleCommand(command.id, checked)}
                  />
                  <Label htmlFor={`enable-command-${command.id}`} className="text-sm text-muted-foreground">
                    {command.enabled ? "Enabled" : "Disabled"}
                  </Label>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 rounded-lg border-2 border-dashed border-muted">
            <ListChecks className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-lg font-semibold text-foreground">No Voice Commands</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Get started by adding a new voice command.
            </p>
            <div className="mt-6">
              <Button onClick={handleAddNewCommand}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add New Command
              </Button>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground pt-4 border-t">
        <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" />
        Command recognition execution are subjected to outlook policies

      </CardFooter>
    </Card>
  );
}