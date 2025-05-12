
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { getTherapistResponse } from "@/ai/flows/therapist-chat-flow";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, User, Send, Mic, MicOff, Loader2, Smile } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function AiTherapistPage() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [speechApiAvailable, setSpeechApiAvailable] = useState(false);
  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        setSpeechApiAvailable(true);
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false; // Keep false to only get final result
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          setInputValue(prev => prev ? `${prev} ${transcript}` : transcript);
        };

        recognition.onerror = (event) => {
          console.error("Speech recognition error", event.error);
          toast({ title: "Voice Error", description: `Could not recognize speech: ${event.error}`, variant: "destructive" });
          setIsRecording(false);
        };
        
        recognition.onend = () => {
          setIsRecording(false);
        };
        recognitionRef.current = recognition;
      } else {
        setSpeechApiAvailable(false);
        toast({ title: "Voice Input Not Available", description: "Your browser does not support speech recognition.", variant: "outline" });
      }
    }
  }, [toast]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(scrollToBottom, [messages, scrollToBottom]);

   useEffect(() => {
    // Send an initial greeting from the AI therapist when the page loads
    setMessages([
      {
        id: Date.now().toString(),
        sender: "ai",
        text: "Hello! I'm here to listen and support you. How are you feeling today?",
        timestamp: new Date(),
        icon: <Bot className="h-6 w-6 text-primary" />
      }
    ]);
  }, []);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: inputValue,
      timestamp: new Date(),
      icon: <User className="h-6 w-6 text-accent-foreground" />
    };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue("");
    setIsSending(true);

    try {
      const result = await getTherapistResponse({ userInput: currentInput });
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: result.aiResponse,
        timestamp: new Date(),
        icon: <Bot className="h-6 w-6 text-primary" />
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("AI therapist error:", error);
      toast({
        title: "AI Error",
        description: "Could not get a response from the AI therapist. Please try again.",
        variant: "destructive",
      });
       const errorMessage = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: "I'm sorry, I encountered an issue. Please try sending your message again.",
        timestamp: new Date(),
        icon: <Bot className="h-6 w-6 text-destructive" />
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsSending(false);
    }
  };

  const handleToggleRecording = () => {
    if (!speechApiAvailable) {
      toast({ title: "Voice Input Unavailable", description: "Speech recognition is not supported or enabled in your browser.", variant: "destructive" });
      return;
    }
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current?.start();
      setIsRecording(true);
      toast({ title: "Listening...", description: "Speak now."});
    }
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-theme(spacing.24))]">
      <Card className="flex-grow flex flex-col shadow-xl">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <Smile className="h-7 w-7 text-primary" /> AI Therapist Chat
          </CardTitle>
          <CardDescription>A safe space to talk about your thoughts and feelings. This is not a replacement for professional help.</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow p-0 overflow-hidden">
          <ScrollArea className="h-full p-4 md:p-6 space-y-6">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex items-end gap-2 w-full",
                  msg.sender === "user" ? "justify-end" : "justify-start"
                )}
              >
                {msg.sender === "ai" && <div className="self-start shrink-0">{msg.icon}</div>}
                <div
                  className={cn(
                    "max-w-[70%] p-3 rounded-xl shadow",
                    msg.sender === "user"
                      ? "bg-primary text-primary-foreground rounded-br-none"
                      : "bg-muted text-muted-foreground rounded-bl-none"
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                  <p className={cn(
                      "text-xs mt-1",
                      msg.sender === "user" ? "text-primary-foreground/70 text-right" : "text-muted-foreground/70 text-left"
                    )}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {msg.sender === "user" && <div className="self-start shrink-0">{msg.icon}</div>}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </ScrollArea>
        </CardContent>
        <CardFooter className="p-4 border-t">
          <div className="flex w-full items-center gap-2">
            <Textarea
              placeholder="Type your message or use the mic..."
              value={inputValue}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              rows={1}
              className="flex-grow resize-none min-h-[40px] max-h-[120px] text-base bg-input/50"
              disabled={isSending}
            />
            <Button 
              size="icon" 
              onClick={handleToggleRecording} 
              disabled={isSending || !speechApiAvailable}
              variant={isRecording ? "destructive" : "outline"}
              aria-label={isRecording ? "Stop recording" : "Start recording"}
            >
              {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </Button>
            <Button onClick={handleSendMessage} disabled={isSending || !inputValue.trim()} className="min-w-[80px]">
              {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              <span className="ml-2 hidden sm:inline">Send</span>
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}