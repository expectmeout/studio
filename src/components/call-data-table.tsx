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
  Columns,
  Download
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
  
  // Responsive column visibility state
  const [columnVisibility, setColumnVisibility] = React.useState<{
    [key: string]: boolean;
  }>({
    phoneNumber: true,
    duration: true,
    callType: true, 
    appointmentBooked: true,
    rating: true,
    callTime: true,
    actions: true
  });
  
  // Set initial visibility based on screen size
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) { // Mobile breakpoint
        setColumnVisibility(prev => ({
          ...prev,
          phoneNumber: true,     // Always show on mobile
          duration: false,       // Hide on mobile
          callType: false,       // Hide on mobile
          appointmentBooked: true, // Always show on mobile
          rating: false,         // Hide on mobile
          callTime: false,       // Hide on mobile
          actions: true          // Always show on mobile
        }));
      } else {
        // On desktop, show all columns
        setColumnVisibility({
          phoneNumber: true,
          duration: true,
          callType: true,
          appointmentBooked: true,
          rating: true,
          callTime: true,
          actions: true
        });
      }
    };
    
    // Initialize column visibility based on current screen size
    handleResize();
    
    // Listen for window resize events
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [selectedCall, setSelectedCall] = React.useState<Call | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = React.useState(false);

  const handleDownload = async (call: Call) => {
    if (!call.recordingUrl) {
      console.error('No recording URL available');
      return;
    }
    
    try {
      const response = await fetch(call.recordingUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${call.phoneNumber.replace(/\D/g, '')}_${format(call.callTime, 'yyyy-MM-dd')}.wav`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (error) {
      console.error('Error downloading file:', error);
      // You might want to show a toast/notification to the user here
    }
  };

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

  const toggleColumnFilter = (filterType: 'appointmentBooked', value: 'Yes' | 'No') => {
    setColumnFilters(prev => {
      const currentFilter = prev[filterType];
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

  // Add toggle column visibility function with mobile optimization
  const toggleColumnVisibility = (columnKey: string) => {
    setColumnVisibility(prev => {
      // Count currently visible columns
      const visibleCount = Object.values(prev).filter(v => v).length;
      const column = columns.find(c => String(c.key) === columnKey);
      
      // If we're on mobile and trying to hide a high priority column when we're at the minimum
      if (window.innerWidth < 768 && 
          column?.priority === 'high' && 
          visibleCount <= 3 && 
          prev[columnKey]) {
        return prev; // Don't allow hiding high priority columns on mobile when at minimum
      }
      
      return {
        ...prev,
        [columnKey]: !prev[columnKey]
      };
    });
  };
  
  // Define column properties with a new 'priority' field
  const columns: { 
    key: SortKey; 
    label: string; 
    headerClassName?: string; 
    cellClassName?: string; 
    render?: (call:Call) => React.ReactNode;
    priority?: 'high' | 'medium' | 'low'; // High priority columns show on all devices
  }[] = [
    { key: "phoneNumber", label: "Phone Number", headerClassName: "w-[180px]", priority: 'high' },
    { key: "duration", label: "Duration", render: (call) => formatDuration(call.duration), priority: 'low' },
    { key: "callType", label: "Call Type", render: (call) => (
      <div className="flex items-center gap-2">
        <CallTypeIcon type={call.callType} />
        {call.callType}
      </div>
    ), priority: 'medium' },
    { key: "appointmentBooked", label: "Appointment", render: (call) => (
      call.appointmentBooked ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-red-500" />
    ), priority: 'high' },
    { key: "rating", label: "Rating", render: (call) => call.rating > 0 ? <RatingStars rating={call.rating} /> : <span className="text-muted-foreground">N/A</span>, priority: 'low' },
    { key: "callTime", label: "Call Time", render: (call) => format(call.callTime, "MMM d, yyyy HH:mm"), headerClassName: "w-[200px]", priority: 'medium' },
    { 
      key: "actions", 
      label: "Recording", 
      priority: 'high',
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
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Filter calls..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="max-w-sm border-primary dark:border-input"
            />
            <div className="flex gap-2 ml-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Columns className="mr-2 h-4 w-4" /> Columns
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px]">
                  <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {columns.map((column) => (
                    <DropdownMenuCheckboxItem
                      key={String(column.key)}
                      className="capitalize"
                      checked={columnVisibility[String(column.key)]}
                      onCheckedChange={() => toggleColumnVisibility(String(column.key))}
                      disabled={column.priority === 'high' && 
                        Object.values(columnVisibility).filter(v => v).length <= 3}
                    >
                      {String(column.key).replace(/([A-Z])/g, ' $1').trim()}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <ListFilter className="mr-2 h-4 w-4" /> Filters <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Filter by Appointment Booked</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {uniqueAppointmentStatus.map((status) => (
                    <DropdownMenuCheckboxItem
                      key={status}
                      checked={columnFilters.appointmentBooked.includes(status as 'Yes' | 'No')}
                      onCheckedChange={() => toggleColumnFilter('appointmentBooked', status as 'Yes' | 'No')}
                    >
                      {status}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map(col => 
                    columnVisibility[String(col.key)] ? (
                      <TableHead key={String(col.key)} className={`${col.headerClassName || ''} px-1 sm:px-3 py-1`}>
                        {col.key === 'actions' ? (
                          <span className="px-0">{col.label}</span>
                        ) : (
                          <Button 
                            variant="ghost" 
                            onClick={() => handleSort(col.key)} 
                            className="group px-0 hover:bg-transparent"
                          >
                            {col.label}
                            {renderSortIcon(col.key)}
                          </Button>
                        )}
                      </TableHead>
                    ) : null
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {calls.length > 0 ? (
                  calls.map((call) => (
                    <TableRow key={call.id}>
                      {columns.map(col =>
                        columnVisibility[String(col.key)] ? (
                          <TableCell 
                            key={`${call.id}-${String(col.key)}`} 
                            className={`${col.cellClassName || ''} px-1 sm:px-3 py-1`}
                          >
                            {col.render ? col.render(call) : String(call[col.key as keyof Call] ?? '')}
                          </TableCell>
                        ) : null
                      )}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="text-center">
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
        </div>
      </CardContent>

      {selectedCall && (
        <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
          <DialogContent className="w-[95vw] max-w-[600px] max-h-[80vh] flex flex-col dark:bg-card sm:max-w-[600px]">
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
                    <pre className="text-sm whitespace-pre-wrap text-foreground">
                      {selectedCall.transcript}
                    </pre>
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
            <DialogFooter className="gap-2">
              {selectedCall?.recordingUrl && (
                <button
                  onClick={() => handleDownload(selectedCall)}
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-[#fafafa] hover:bg-primary/90 h-10 px-4 py-2 dark:text-[#fafafa]"
                >
                  <Download className="mr-2 h-4 w-4" /> Download
                </button>
              )}
              <Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
}
