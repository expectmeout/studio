import { Phone, CalendarDays, Clock, Star as StarIcon } from "lucide-react";
import { KpiCard } from "@/components/kpi-card";
import { CallVolumeChart } from "@/components/call-volume-chart";
import { CallDataTable } from "@/components/call-data-table";
import { ThemeToggle } from "@/components/theme-toggle";
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

export default async function DashboardPage() {
  // Fetch all calls for the last 30 days (default) for the table and broader analysis
  const allFetchedCalls: Call[] = await fetchAllCalls(30);

  // Filter these calls to get data specifically for the last 7 days for KPIs
  const callsLastWeekForKpis: Call[] = getCallsLastWeek(allFetchedCalls);

  const totalCalls = getTotalCalls(callsLastWeekForKpis);
  const appointmentsBooked = getAppointmentsBooked(callsLastWeekForKpis);
  const averageCallDuration = getAverageCallDuration(callsLastWeekForKpis);
  const averageRating = getAverageRating(callsLastWeekForKpis);
  const callVolumeData = getCallVolumeLastWeek(callsLastWeekForKpis);

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">
        <div className="flex items-center gap-2">
           {/* Placeholder for a logo or app icon if available */}
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
        <div className="ml-auto">
          <ThemeToggle />
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-6 p-4 sm:px-6 sm:py-0 md:gap-8 md:p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            title="Total Calls"
            value={totalCalls}
            icon={Phone}
            description="Last 7 days"
          />
          <KpiCard
            title="Appointments Booked"
            value={appointmentsBooked}
            icon={CalendarDays}
            description="Last 7 days"
          />
          <KpiCard
            title="Avg. Call Duration"
            value={formatDuration(averageCallDuration)}
            icon={Clock}
            description="Last 7 days"
          />
          <KpiCard
            title="Avg. Rating"
            value={`${averageRating} / 5`}
            icon={StarIcon}
            description="Last 7 days"
          />
        </div>

        <div className="grid gap-4 md:gap-8 lg:grid-cols-1">
          <CallVolumeChart data={callVolumeData} />
        </div>

        <div className="grid gap-4 md:gap-8 lg:grid-cols-1">
          {/* Displaying all fetched calls (e.g., last 30 days) for the table */}
          <CallDataTable calls={allFetchedCalls} /> 
        </div>
      </main>
      <footer className="border-t p-4 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Call Insight. All rights reserved.
      </footer>
    </div>
  );
}
