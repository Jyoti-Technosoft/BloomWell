/**
 * Date utility functions for dynamic date generation
 */

// Generate dates from today to next 7 days
export function generateNextSevenDays(): string[] {
  const dates: string[] = [];
  const today = new Date();
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    // Format as YYYY-MM-DD for consistency with database
    const formattedDate = date.toISOString().split('T')[0];
    dates.push(formattedDate);
  }
  
  return dates;
}

// Generate dates from today to next N days
export function generateNextNDays(days: number): string[] {
  const dates: string[] = [];
  const today = new Date();
  
  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    // Format as YYYY-MM-DD for consistency with database
    const formattedDate = date.toISOString().split('T')[0];
    dates.push(formattedDate);
  }
  
  return dates;
}

// Generate default time slots for any day
export function generateDefaultTimeSlots(): string[] {
  return [
    '8:00 AM',
    '9:00 AM', 
    '10:00 AM',
    '11:00 AM',
    '12:00 PM',
    '1:00 PM',
    '2:00 PM',
    '3:00 PM',
    '4:00 PM',
    '5:00 PM'
  ];
}

// Generate extended time slots (more options)
export function generateExtendedTimeSlots(): string[] {
  return [
    '7:00 AM',
    '7:30 AM',
    '8:00 AM',
    '8:30 AM',
    '9:00 AM',
    '9:30 AM',
    '10:00 AM',
    '10:30 AM',
    '11:00 AM',
    '11:30 AM',
    '12:00 PM',
    '12:30 PM',
    '1:00 PM',
    '1:30 PM',
    '2:00 PM',
    '2:30 PM',
    '3:00 PM',
    '3:30 PM',
    '4:00 PM',
    '4:30 PM',
    '5:00 PM',
    '5:30 PM',
    '6:00 PM'
  ];
}

// Check if a date is a weekend (Saturday/Sunday)
export function isWeekend(date: string): boolean {
  const d = new Date(date);
  const day = d.getDay();
  return day === 0 || day === 6; // 0 = Sunday, 6 = Saturday
}

// Check if a date is today
export function isToday(date: string): boolean {
  const today = new Date().toISOString().split('T')[0];
  return date === today;
}

// Check if a date is in the past
export function isPast(date: string): boolean {
  const today = new Date().toISOString().split('T')[0];
  return date < today;
}

// Format date for display
export function formatDateForDisplay(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric', 
    month: 'long', 
    day: 'numeric'
  });
}

// Format date for short display (e.g., "Mon, Jan 15")
export function formatDateForShortDisplay(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short', 
    day: 'numeric'
  });
}

// Get relative date description (e.g., "Today", "Tomorrow", "This Friday")
export function getRelativeDateDescription(date: string): string {
  const today = new Date();
  const targetDate = new Date(date);
  const todayStr = today.toISOString().split('T')[0];
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];
  
  if (date === todayStr) {
    return 'Today';
  } else if (date === tomorrowStr) {
    return 'Tomorrow';
  } else {
    // Return day name for other dates
    return targetDate.toLocaleDateString('en-US', { weekday: 'long' });
  }
}

// Generate time slots based on date type (weekend vs weekday)
export function generateTimeSlotsForDate(date: string): string[] {
  if (isWeekend(date)) {
    // Weekend hours might be more limited
    return [
      '9:00 AM',
      '10:00 AM',
      '11:00 AM',
      '12:00 PM',
      '1:00 PM',
      '2:00 PM',
      '3:00 PM'
    ];
  } else {
    // Weekday hours
    return generateDefaultTimeSlots();
  }
}
