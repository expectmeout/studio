
"use client";

import * as React from "react";
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggle } from '@/components/theme-toggle';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Mock user for the settings page - in a real app, this would come from auth/context
interface MockUser {
  name: string;
  email: string;
  image?: string;
}

const mockSettingsUser: MockUser = {
  name: "Demo User",
  email: "demo@example.com",
  // image: "https://placehold.co/100x100.png" // Optional placeholder
};

export default function SettingsPage() {
  const router = useRouter();
  // In a real app, user data would come from an authentication context or global state
  const [user] = React.useState<MockUser>(mockSettingsUser); 

  const getInitials = (name?: string | null) => {
    if (!name) return "";
    const names = name.split(" ");
    let initials = names[0].substring(0, 1).toUpperCase();
    if (names.length > 1) {
      initials += names[names.length - 1].substring(0, 1).toUpperCase();
    }
    return initials;
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">
        <Button variant="outline" size="icon" onClick={() => router.push('/')} aria-label="Back to Dashboard">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-semibold text-foreground">Settings</h1>
      </header>
      <main className="flex flex-1 flex-col items-center justify-start gap-6 p-4 sm:px-6 md:gap-8 md:p-10">
        <Card className="w-full max-w-2xl shadow-lg">
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Manage your account settings and preferences.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 pt-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20 text-lg">
                {user.image ? (
                  <AvatarImage src={user.image} alt={user.name} data-ai-hint="user avatar" />
                ) : (
                   <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                )}
              </Avatar>
              <div>
                <p className="text-xl font-semibold text-foreground">{user.name}</p>
                <p className="text-md text-muted-foreground">{user.email}</p>
              </div>
            </div>

            <div className="space-y-3">
                <h3 className="text-md font-medium text-foreground">Full Name</h3>
                <p className="text-sm text-foreground p-3 border rounded-md bg-muted/20">{user.name}</p>
            </div>

            <div className="space-y-3">
                <h3 className="text-md font-medium text-foreground">Email Address</h3>
                <p className="text-sm text-foreground p-3 border rounded-md bg-muted/20">{user.email}</p>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-md font-medium text-foreground">Appearance</h3>
              <div className="flex items-center justify-between rounded-md border p-3">
                <p className="text-sm text-muted-foreground">Toggle light or dark mode</p>
                <ThemeToggle />
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
       <footer className="border-t p-4 text-center text-sm text-muted-foreground mt-auto">
        © {new Date().getFullYear()} Call Insight. All rights reserved.
      </footer>
    </div>
  );
}
