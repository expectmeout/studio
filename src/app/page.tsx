
"use client";

import * as React from "react";
import { useRouter } from 'next/navigation';
import { Phone, CalendarDays, Clock, Star as StarIcon, LogIn } from "lucide-react";
import { KpiCard } from "@/components/kpi-card";
import { CallVolumeChart } from "@/components/call-volume-chart";
import { CallDataTable } from "@/components/call-data-table";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserAccountNav } from "@/components/user-account-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import {
  fetchAllCalls,
  getCallsLastWeek,
  getTotalCalls,
  getAppointmentsBooked,
  getAverageCallDuration,
  formatDuration,
  getAverageRating,
  getCallVolumeLastWeek,
} from "@/lib/data";
import type { Call } from "@/lib/data";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const router = useRouter();
  const { user, session, isLoading: authIsLoading, signInWithPassword } = useAuth();

  const [allCalls, setAllCalls] = React.useState<Call[]>([]);
  const [callsLastWeekForKpis, setCallsLastWeekForKpis] = React.useState<Call[]>([]);
  const [totalCalls, setTotalCalls] = React.useState(0);
  const [appointmentsBooked, setAppointmentsBooked] = React.useState(0);
  const [averageCallDuration, setAverageCallDuration] = React.useState(0);
  const [averageRating, setAverageRating] = React.useState(0);
  const [callVolumeData, setCallVolumeData] = React.useState<{ date: string; calls: number }[]>([]);
  const [isLoadingData, setIsLoadingData] = React.useState(true);

  // Login form state
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loginError, setLoginError] = React.useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = React.useState(false);

  React.useEffect(() => {
    async function loadData() {
      if (session) { 
        setIsLoadingData(true);
        const fetchedCalls = await fetchAllCalls(30);
        setAllCalls(fetchedCalls);

        const lastWeekKpiCalls = getCallsLastWeek(fetchedCalls);
        setCallsLastWeekForKpis(lastWeekKpiCalls);

        setTotalCalls(getTotalCalls(lastWeekKpiCalls));
        setAppointmentsBooked(getAppointmentsBooked(lastWeekKpiCalls));
        setAverageCallDuration(getAverageCallDuration(lastWeekKpiCalls));
        setAverageRating(getAverageRating(lastWeekKpiCalls));
        setCallVolumeData(getCallVolumeLastWeek(lastWeekKpiCalls));
        setIsLoadingData(false);
      } else {
        setAllCalls([]);
        setCallsLastWeekForKpis([]);
        setTotalCalls(0);
        setAppointmentsBooked(0);
        setAverageCallDuration(0);
        setAverageRating(0);
        setCallVolumeData([]);
        setIsLoadingData(false);
      }
    }
    if (!authIsLoading) { 
        loadData();
    }
  }, [session, authIsLoading]);


  const handleLoginSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);
    const { error } = await signInWithPassword(email, password);
    if (error) {
      setLoginError(error.message);
    } else {
      setEmail("");
      setPassword("");
    }
    setIsLoggingIn(false);
  };

  const handleSettings = () => {
    router.push('/settings');
  };

  const handleBilling = () => {
    router.push('/billing');
  };

  const kpiValue = (value: string | number) => (isLoadingData || authIsLoading) ? <Skeleton className="h-6 w-1/2" /> : value;
  const kpiFormattedDuration = (duration: number) => (isLoadingData || authIsLoading) ? <Skeleton className="h-6 w-1/2" /> : formatDuration(duration);


  if (authIsLoading) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background">
        <svg width="48" height="48" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="h-12 w-12 text-primary mb-4">
            <rect x="4" y="8" width="8" height="8" rx="2">
                <animate attributeName="opacity" values="0.5;1;0.5" dur="1.2s" repeatCount="indefinite" begin="0s"/>
            </rect>
            <rect x="12" y="12" width="8" height="8" rx="2">
                <animate attributeName="opacity" values="0.5;1;0.5" dur="1.2s" repeatCount="indefinite" begin="0.2s"/>
            </rect>
            <rect x="20" y="16" width="8" height="8" rx="2">
                <animate attributeName="opacity" values="0.5;1;0.5" dur="1.2s" repeatCount="indefinite" begin="0.4s"/>
            </rect>
        </svg>
        <p className="text-lg text-muted-foreground">Loading application...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4">
         <Card className="w-full max-w-sm shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
                <svg viewBox="0 0 240 50" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-8 w-auto text-foreground">
                  <g transform="translate(15 9)" fill="url(#chanlytics_logo_gradient_login)">
                    <rect x="4" y="8" width="8" height="8" rx="2"/>
                    <rect x="12" y="12" width="8" height="8" rx="2" opacity=".8"/>
                    <rect x="20" y="16" width="8" height="8" rx="2" opacity=".6"/>
                  </g>
                  <text x="50" y="50%" dominantBaseline="middle" fontFamily="'Playwright Display', sans-serif" fontSize="28" fontWeight="400" letterSpacing="1" fill="currentColor">
                    CHANLYTICS
                  </text>
                  <defs>
                    <linearGradient id="chanlytics_logo_gradient_login" x1="0" y1="0" x2="1" y2="1" gradientUnits="objectBoundingBox">
                      <stop stopColor="#4A6CF7"/>
                      <stop offset="1" stopColor="#2BC8B7"/>
                    </linearGradient>
                  </defs>
                </svg>
            </div>
            <CardTitle className="text-2xl">Welcome to CHANLYTICS</CardTitle>
            <CardDescription>Please sign in to access your dashboard.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoggingIn}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoggingIn}
                />
              </div>
              {loginError && (
                <p className="text-sm text-destructive">{loginError}</p>
              )}
              <Button type="submit" className="w-full" disabled={isLoggingIn}>
                {isLoggingIn ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing In...
                  </>
                ) : (
                  <> <LogIn className="mr-2 h-4 w-4" /> Sign In </>
                )}
              </Button>
            </form>
          </CardContent>
           <CardFooter className="text-center block">
             <p className="text-xs text-muted-foreground">
                Don't have an account? <a href="https://supabase.com/dashboard/project/_/auth/users" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">Sign up via Supabase.</a>
             </p>
          </CardFooter>
        </Card>
        <footer className="border-t p-4 text-center text-sm text-muted-foreground mt-auto w-full">
            © {new Date().getFullYear()} CHANLYTICS. All rights reserved.
        </footer>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <svg viewBox="0 0 240 50" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-6 w-auto text-foreground">
            <g transform="translate(15 9)" fill="url(#chanlytics_logo_gradient_header)">
              <rect x="4" y="8" width="8" height="8" rx="2"/>
              <rect x="12" y="12" width="8" height="8" rx="2" opacity=".8"/>
              <rect x="20" y="16" width="8" height="8" rx="2" opacity=".6"/>
            </g>
            <text x="50" y="50%" dominantBaseline="middle" fontFamily="'Playwright Display', sans-serif" fontSize="28" fontWeight="400" letterSpacing="1" fill="currentColor">
              CHANLYTICS
            </text>
            <defs>
              <linearGradient id="chanlytics_logo_gradient_header" x1="0" y1="0" x2="1" y2="1" gradientUnits="objectBoundingBox">
                <stop stopColor="#4A6CF7"/>
                <stop offset="1" stopColor="#2BC8B7"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div className="ml-auto flex items-center gap-4">
          {user && session && ( 
            <UserAccountNav
              onSettingsClick={handleSettings}
              onBillingClick={handleBilling}
            />
          )}
          <ThemeToggle />
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-6 p-4 sm:px-6 sm:py-0 md:gap-8 md:p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            title="Total Calls"
            value={kpiValue(totalCalls)}
            icon={Phone}
            description="Last 7 days"
          />
          <KpiCard
            title="Appointments Booked"
            value={kpiValue(appointmentsBooked)}
            icon={CalendarDays}
            description="Last 7 days"
          />
          <KpiCard
            title="Avg. Call Duration"
            value={kpiFormattedDuration(averageCallDuration)}
            icon={Clock}
            description="Last 7 days"
          />
          <KpiCard
            title="Avg. Rating"
            value={(isLoadingData || authIsLoading) ? <Skeleton className="h-6 w-1/2" /> : `${averageRating} / 5`}
            icon={StarIcon}
            description="Last 7 days"
          />
        </div>

        <div className="grid gap-4 md:gap-8 lg:grid-cols-1">
          {(isLoadingData || authIsLoading) ? (
             <Skeleton className="rounded-lg border bg-card text-card-foreground shadow-sm h-[350px] flex items-center justify-center"><p>Loading chart data...</p></Skeleton>
          ) : (
            <CallVolumeChart data={callVolumeData} />
          )}
        </div>

        <div className="grid gap-4 md:gap-8 lg:grid-cols-1">
          {(isLoadingData || authIsLoading) ? (
            <Skeleton className="rounded-lg border bg-card text-card-foreground shadow-sm h-[400px] flex items-center justify-center"><p>Loading call data...</p></Skeleton>
          ) : (
            <CallDataTable calls={allCalls} />
          )}
        </div>
      </main>
      <footer className="border-t p-4 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} CHANLYTICS. All rights reserved.
      </footer>
    </div>
  );
}
