
"use client";

import * as React from "react";
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggle } from '@/components/theme-toggle';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext"; // Import useAuth
import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsPage() {
  const router = useRouter();
  const { user, isLoading: authIsLoading, session } = useAuth(); // Get user from context

  React.useEffect(() => {
    if (!authIsLoading && !session) {
      router.replace('/'); // Redirect to login if not authenticated
    }
  }, [authIsLoading, session, router]);

  const getInitials = (name?: string | null, email?: string | null): string => {
    if (name) {
        const names = name.split(" ");
        let initials = names[0].substring(0, 1).toUpperCase();
        if (names.length > 1 && names[names.length-1]) {
          initials += names[names.length - 1].substring(0, 1).toUpperCase();
        }
        return initials;
    }
    if (email) {
        return email.substring(0,1).toUpperCase();
    }
    return "U";
  };

  if (authIsLoading || !session) {
    return (
      <div className="flex min-h-screen w-full flex-col bg-background">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">
          <Button variant="outline" size="icon" onClick={() => router.push('/')} aria-label="Back to Dashboard" disabled>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-semibold text-foreground">Settings</h1>
        </header>
        <main className="flex flex-1 flex-col items-center justify-start gap-6 p-4 sm:px-6 md:gap-8 md:p-10">
          <Card className="w-full max-w-2xl shadow-lg">
            <CardHeader>
              <Skeleton className="h-7 w-3/5" />
              <Skeleton className="h-4 w-4/5 mt-1" />
            </CardHeader>
            <CardContent className="space-y-8 pt-6">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-20 w-20 rounded-full" />
                <div>
                  <Skeleton className="h-6 w-32 mb-1" />
                  <Skeleton className="h-4 w-40" />
                </div>
              </div>
              <div className="space-y-3">
                <Skeleton className="h-5 w-24 mb-1" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-3">
                <Skeleton className="h-5 w-24 mb-1" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-3">
                <Skeleton className="h-5 w-24 mb-1" />
                <Skeleton className="h-10 w-full" />
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const displayName = user?.user_metadata?.full_name || user?.email || "User";
  const displayEmail = user?.email || "No email provided";
  const avatarUrl = user?.user_metadata?.avatar_url;


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
                {avatarUrl ? (
                  <AvatarImage src={avatarUrl} alt={displayName} data-ai-hint="user avatar" />
                ) : (
                   <AvatarFallback>{getInitials(displayName, displayEmail)}</AvatarFallback>
                )}
              </Avatar>
              <div>
                <p className="text-xl font-semibold text-foreground">{displayName}</p>
                <p className="text-md text-muted-foreground">{displayEmail}</p>
              </div>
            </div>

            <div className="space-y-3">
                <h3 className="text-md font-medium text-foreground">Full Name</h3>
                <p className="text-sm text-foreground p-3 border rounded-md bg-muted/20">{displayName}</p>
            </div>

            <div className="space-y-3">
                <h3 className="text-md font-medium text-foreground">Email Address</h3>
                <p className="text-sm text-foreground p-3 border rounded-md bg-muted/20">{displayEmail}</p>
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
