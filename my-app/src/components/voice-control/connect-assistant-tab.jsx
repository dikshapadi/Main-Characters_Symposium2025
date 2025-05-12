"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Headphones, Link as LinkIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ConnectAssistantTab({ onConnect }) {
  const { toast } = useToast();
  const [deviceId, setDeviceId] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [isConnected, setIsConnected] = useState(false); // Mock state
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = () => {
    if (!deviceId || !accessToken) {
      toast({
        title: "Missing Information",
        description: "Please enter both Device ID and Access Token.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsConnected(true);
      setIsLoading(false);
      toast({
        title: "Connection Successful",
        description: "Your voice assistant is now connected.",
      });
      onConnect(); // Notify parent component about the connection
    }, 1500);
  };

  const handleDisconnect = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsConnected(false);
      setDeviceId("");
      setAccessToken("");
      setIsLoading(false);
      toast({
        title: "Disconnected",
        description: "Your voice assistant has been disconnected.",
      });
    }, 1000);
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Outlook Integration</CardTitle>
        <CardDescription>
          Connect outlook to enable command executor and task automation.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8 pt-6">
        <div className="flex flex-col items-center text-center">
          <div className="p-4 bg-primary/10 rounded-full mb-4">
            <Headphones className="h-12 w-12 text-primary" />
          </div>
          <h2 className="text-xl font-semibold">Connect Your Outlook</h2>
          <p className="text-muted-foreground max-w-md">
            Enter your outlook details below to enable voice commands for task automation and app navigation.
          </p>
        </div>

        {isConnected ? (
          <div className="text-center space-y-4 p-4 border border-green-500 bg-green-500/10 rounded-md">
            <p className="text-lg font-medium text-green-700 dark:text-green-400">Outlook connected!</p>
            <p className="text-muted-foreground">Outlook ID: ****{deviceId.slice(-4)}</p>
            <Button onClick={handleDisconnect} variant="destructive" disabled={isLoading}>
              {isLoading ? "Disconnecting..." : "Disconnect Outlook"}
            </Button>
          </div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); handleConnect(); }} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="deviceId">Outlook ID</Label>
              <Input
                id="deviceId"
                placeholder="Enter your Outlook ID"
                value={deviceId}
                onChange={(e) => setDeviceId(e.target.value)}
                disabled={isLoading}
                className="bg-input/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accessToken">Access Token</Label>
              <Input
                id="accessToken"
                type="password"
                placeholder="Enter your access token"
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                disabled={isLoading}
                className="bg-input/50"
              />
            </div>
             <Button type="submit" className="w-full sm:w-auto" disabled={isLoading}>
              {isLoading ? "Connecting..." : (
                <>
                  <LinkIcon className="mr-2 h-4 w-4" /> Connect Assistant
                </>
              )}
            </Button>
          </form>
        )}
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground pt-4 border-t">
        <p>
          For security, your access token will not be displayed after connection.
        </p>
      </CardFooter>
    </Card>
  );
}