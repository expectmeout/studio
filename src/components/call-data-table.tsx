
"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowUpDown,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  CheckCircle2,
  XCircle,
  Star,
  ChevronDown,
  ListFilter,
  FileText,
} from "lucide-react";
import type { Call } from "@/lib/data";
import { formatDuration } from "@/lib/data";
import { format } from "date-fns";

interface CallDataTableProps {
  calls: Call[];
}

type SortKey = keyof Call | 'actions' | null;
type SortDirection = "asc" | "desc";

const CallTypeIcon = ({ type }: { type: Call["callType"] }) => {
  switch (type) {
    case "Incoming":
      return <PhoneIncoming className="h-4 w-4 text-green-500" />;
    case "Outgoing":
      return <PhoneOutgoing className="h-4 w-4 text-blue-500" />;
    case "Missed":
      return <PhoneMissed className="h-4 w-4 text-red-500" />;
    default:
      return null;
  }
};

const RatingStars = ({ rating }: { rating: number }) => (
  <div className="flex">
    {[...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
        }`}
      />
    ))}
  </div>
);

export function CallDataTable({ calls: initialCalls }: CallDataTableProps) {
  const [calls, setCalls] = React.useState<Call[]>(initialCalls);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [sortKey, setSortKey] = React.useState<SortKey>(null);
  const [sortDirection, setSortDirection] = React.useState<SortDirection>("asc");
  const [columnFilters, setColumnFilters] = React.useState<{
    appointmentBooked: ('Yes' | 'No')[];
  }>({ appointmentBooked: []});

  const [selectedCall, setSelectedCall] = React.useState<Call | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = React.useState(false);

  const handleViewDetails = (call: Call) => {
    setSelectedCall(call);
    setIsDetailModalOpen(true);
  };

  const handleSort = (key: SortKey) => {
    if (key === 'actions') return; 
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };
  
  const uniqueAppointmentStatus = ['Yes', 'No'];


  React.useEffect(() => {
    let filteredCalls = initialCalls.filter((call) =>
      call.phoneNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      call.callType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      format(call.callTime, "PPpp").toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (columnFilters.appointmentBooked.length > 0) {
      filteredCalls = filteredCalls.filter(call => 
        (columnFilters.appointmentBooked.includes('Yes') && call.appointmentBooked) ||
        (columnFilters.appointmentBooked.includes('No') && !call.appointmentBooked)
      );
    }

    if (sortKey && sortKey !== 'actions') {
      filteredCalls.sort((a, b) => {
        const valA = a[sortKey as keyof Call];
        const valB = b[sortKey as keyof Call];

        if (valA === null || valA === undefined) return 1;
        if (valB === null || valB === undefined) return -1;

        let comparison = 0;
        if (typeof valA === 'number' && typeof valB === 'number') {
          comparison = valA - valB;
        } else if (valA instanceof Date && valB instanceof Date) {
          comparison = valA.getTime() - valB.getTime();
        }
         else {
          comparison = String(valA).localeCompare(String(valB));
        }
        return sortDirection === "asc" ? comparison : -comparison;
      });
    }
    setCalls(filteredCalls);
  }, [searchTerm, sortKey, sortDirection, initialCalls, columnFilters]);

  const toggleColumnFilter = (filterType: 'appointmentBooked', value: string) => {
    setColumnFilters(prev => {
      const currentFilter = prev[filterType] as string[];
      const newFilter = currentFilter.includes(value)
        ? currentFilter.filter(item => item !== value)
        : [...currentFilter, value];
      return { ...prev, [filterType]: newFilter };
    });
  };


  const renderSortIcon = (key: SortKey) => {
    if (key === 'actions') return null; 
    if (sortKey === key) {
      return sortDirection === "asc" ? <ArrowUpDown className="ml-2 h-4 w-4 opacity-50 group-hover:opacity-100 transition-opacity" /> : <ArrowUpDown className="ml-2 h-4 w-4 opacity-50 group-hover:opacity-100 transition-opacity" />;
    }
    return <ArrowUpDown className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-50 transition-opacity" />;
  };

  const columns: { key: SortKey; label: string; headerClassName?: string, cellClassName?: string, render?: (call:Call) => React.ReactNode }[] = [
    { key: "phoneNumber", label: "Phone Number", headerClassName: "w-[180px]" },
    { key: "duration", label: "Duration", render: (call) => formatDuration(call.duration) },
    { key: "callType", label: "Call Type", render: (call) => (
      <div className="flex items-center gap-2">
        <CallTypeIcon type={call.callType} />
        {call.callType}
      </div>
    )},
    { key: "appointmentBooked", label: "Appointment", render: (call) => (
      call.appointmentBooked ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-red-500" />
    )},
    { key: "rating", label: "Rating", render: (call) => call.rating > 0 ? <RatingStars rating={call.rating} /> : <span className="text-muted-foreground">N/A</span>},
    { key: "callTime", label: "Call Time", render: (call) => format(call.callTime, "MMM d, yyyy HH:mm"), headerClassName: "w-[200px]" },
    { 
      key: "actions", 
      label: "Actions", 
      render: (call: Call) => (
        <Button variant="outline" size="sm" onClick={() => handleViewDetails(call)}>
          <FileText className="mr-2 h-4 w-4" /> View
        </Button>
      )
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Call Log</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center py-4 gap-2">
          <Input
            placeholder="Filter calls..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="max-w-sm border-primary dark:border-input"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                <ListFilter className="mr-2 h-4 w-4" /> Filters <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filter by Appointment Booked</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {uniqueAppointmentStatus.map((status) => (
                <DropdownMenuCheckboxItem
                  key={status}
                  checked={columnFilters.appointmentBooked.includes(status)}
                  onCheckedChange={() => toggleColumnFilter('appointmentBooked', status)}
                >
                  {status}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map(col => (
                  <TableHead key={String(col.key)} className={col.headerClassName}>
                     {col.key === 'actions' ? (
                        <span className="px-0">{col.label}</span>
                      ) : (
                        <Button variant="ghost" onClick={() => handleSort(col.key)} className="group px-0 hover:bg-transparent">
                          {col.label}
                          {renderSortIcon(col.key)}
                        </Button>
                      )}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {calls.length > 0 ? (
                calls.map((call) => (
                  <TableRow key={call.id}>
                    {columns.map(col => (
                      <TableCell key={`${call.id}-${String(col.key)}`} className={col.cellClassName}>
                        {col.render ? col.render(call) : String(call[col.key as keyof Call] ?? '')}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-end space-x-2 py-4">
            <div className="text-sm text-muted-foreground">
                Total {calls.length} calls
            </div>
        </div>
      </CardContent>

      {selectedCall && (
        <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col dark:bg-card">
            <DialogHeader>
              <DialogTitle>Call Details: {selectedCall.phoneNumber}</DialogTitle>
              <DialogDescription>
                Transcript and recording for the call on {format(selectedCall.callTime, "PPpp")}.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 flex-grow overflow-y-auto">
              {selectedCall.transcript ? (
                <div>
                  <h4 className="font-semibold mb-2 text-foreground">Transcript:</h4>
                  <ScrollArea className="h-[200px] w-full rounded-md border p-4 bg-muted/20">
                    <pre className="text-sm whitespace-pre-wrap text-foreground">{selectedCall.transcript}</pre>
                  </ScrollArea>
                </div>
              ) : (
                <p className="text-muted-foreground">No transcript available for this call.</p>
              )}
              {selectedCall.recordingUrl ? (
                <div className="mt-4">
                  <h4 className="font-semibold mb-2 text-foreground">Recording:</h4>
                  <audio controls src={selectedCall.recordingUrl} className="w-full">
                    Your browser does not support the audio element.
                  </audio>
                </div>
              ) : (
                <p className="mt-4 text-muted-foreground">No recording available for this call.</p>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
}
