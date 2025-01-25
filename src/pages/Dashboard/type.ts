
// Define a type for notifications
export interface NotificationLog {
  id: number;
  dustbinName: string;
  message: string;
  timestamp: string;
}

interface DustbinDetailChartProps {
  value: number;
  date: string;
}
// Define a type for each dustbin
export interface Dustbin {
  id: number;
  name: string;
  fullness: number; // Fullness is a percentage, so it's a number from 0 to 100
  lastUpdated: string; // Last time someone threw trash, as a string
  notified: boolean; // To track if notification has been sent
  history: DustbinDetailChartProps[]; // Historical fullness data
  color: string;
}