import { subDays, format, startOfDay, endOfDay } from 'date-fns';
import { supabase } from './supabaseClient';

export type Call = {
  id: string;
  phoneNumber: string;
  duration: number; // in seconds
  callType: 'Incoming' | 'Outgoing' | 'Missed';
  appointmentBooked: boolean;
  rating: number; // 1-5, 0 if not rated
  callTime: Date;
};

// Type for Supabase row (assuming snake_case)
type DbCall = {
  id: string;
  phone_number: string;
  duration: number;
  call_type: 'Incoming' | 'Outgoing' | 'Missed';
  appointment_booked: boolean;
  rating: number;
  call_time: string; // Supabase returns timestamp as string
};

const mapDbCallToCall = (dbCall: DbCall): Call => ({
  id: dbCall.id,
  phoneNumber: dbCall.phone_number,
  duration: dbCall.duration,
  callType: dbCall.call_type,
  appointmentBooked: dbCall.appointment_booked,
  rating: dbCall.rating,
  callTime: new Date(dbCall.call_time),
});

/**
 * Fetches calls from Supabase within the last N days.
 * @param periodInDays Number of days to fetch calls from. Defaults to 30.
 * @returns Promise<Call[]>
 */
export const fetchAllCalls = async (periodInDays: number = 30): Promise<Call[]> => {
  const dateLimit = subDays(new Date(), periodInDays);

  const { data, error } = await supabase
    .from('calls') // Assuming your table is named 'calls'
    .select('id, phone_number, duration, call_type, appointment_booked, rating, call_time')
    .gte('call_time', dateLimit.toISOString())
    .order('call_time', { ascending: false });

  if (error) {
    console.error('Error fetching calls from Supabase:', error);
    return [];
  }

  return (data || []).map(mapDbCallToCall);
};


export const getCallsLastWeek = (allCalls: Call[]): Call[] => {
  const oneWeekAgo = startOfDay(subDays(new Date(), 6)); // Include today and go back 6 more days
  return allCalls.filter(call => call.callTime >= oneWeekAgo);
};

export const getTotalCalls = (calls: Call[]): number => calls.length;

export const getAppointmentsBooked = (calls: Call[]): number => {
  return calls.filter(call => call.appointmentBooked).length;
};

export const getAverageCallDuration = (calls: Call[]): number => {
  const connectedCalls = calls.filter(call => call.callType !== 'Missed' && call.duration > 0);
  if (connectedCalls.length === 0) return 0;
  const totalDuration = connectedCalls.reduce((sum, call) => sum + call.duration, 0);
  return Math.round(totalDuration / connectedCalls.length);
};

export const formatDuration = (seconds: number): string => {
  if (typeof seconds !== 'number' || isNaN(seconds)) {
    return '00:00';
  }
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

export const getAverageRating = (calls: Call[]): number => {
  const ratedCalls = calls.filter(call => call.rating > 0);
  if (ratedCalls.length === 0) return 0;
  const totalRating = ratedCalls.reduce((sum, call) => sum + call.rating, 0);
  return parseFloat((totalRating / ratedCalls.length).toFixed(1));
};

export const getCallVolumeLastWeek = (callsLastWeek: Call[]): { date: string; calls: number }[] => {
  const dailyCounts: { [key: string]: number } = {};
  // Initialize counts for the last 7 days (including today)
  for (let i = 6; i >= 0; i--) {
    const day = subDays(new Date(), i);
    dailyCounts[format(day, 'MMM d')] = 0;
  }

  callsLastWeek.forEach(call => {
    const dayKey = format(call.callTime, 'MMM d');
    if (dailyCounts.hasOwnProperty(dayKey)) {
      dailyCounts[dayKey]++;
    }
  });
  
  return Object.entries(dailyCounts).map(([date, count]) => ({ date, calls: count }));
};
