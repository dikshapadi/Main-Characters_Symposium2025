"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ConnectAssistantTab from "@/components/voice-control/connect-assistant-tab";
import VoiceCommandsTab from "@/components/voice-control/voice-commands-tab";
import CommandActivityTab from "@/components/voice-control/command-activity-tab";
import { AppShell } from "@/components/layout/app-shell"; // Import AppShell

export default function VoiceControlPage() {
  const [activeTab, setActiveTab] = useState("connect");
  const [isDeviceConnected, setIsDeviceConnected] = useState(false); // Track connection status

  return (
      <div className="space-y-6">
        <CardHeader className="p-0">
          <CardTitle className="text-3xl font-bold tracking-tight">Work automation</CardTitle>
          <CardDescription>
            Integrate your outlook account to control application features using voice commands.
          </CardDescription>
        </CardHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="connect">Connect Assistant</TabsTrigger>
            <TabsTrigger
              value="commands"
              disabled={!isDeviceConnected} // Disable tab if not connected
              className={!isDeviceConnected ? "opacity-50 cursor-not-allowed" : ""}
            >
              Voice Commands
            </TabsTrigger>
            <TabsTrigger value="activity">Command Activity</TabsTrigger>
          </TabsList>
          <TabsContent value="connect" className="mt-6">
            <ConnectAssistantTab onConnect={() => setIsDeviceConnected(true)} />
          </TabsContent>
          <TabsContent
            value="commands"
            className={`mt-6 ${!isDeviceConnected ? "pointer-events-none opacity-50" : ""}`}
          >
            <VoiceCommandsTab />
          </TabsContent>
          <TabsContent value="activity" className="mt-6">
            <CommandActivityTab />
          </TabsContent>
        </Tabs>
      </div>
  );
}