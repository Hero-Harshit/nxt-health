export type HistoryCategory = 'planner' | 'search' | 'payment' | 'ai' | 'vault' | 'general';

export type HistoryLog = {
  id: number;
  type: HistoryCategory;
  title: string;
  date: string;
};

// Call this function from any module to save an action
export const addHistoryLog = (type: HistoryCategory, title: string) => {
  if (typeof window === 'undefined') return;
  
  try {
    const existingLogs: HistoryLog[] = JSON.parse(localStorage.getItem('nxt_history') || '[]');
    
    // Format date (e.g., "Oct 24, 10:30 AM")
    const dateStr = new Date().toLocaleString('en-US', {
      month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
    });

    const newLog: HistoryLog = {
      id: Date.now(),
      type,
      title,
      date: dateStr
    };

    // Add to beginning of array, keep only the last 50 items to prevent storage bloat
    const updatedLogs = [newLog, ...existingLogs].slice(0, 50);
    localStorage.setItem('nxt_history', JSON.stringify(updatedLogs));
    
    // Dispatch a custom event so the UI can update in real-time if needed
    window.dispatchEvent(new Event('history_updated'));
  } catch (error) {
    console.error("Failed to save history log", error);
  }
};

export const getHistoryLogs = (): HistoryLog[] => {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem('nxt_history') || '[]');
  } catch {
    return [];
  }
};
