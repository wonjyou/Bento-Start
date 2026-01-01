
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { getDailyInsight } from '../../services/geminiService';
import { Calendar as CalendarIcon } from 'lucide-react';

interface GreetingProps {
  userName: string;
  calendarConnected: boolean;
}

interface CalendarEvent {
  id: string;
  title: string;
  time: string;
  color: string;
}

export const Greeting: React.FC<GreetingProps> = ({ userName, calendarConnected }) => {
  const [time, setTime] = useState(new Date());
  const [insight, setInsight] = useState('...');
  const [events, setEvents] = useState<CalendarEvent[]>([
    { id: '1', title: 'Product Sync', time: '10:00 AM', color: 'bg-blue-400' },
    { id: '2', title: 'Lunch with Team', time: '12:30 PM', color: 'bg-emerald-400' },
    { id: '3', title: 'Design Review', time: '3:00 PM', color: 'bg-purple-400' },
  ]);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 60000);
    getDailyInsight(userName).then(setInsight);
    return () => clearInterval(timer);
  }, [userName]);

  return (
    <div className="flex flex-col h-full justify-between overflow-hidden">
      <div className="overflow-hidden">
        <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest mb-1 truncate">
          {format(time, 'EEE, MMM do')}
        </p>
        <p className="text-xs opacity-60 italic font-light line-clamp-2 mb-4">
          {insight}
        </p>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
              <CalendarIcon size={12} /> {calendarConnected ? 'Schedule' : 'Events'}
            </div>
            {!calendarConnected && (
              <span className="text-[8px] text-amber-500 font-bold uppercase bg-amber-50 px-1 rounded">Sample</span>
            )}
          </div>
          <div className="space-y-1.5 max-h-[140px] overflow-y-auto no-scrollbar">
            {events.map(event => (
              <div key={event.id} className="flex items-center justify-between text-[11px] group">
                <div className="flex items-center gap-2 truncate">
                  <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${event.color}`} />
                  <span className="font-medium text-slate-700 truncate">{event.title}</span>
                </div>
                <span className="text-slate-400 shrink-0 tabular-nums ml-2">{event.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
