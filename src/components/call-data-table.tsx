"use client";

import * as React from "react";
import { format } from "date-fns";
import { Star, CheckCircle2, XCircle, ChevronDown, Columns, ListFilter, Play, Download } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { 
  DropdownMenu, 
  DropdownMenuCheckboxItem, 
  DropdownMenuContent, 
  DropdownMenuTrigger, 
  DropdownMenuLabel, 
  DropdownMenuSeparator 
} from "./ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { ScrollArea } from "./ui/scroll-area";

// Define the Call type since we're not importing it
interface Call {
  id: string;
  phoneNumber: string;
  duration: number;
  callType?: string;  // Optional since we're removing this
  appointmentBooked: boolean;
  rating: number;
  callTime: Date;
  recordingUrl?: string;
  transcript?: string;
}

type SortKey = keyof Omit<Call, 'callType'> | 'actions';

interface CallDataTableProps {
  calls: Call[];
}

const formatPhoneNumber = (phoneNumber: string): string => {
  // Simple phone number formatting
  const cleaned = ('' + phoneNumber).replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  return match ? `(${match[1]}) ${match[2]}-${match[3]}` : phoneNumber;
};

const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

const renderRating = (rating: number) => {
  return (
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
};

export function CallDataTable({ calls: initialCalls }: CallDataTableProps) {
  const [calls, setCalls] = React.useState<Call[]>(initialCalls);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [sortKey, setSortKey] = React.useState<SortKey | null>(null);
  const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">("asc");
  const [columnFilters, setColumnFilters] = React.useState<{
    appointmentBooked: ('Yes' | 'No')[];
  }>({ appointmentBooked: [] });

  // Responsive column visibility state
  const [columnVisibility, setColumnVisibility] = React.useState<Record<string, boolean>>({
    phoneNumber: true,
    duration: true,
    appointmentBooked: true,
    rating: true,
    callTime: true,
    actions: true,
  });

  // Set initial visibility based on screen size
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) { // Mobile breakpoint
        setColumnVisibility({
          phoneNumber: true,    // Show phone number
          duration: false,      // Hide on mobile
          appointmentBooked: true, // Show appointment status
          rating: false,        // Hide on mobile
          callTime: false,      // Hide on mobile
          actions: true         // Show actions (recording)
        });
      } else {
        // On desktop, show all columns except callType
        setColumnVisibility({
          phoneNumber: true,
          duration: true,
          appointmentBooked: true,
          rating: true,
          callTime: true,
          actions: true,
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

  const renderSortIcon = (key: SortKey | null) => {
    if (key === 'actions' || key === null) return null; 
    if (sortKey === key) {
      return sortDirection === "asc" ? 
        <ChevronDown className="ml-2 h-4 w-4 opacity-50 group-hover:opacity-100 transition-opacity" /> : 
        <ChevronDown className="ml-2 h-4 w-4 opacity-50 group-hover:opacity-100 transition-opacity rotate-180" />;
    }
    return <ChevronDown className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-50 transition-opacity" />;
  };

  // Add toggle column visibility function with mobile optimization
  const toggleColumnVisibility = (columnKey: string) => {
    setColumnVisibility(prev => {
      // Count currently visible columns
      const visibleCount = Object.values(prev).filter(v => v).length;
      const column = columns.find(c => String(c.key) === columnKey);
      
      // If we're on mobile and trying to hide a high priority column when we're at the minimum
      if (typeof window !== 'undefined' && window.innerWidth < 768 && 
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
    priority: 'high' | 'medium' | 'low';
    render: (call: Call) => React.ReactNode;
    headerClassName?: string;
    cellClassName?: string;
  }[] = [
    {
      key: 'phoneNumber',
      label: 'Phone Number',
      priority: 'high',
      render: (call: Call) => <div className="font-medium">{formatPhoneNumber(call.phoneNumber)}</div>,
      headerClassName: 'w-[120px] sm:w-auto',
      cellClassName: ''
    },
    { 
      key: 'duration', 
      label: 'Duration', 
      render: (call: Call) => formatDuration(call.duration), 
      priority: 'low' 
    },
    { 
      key: 'appointmentBooked', 
      label: 'Appt', 
      render: (call: Call) => (
        call.appointmentBooked ? 
          <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" /> : 
          <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
      ), 
      priority: 'high' 
    },
    { 
      key: 'rating', 
      label: 'Rating', 
      render: (call: Call) => renderRating(call.rating), 
      priority: 'low' 
    },
    { 
      key: 'callTime', 
      label: 'Time', 
      render: (call: Call) => format(call.callTime, 'MMM d, h:mm a'), 
      priority: 'medium',
      headerClassName: 'w-[150px] sm:w-[200px]'
    },
    { 
      key: 'actions', 
      label: 'Recording', 
      render: (call: Call) => (
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0"
          onClick={() => handleViewDetails(call)}
        >
          <Play className="h-4 w-4" />
        </Button>
      ),
      priority: 'high',
      headerClassName: 'text-right',
      cellClassName: 'text-right'
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Call Log</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <Input
              placeholder="Filter calls..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="w-full sm:max-w-sm border-primary dark:border-input hidden sm:block" // Hide on mobile
            />
            <div className="flex gap-2 w-full sm:w-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="text-xs sm:text-sm flex-grow sm:flex-grow-0">
                    <Columns className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" /> Columns
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
                      {column.label}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="text-xs sm:text-sm flex-grow sm:flex-grow-0">
                    <ListFilter className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" /> Filters <ChevronDown className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
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
            <Table className="w-full">
              <TableHeader>
                <TableRow>
              {columns.map(col => 
                columnVisibility[String(col.key)] ? (
                  <TableHead key={String(col.key)} className={`${col.headerClassName || ''} px-1 sm:px-3 py-1 whitespace-nowrap`}>
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
                        className={`${col.cellClassName || ''} px-1 sm:px-3 py-1 whitespace-nowrap`}
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
