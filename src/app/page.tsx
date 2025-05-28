
"use client"; // Required for useState and event handlers

import * as React from "react"; // Import React
import { Phone, CalendarDays, Clock, Star as StarIcon, UserCircle, Settings, CreditCard, LogOut } from "lucide-react";
import { KpiCard } from "@/components/kpi-card";
import { CallVolumeChart } from "@/components/call-volume-chart";
import { CallDataTable } from "@/components/call-data-table";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserAccountNav } from "@/components/user-account-nav"; // Import UserAccountNav
import { Button } from "@/components/ui/button"; // Import Button for Login
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

// Define a type for our mock user
interface MockUser {
  name: string;
  email: string;
  image?: string; // Optional image URL for avatar
}

export default function DashboardPage() {
  // State for fetched calls and chart data
  const [allCalls, setAllCalls] = React.useState<Call[]>([]);
  const [callsLastWeekForKpis, setCallsLastWeekForKpis] = React.useState<Call[]>([]);
  const [totalCalls, setTotalCalls] = React.useState(0);
  const [appointmentsBooked, setAppointmentsBooked] = React.useState(0);
  const [averageCallDuration, setAverageCallDuration] = React.useState(0);
  const [averageRating, setAverageRating] = React.useState(0);
  const [callVolumeData, setCallVolumeData] = React.useState<{ date: string; calls: number }[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);


  // Mock user state
  const [currentUser, setCurrentUser] = React.useState<MockUser | null>(null);

  React.useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const fetchedCalls = await fetchAllCalls(30);
      setAllCalls(fetchedCalls);

      const lastWeekKpiCalls = getCallsLastWeek(fetchedCalls);
      setCallsLastWeekForKpis(lastWeekKpiCalls);

      setTotalCalls(getTotalCalls(lastWeekKpiCalls));
      setAppointmentsBooked(getAppointmentsBooked(lastWeekKpiCalls));
      setAverageCallDuration(getAverageCallDuration(lastWeekKpiCalls));
      setAverageRating(getAverageRating(lastWeekKpiCalls));
      setCallVolumeData(getCallVolumeLastWeek(lastWeekKpiCalls));
      setIsLoading(false);
    }
    loadData();
  }, []);

  const handleLogin = () => {
    setCurrentUser({ name: "Demo User", email: "demo@example.com" });
  };

  const handleLogout = () => {
    setCurrentUser(null);
    console.log("User logged out");
  };

  const handleSettings = () => {
    console.log("Settings clicked");
    // Placeholder for navigation or modal
  };

  const handleBilling = () => {
    console.log("Billing clicked");
    // Placeholder for navigation or modal
  };

  // Display loading state for KPIs
  const kpiValue = (value: string | number) => isLoading ? "..." : value;
  const kpiFormattedDuration = (duration: number) => isLoading ? "..." : formatDuration(duration);


  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary">
            <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z" />
            <path d="M16.5 16.5A6.5 6.5 0 005.5 5.5" />
            <path d="M12 4v1.5" />
            <path d="M12 18.5V20" />
            <path d="M4 12h1.5" />
            <path d="M18.5 12H20" />
            <path d="m17 7-1-1" />
            <path d="m8 16 1 1" />
          </svg>
          <h1 className="text-xl font-semibold text-foreground">Call Insight</h1>
        </div>
        <div className="ml-auto flex items-center gap-4">
          {currentUser ? (
            <UserAccountNav
              user={currentUser}
              onSettingsClick={handleSettings}
              onBillingClick={handleBilling}
              onLogoutClick={handleLogout}
            />
          ) : (
            <Button variant="outline" onClick={handleLogin}>
              Log In
            </Button>
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
            value={isLoading ? "..." : `${averageRating} / 5`}
            icon={StarIcon}
            description="Last 7 days"
          />
        </div>

        <div className="grid gap-4 md:gap-8 lg:grid-cols-1">
          {isLoading ? (
             <div className="rounded-lg border bg-card text-card-foreground shadow-sm h-[350px] flex items-center justify-center"><p>Loading chart data...</p></div>
          ) : (
            <CallVolumeChart data={callVolumeData} />
          )}
        </div>

        <div className="grid gap-4 md:gap-8 lg:grid-cols-1">
          {isLoading ? (
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm h-[400px] flex items-center justify-center"><p>Loading call data...</p></div>
          ) : (
            <CallDataTable calls={allCalls} />
          )}
        </div>
      </main>
      <footer className="border-t p-4 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Call Insight. All rights reserved.
      </footer>
    </div>
  );
}

