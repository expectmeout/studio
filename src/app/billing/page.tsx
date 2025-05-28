
"use client";

import * as React from "react";
import { useRouter } from 'next/navigation';
import { ArrowLeft, CreditCard, ClockIcon, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { fetchAllCalls, Call } from '@/lib/data'; // Assuming Call type is exported
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext"; // Import useAuth

const RATE_PER_MINUTE = 0.50;
const BILLING_PERIOD_DAYS = 30; 

export default function BillingPage() {
  const router = useRouter();
  const { session, isLoading: authIsLoading } = useAuth();

  const [totalMinutes, setTotalMinutes] = React.useState<number | null>(null);
  const [estimatedCost, setEstimatedCost] = React.useState<number | null>(null);
  const [isLoadingData, setIsLoadingData] = React.useState(true);

  React.useEffect(() => {
    if (!authIsLoading && !session) {
      router.replace('/'); // Redirect to login if not authenticated
    }
  }, [authIsLoading, session, router]);

  React.useEffect(() => {
    async function loadBillingData() {
      if (session) { // Only load if authenticated
        setIsLoadingData(true);
        try {
          const calls = await fetchAllCalls(BILLING_PERIOD_DAYS);
          const totalDurationSeconds = calls.reduce((sum, call) => sum + call.duration, 0);
          const minutes = Math.round(totalDurationSeconds / 60);
          setTotalMinutes(minutes);
          setEstimatedCost(minutes * RATE_PER_MINUTE);
        } catch (error) {
          console.error("Failed to load billing data:", error);
          setTotalMinutes(0);
          setEstimatedCost(0);
        } finally {
          setIsLoadingData(false);
        }
      } else {
        setIsLoadingData(false); // Not loading if no session
        setTotalMinutes(0);
        setEstimatedCost(0);
      }
    }
    if(!authIsLoading){
        loadBillingData();
    }
  }, [session, authIsLoading]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  if (authIsLoading || !session) {
     return (
      <div className="flex min-h-screen w-full flex-col bg-background">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">
          <Button variant="outline" size="icon" onClick={() => router.push('/')} aria-label="Back to Dashboard" disabled>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-semibold text-foreground">Billing</h1>
        </header>
        <main className="flex flex-1 flex-col items-center justify-start gap-6 p-4 sm:px-6 md:gap-8 md:p-10">
          <Card className="w-full max-w-2xl shadow-lg">
            <CardHeader>
                <Skeleton className="h-7 w-3/5" />
                <Skeleton className="h-4 w-4/5 mt-1" />
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                  <div className="flex items-center justify-between border-t pt-4 mt-4">
                    <Skeleton className="h-6 w-36" />
                    <Skeleton className="h-7 w-24" />
                  </div>
            </CardContent>
             <CardFooter>
                <Skeleton className="h-4 w-full" />
            </CardFooter>
          </Card>
        </main>
      </div>
    );
  }


  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">
        <Button variant="outline" size="icon" onClick={() => router.push('/')} aria-label="Back to Dashboard">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-semibold text-foreground">Billing</h1>
      </header>
      <main className="flex flex-1 flex-col items-center justify-start gap-6 p-4 sm:px-6 md:gap-8 md:p-10">
        <Card className="w-full max-w-2xl shadow-lg">
          <CardHeader>
            <CardTitle>Usage & Cost Summary</CardTitle>
            <CardDescription>
              Estimated usage and costs for the current billing period (last {BILLING_PERIOD_DAYS} days).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {isLoadingData ? (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-foreground">
                    <ClockIcon className="mr-3 h-5 w-5 text-muted-foreground" />
                    <span>Total Call Minutes</span>
                  </div>
                  <Skeleton className="h-6 w-20" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-foreground">
                    <DollarSign className="mr-3 h-5 w-5 text-muted-foreground" />
                    <span>Rate per Minute</span>
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
                <div className="flex items-center justify-between border-t pt-4 mt-4">
                  <div className="flex items-center text-foreground font-semibold">
                    <CreditCard className="mr-3 h-5 w-5 text-primary" />
                    <span>Estimated Total Cost</span>
                  </div>
                  <Skeleton className="h-7 w-24" />
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-foreground">
                    <ClockIcon className="mr-3 h-5 w-5 text-muted-foreground" />
                    <span>Total Call Minutes</span>
                  </div>
                  <span className="font-medium text-foreground">
                    {totalMinutes !== null ? `${totalMinutes} min` : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-foreground">
                    <DollarSign className="mr-3 h-5 w-5 text-muted-foreground" />
                    <span>Rate per Minute</span>
                  </div>
                  <span className="font-medium text-foreground">
                    {formatCurrency(RATE_PER_MINUTE)}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t pt-4 mt-4">
                  <div className="flex items-center text-lg font-semibold text-foreground">
                    <CreditCard className="mr-3 h-6 w-6 text-primary" />
                    <span>Estimated Total Cost</span>
                  </div>
                  <span className="text-lg font-semibold text-primary">
                    {estimatedCost !== null ? formatCurrency(estimatedCost) : 'N/A'}
                  </span>
                </div>
              </>
            )}
          </CardContent>
          <CardFooter>
            <p className="text-xs text-muted-foreground">
              This is an estimate. Actual charges may vary. Billing cycle renews based on your subscription start date.
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

    