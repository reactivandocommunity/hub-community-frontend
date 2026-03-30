/**
 * Utility functions for generating "Add to Calendar" links.
 * Supports Google Calendar, Outlook.com, and .ics file download (Apple/generic).
 */

interface CalendarEventParams {
  title: string;
  description?: string;
  startDate: string; // ISO string
  endDate?: string; // ISO string
  location?: string;
  isOnline?: boolean;
  callLink?: string;
}

/**
 * Extracts plain text from a Strapi BlocksContent rich text object.
 * Falls back to the value itself if it's already a string.
 */
export function richTextToPlainText(content: unknown): string {
  if (!content) return '';
  if (typeof content === 'string') return content;
  if (!Array.isArray(content)) return '';

  return content
    .map((block: any) => {
      if (block.type === 'paragraph' || block.type === 'heading') {
        return (
          block.children
            ?.map((child: any) => {
              if (typeof child.text === 'string') return child.text;
              if (child.children) return richTextToPlainText(child.children);
              return '';
            })
            .join('') || ''
        );
      }
      if (block.type === 'list') {
        return (
          block.children
            ?.map((item: any) => '• ' + richTextToPlainText(item.children))
            .join('\n') || ''
        );
      }
      if (block.children) return richTextToPlainText(block.children);
      if (typeof block.text === 'string') return block.text;
      return '';
    })
    .filter(Boolean)
    .join('\n');
}

/**
 * Formats a Date to the Google Calendar format: YYYYMMDDTHHmmssZ
 */
function toGoogleCalendarDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

/**
 * Formats a Date to ICS format: YYYYMMDDTHHmmssZ
 */
function toICSDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

/**
 * Builds a full description string that includes the call link when available.
 */
function buildDescription(description?: string, callLink?: string): string {
  const parts: string[] = [];
  if (description) parts.push(description);
  if (callLink) parts.push(`\n🔗 Link da chamada: ${callLink}`);
  return parts.join('\n');
}

/**
 * Generates a Google Calendar URL.
 */
export function getGoogleCalendarUrl(params: CalendarEventParams): string {
  const { title, description, startDate, endDate, location, isOnline, callLink } = params;
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date(start.getTime() + 2 * 60 * 60 * 1000); // default 2h

  // Put callLink in location field so Google Calendar makes it clickable
  // and recognizable as a video call if it's a Meet/Zoom link
  const locationStr = callLink ? callLink : (isOnline ? 'Online' : location || '');
  const fullDescription = buildDescription(description, callLink);

  const url = new URL('https://calendar.google.com/calendar/render');
  url.searchParams.set('action', 'TEMPLATE');
  url.searchParams.set('text', title);
  url.searchParams.set('dates', `${toGoogleCalendarDate(start)}/${toGoogleCalendarDate(end)}`);
  if (fullDescription) url.searchParams.set('details', fullDescription);
  if (locationStr) url.searchParams.set('location', locationStr);

  return url.toString();
}

/**
 * Generates an Outlook.com calendar URL.
 */
export function getOutlookCalendarUrl(params: CalendarEventParams): string {
  const { title, description, startDate, endDate, location, isOnline, callLink } = params;
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date(start.getTime() + 2 * 60 * 60 * 1000);

  const locationStr = isOnline ? 'Online' : location || '';
  const fullDescription = buildDescription(description, callLink);

  const url = new URL('https://outlook.live.com/calendar/0/action/compose');
  url.searchParams.set('rru', 'addevent');
  url.searchParams.set('subject', title);
  url.searchParams.set('startdt', start.toISOString());
  url.searchParams.set('enddt', end.toISOString());
  if (fullDescription) url.searchParams.set('body', fullDescription);
  if (locationStr) url.searchParams.set('location', locationStr);
  url.searchParams.set('path', '/calendar/action/compose');

  return url.toString();
}

/**
 * Generates an ICS file content string (for Apple Calendar, etc.).
 */
function generateICSContent(params: CalendarEventParams): string {
  const { title, description, startDate, endDate, location, isOnline, callLink } = params;
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date(start.getTime() + 2 * 60 * 60 * 1000);

  const locationStr = isOnline ? 'Online' : location || '';
  const fullDescription = buildDescription(description, callLink);

  // Escape special ICS characters
  const escapeICS = (str: string) =>
    str.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Hub Community//Event//PT',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `DTSTART:${toICSDate(start)}`,
    `DTEND:${toICSDate(end)}`,
    `SUMMARY:${escapeICS(title)}`,
  ];

  if (fullDescription) {
    lines.push(`DESCRIPTION:${escapeICS(fullDescription.substring(0, 500))}`);
  }
  if (locationStr) {
    lines.push(`LOCATION:${escapeICS(locationStr)}`);
  }

  lines.push(
    `UID:${Date.now()}-${Math.random().toString(36).substring(2)}@hubcommunity`,
    `DTSTAMP:${toICSDate(new Date())}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  );

  return lines.join('\r\n');
}

/**
 * Downloads an ICS file for the event.
 */
export function downloadICSFile(params: CalendarEventParams): void {
  const icsContent = generateICSContent(params);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `${params.title.replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s+/g, '_').substring(0, 50)}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}
