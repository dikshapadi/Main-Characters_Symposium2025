"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Activity, AlertCircle, CheckCircle2, RefreshCw, Trash2 } from "lucide-react";
import { formatDistanceToNow, parseISO } from "date-fns";
import { useActivity } from "@/context/activity-context";

export default function CommandActivityTab() {
  const { activities, clearActivities } = useActivity();

  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Command Activity Log</CardTitle>
          <CardDescription>
            View the history of voice commands processed by the application.
          </CardDescription>
        </div>
        <Button variant="destructive" size="sm" onClick={clearActivities} disabled={activities.length === 0}>
          <Trash2 className="mr-2 h-4 w-4" />
          Clear Log
        </Button>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] w-full pr-4">
          {activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Activity className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No command activity yet.</p>
              <p className="text-sm text-muted-foreground">
                Once you use voice commands, they will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 border rounded-md bg-card hover:shadow-md transition-shadow">
                  <div>
                    {activity.status === "success" ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      "{activity.command}"
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.details}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDistanceToNow(parseISO(activity.timestamp), { addSuffix: true })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}