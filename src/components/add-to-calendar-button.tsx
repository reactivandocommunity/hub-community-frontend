'use client';

import { CalendarPlus, ChevronDown } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  downloadICSFile,
  getGoogleCalendarUrl,
  getOutlookCalendarUrl,
  richTextToPlainText,
} from '@/utils/calendar';

interface AddToCalendarButtonProps {
  title: string;
  description?: unknown; // Can be string or Strapi BlocksContent
  startDate: string;
  endDate?: string;
  location?: string;
  isOnline?: boolean;
  callLink?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
}

export function AddToCalendarButton({
  title,
  description,
  startDate,
  endDate,
  location,
  isOnline,
  callLink,
  variant = 'outline',
  size = 'default',
  className = '',
}: AddToCalendarButtonProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Convert rich text to plain text for calendar description
  const plainDescription = richTextToPlainText(description);

  const calendarParams = {
    title,
    description: plainDescription,
    startDate,
    endDate,
    location,
    isOnline,
    callLink,
  };

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleGoogleCalendar = useCallback(() => {
    window.open(getGoogleCalendarUrl(calendarParams), '_blank');
    setOpen(false);
  }, [calendarParams]);

  const handleOutlookCalendar = useCallback(() => {
    window.open(getOutlookCalendarUrl(calendarParams), '_blank');
    setOpen(false);
  }, [calendarParams]);

  const handleAppleCalendar = useCallback(() => {
    downloadICSFile(calendarParams);
    setOpen(false);
  }, [calendarParams]);

  return (
    <div className="relative inline-block" ref={ref}>
      <Button
        variant={variant}
        size={size}
        className={`rounded-full gap-2 ${className}`}
        onClick={() => setOpen((prev) => !prev)}
        id="add-to-calendar-button"
      >
        <CalendarPlus className="h-4 w-4" />
        Adicionar ao Calendário
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </Button>

      {open && (
        <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-50 min-w-[220px] bg-card border border-border/60 rounded-xl shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">
          <button
            onClick={handleGoogleCalendar}
            className="flex items-center gap-3 w-full px-4 py-3 text-sm text-foreground hover:bg-primary/10 transition-colors"
          >
            <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="3" fill="#4285F4" />
              <rect x="5" y="9" width="14" height="10" rx="1" fill="white" />
              <rect x="5" y="3" width="14" height="4" fill="#1967D2" rx="1" />
              <circle cx="8" cy="5" r="1" fill="white" />
              <circle cx="16" cy="5" r="1" fill="white" />
              <rect x="7" y="11" width="4" height="2" rx="0.5" fill="#4285F4" />
              <rect x="13" y="11" width="4" height="2" rx="0.5" fill="#4285F4" />
              <rect x="7" y="15" width="4" height="2" rx="0.5" fill="#4285F4" />
              <rect x="13" y="15" width="4" height="2" rx="0.5" fill="#FBBC04" />
            </svg>
            Google Calendar
          </button>
          <div className="border-t border-border/30" />
          <button
            onClick={handleOutlookCalendar}
            className="flex items-center gap-3 w-full px-4 py-3 text-sm text-foreground hover:bg-primary/10 transition-colors"
          >
            <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="3" fill="#0078D4" />
              <ellipse cx="10" cy="12" rx="4" ry="5" fill="white" />
              <path d="M15 8h5v8h-5" fill="white" fillOpacity="0.7" />
            </svg>
            Outlook
          </button>
          <div className="border-t border-border/30" />
          <button
            onClick={handleAppleCalendar}
            className="flex items-center gap-3 w-full px-4 py-3 text-sm text-foreground hover:bg-primary/10 transition-colors"
          >
            <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="3" fill="#FF3B30" />
              <text x="12" y="16" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold" fontFamily="system-ui">
                31
              </text>
            </svg>
            Apple Calendar (.ics)
          </button>
        </div>
      )}
    </div>
  );
}
