
"use client";

import * as React from "react";
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ThemeToggle } from '@/components/theme-toggle';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const router = useRouter();
  const { user, isLoading: authIsLoading, session, updateUserCompanyName } = useAuth();
  const { toast } = useToast();

  const [companyNameInput, setCompanyNameInput] = React.useState("");
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    if (!authIsLoading && !session) {
      router.replace('/'); 
    }
    if (user && user.user_metadata?.company_name) {
      setCompanyNameInput(user.user_metadata.company_name);
    } else if (user && !user.user_metadata?.company_name) {
      setCompanyNameInput(""); // Ensure it's empty if no company name yet
    }
  }, [authIsLoading, session, router, user]);

  const getInitials = (companyName?: string | null, email?: string | null): string => {
    if (companyName) {
      const words = companyName.trim().split(/\s+/);
      if (words.length > 0 && words[0]) {
        let initials = words[0].substring(0, 1).toUpperCase();
        if (words.length > 1 && words[words.length - 1]) {
          initials += words[words.length - 1].substring(0, 1).toUpperCase();
        }
        return initials;
      }
    }
    if (email) {
      const emailPrefix = email.split('@')[0];
      if (emailPrefix) {
        const nameParts = emailPrefix.replace(/[^a-zA-Z\s.]/g, ' ').trim().split(/[.\s]+/);
        if (nameParts.length > 0 && nameParts[0]) {
            let initials = nameParts[0].substring(0, 1).toUpperCase();
            if (nameParts.length > 1 && nameParts[nameParts.length-1]) {
                initials += nameParts[nameParts.length - 1].substring(0, 1).toUpperCase();
            }
            if (initials.length > 0) return initials;
        }
        return email.substring(0, 1).toUpperCase();
      }
    }
    return "U";
  };

  const handleSaveCompanyName = async () => {
    setIsSaving(true);
    const { error } = await updateUserCompanyName(companyNameInput.trim());
    if (error) {
      toast({
        title: "Error",
        description: "Failed to update company name: " + error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Company name updated successfully.",
      });
    }
    setIsSaving(false);
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
                 <Skeleton className="h-10 w-32 mt-2" />
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

  const companyName = user?.user_metadata?.company_name;
  const email = user?.email;
  const avatarUrl = user?.user_metadata?.avatar_url;

  const displayName = companyName || email || "User";
  const displayEmail = email || "No email provided";
  const avatarFallback = getInitials(companyName, email);

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
                  <AvatarImage src={avatarUrl} alt={displayName} data-ai-hint="user avatar company" />
                ) : (
                   <AvatarFallback>{avatarFallback}</AvatarFallback>
                )}
              </Avatar>
              <div>
                <p className="text-xl font-semibold text-foreground">{displayName}</p>
                <p className="text-md text-muted-foreground">{displayEmail}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="companyName" className="text-md font-medium text-foreground">Company Name</Label>
              <Input
                id="companyName"
                placeholder="Your Company Inc."
                value={companyNameInput}
                onChange={(e) => setCompanyNameInput(e.target.value)}
                className="text-sm"
                disabled={isSaving}
              />
               <Button onClick={handleSaveCompanyName} disabled={isSaving || companyNameInput.trim() === (user?.user_metadata?.company_name || "")} className="mt-2">
                {isSaving ? (
                   <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  <> <Save className="mr-2 h-4 w-4" /> Save Company Name</>
                )}
              </Button>
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
          <CardFooter>
            <p className="text-xs text-muted-foreground">
                Changes to company name will be reflected across the application.
            </p>
          </CardFooter>
        </Card>
      </main>
       <footer className="border-t p-4 text-center text-sm text-muted-foreground mt-auto">
        © {new Date().getFullYear()} CHANLYTICS. All rights reserved.
      </footer>
    </div>
  );
}

    