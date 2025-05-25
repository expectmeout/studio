import { subDays, format } from 'date-fns';

export type Call = {
  id: string;
  phoneNumber: string;
  duration: number; // in seconds
  callType: 'Incoming' | 'Outgoing' | 'Missed';
  appointmentBooked: boolean;
  rating: number; // 1-5, 0 if not rated
  callTime: Date;
};

const generateRandomPhoneNumber = (): string => {
  return `(${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`;
};

const callTypes: Call['callType'][] = ['Incoming', 'Outgoing', 'Missed'];

export const mockCalls: Call[] = Array.from({ length: 150 }, (_, i) => {
  const callTime = subDays(new Date(), Math.floor(Math.random() * 30)); // Calls within the last 30 days
  const callType = callTypes[Math.floor(Math.random() * callTypes.length)];
  const duration = callType === 'Missed' ? 0 : Math.floor(Math.random() * 1800) + 30; // 30s to 30min
  const appointmentBooked = callType !== 'Missed' && Math.random() > 0.7;
  const rating = callType !== 'Missed' && appointmentBooked ? Math.floor(Math.random() * 3) + 3 : (callType !== 'Missed' ? Math.floor(Math.random() * 4) + 1 : 0);

  return {
    id: `call_${i + 1}`,
    phoneNumber: generateRandomPhoneNumber(),
    duration,
    callType,
    appointmentBooked,
    rating,
    callTime,
  };
}).sort((a, b) => b.callTime.getTime() - a.callTime.getTime());


export const getCallsLastWeek = (): Call[] => {
  const oneWeekAgo = subDays(new Date(), 7);
  return mockCalls.filter(call => call.callTime >= oneWeekAgo);
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

export const getCallVolumeLastWeek = (calls: Call[]): { date: string; calls: number }[] => {
  const dailyCounts: { [key: string]: number } = {};
  for (let i = 6; i >= 0; i--) {
    const day = subDays(new Date(), i);
    dailyCounts[format(day, 'MMM d')] = 0;
  }

  calls.forEach(call => {
    const dayKey = format(call.callTime, 'MMM d');
    if (dailyCounts.hasOwnProperty(dayKey)) {
      dailyCounts[dayKey]++;
    }
  });
  
  return Object.entries(dailyCounts).map(([date, count]) => ({ date, calls: count }));
};
