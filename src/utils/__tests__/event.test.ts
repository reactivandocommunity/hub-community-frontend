import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  adjustToBrazilTimezone,
  isEventInFuture,
  isEventInPast,
  isEventOngoing,
  getNextFutureEvents,
  getPastEvents,
  getOngoingEvents,
} from '../event';
import { Event } from '../../lib/types';

// Fix "now" to 2026-06-15T12:00:00Z so tests are deterministic
const NOW = new Date('2026-06-15T12:00:00Z');

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
});

afterEach(() => {
  vi.useRealTimers();
});

// Helper to build a minimal Event object
function makeEvent(overrides: Partial<Event> & { start_date: string }): Event {
  return {
    id: '1',
    title: 'Test Event',
    slug: 'test-event',
    description: '',
    start_date: overrides.start_date,
    end_date: overrides.end_date ?? '',
    ...overrides,
  } as Event;
}

// ─── adjustToBrazilTimezone ────────────────────────────────────────
describe('adjustToBrazilTimezone', () => {
  it('returns a new Date object with the same value', () => {
    const input = new Date('2026-03-12T18:30:00Z');
    const result = adjustToBrazilTimezone(input);
    expect(result).toEqual(input);
    expect(result).not.toBe(input); // should be a new instance
  });
});

// ─── isEventInFuture ───────────────────────────────────────────────
describe('isEventInFuture', () => {
  it('returns true for a date in the future', () => {
    expect(isEventInFuture('2026-12-01T00:00:00Z')).toBe(true);
  });

  it('returns false for a date in the past', () => {
    expect(isEventInFuture('2025-01-01T00:00:00Z')).toBe(false);
  });

  it('returns false for an invalid date string', () => {
    expect(isEventInFuture('not-a-date')).toBe(false);
  });
});

// ─── isEventInPast ─────────────────────────────────────────────────
describe('isEventInPast', () => {
  it('returns true for a date in the past', () => {
    expect(isEventInPast('2025-01-01T00:00:00Z')).toBe(true);
  });

  it('returns false for a date in the future', () => {
    expect(isEventInPast('2026-12-01T00:00:00Z')).toBe(false);
  });

  it('returns false for an invalid date string', () => {
    expect(isEventInPast('not-a-date')).toBe(false);
  });
});

// ─── isEventOngoing ────────────────────────────────────────────────
describe('isEventOngoing', () => {
  it('returns true when current time is between start and end', () => {
    expect(
      isEventOngoing('2026-06-14T00:00:00Z', '2026-06-16T00:00:00Z')
    ).toBe(true);
  });

  it('returns false when current time is before start', () => {
    expect(
      isEventOngoing('2026-07-01T00:00:00Z', '2026-07-02T00:00:00Z')
    ).toBe(false);
  });

  it('returns false when current time is after end', () => {
    expect(
      isEventOngoing('2026-05-01T00:00:00Z', '2026-05-02T00:00:00Z')
    ).toBe(false);
  });

  it('returns false for invalid dates', () => {
    expect(isEventOngoing('invalid', 'invalid')).toBe(false);
  });
});

// ─── getNextFutureEvents ───────────────────────────────────────────
describe('getNextFutureEvents', () => {
  it('returns null for an empty array', () => {
    expect(getNextFutureEvents([])).toBeNull();
  });

  it('returns null when no future events exist', () => {
    const events = [makeEvent({ start_date: '2025-01-01T00:00:00Z' })];
    expect(getNextFutureEvents(events)).toBeNull();
  });

  it('returns future events sorted by start_date ascending', () => {
    const far = makeEvent({ id: 'far', start_date: '2027-01-01T00:00:00Z' });
    const near = makeEvent({ id: 'near', start_date: '2026-07-01T00:00:00Z' });
    const result = getNextFutureEvents([far, near]);
    expect(result).not.toBeNull();
    expect(result![0].id).toBe('near');
    expect(result![1].id).toBe('far');
  });

  it('excludes ongoing events', () => {
    const ongoing = makeEvent({
      id: 'ongoing',
      start_date: '2026-06-14T00:00:00Z',
      end_date: '2026-06-16T00:00:00Z',
    });
    const future = makeEvent({
      id: 'future',
      start_date: '2026-08-01T00:00:00Z',
    });
    const result = getNextFutureEvents([ongoing, future]);
    expect(result).toHaveLength(1);
    expect(result![0].id).toBe('future');
  });

  it('returns null for non-array input', () => {
    expect(getNextFutureEvents(null as any)).toBeNull();
  });
});

// ─── getPastEvents ─────────────────────────────────────────────────
describe('getPastEvents', () => {
  it('returns null for an empty array', () => {
    expect(getPastEvents([])).toBeNull();
  });

  it('returns past events sorted by start_date descending', () => {
    const old = makeEvent({
      id: 'old',
      start_date: '2025-01-01T00:00:00Z',
      end_date: '2025-01-02T00:00:00Z',
    });
    const recent = makeEvent({
      id: 'recent',
      start_date: '2026-05-01T00:00:00Z',
      end_date: '2026-05-02T00:00:00Z',
    });
    const result = getPastEvents([old, recent]);
    expect(result).not.toBeNull();
    expect(result![0].id).toBe('recent');
    expect(result![1].id).toBe('old');
  });

  it('excludes ongoing events', () => {
    const ongoing = makeEvent({
      id: 'ongoing',
      start_date: '2026-06-14T00:00:00Z',
      end_date: '2026-06-16T00:00:00Z',
    });
    const past = makeEvent({
      id: 'past',
      start_date: '2025-01-01T00:00:00Z',
      end_date: '2025-01-02T00:00:00Z',
    });
    const result = getPastEvents([ongoing, past]);
    expect(result).toHaveLength(1);
    expect(result![0].id).toBe('past');
  });
});

// ─── getOngoingEvents ──────────────────────────────────────────────
describe('getOngoingEvents', () => {
  it('returns null for an empty array', () => {
    expect(getOngoingEvents([])).toBeNull();
  });

  it('returns currently ongoing events', () => {
    const ongoing = makeEvent({
      id: 'ongoing',
      start_date: '2026-06-14T00:00:00Z',
      end_date: '2026-06-16T00:00:00Z',
    });
    const past = makeEvent({
      id: 'past',
      start_date: '2025-01-01T00:00:00Z',
      end_date: '2025-01-02T00:00:00Z',
    });
    const result = getOngoingEvents([ongoing, past]);
    expect(result).toHaveLength(1);
    expect(result![0].id).toBe('ongoing');
  });

  it('returns null when no events are ongoing', () => {
    const future = makeEvent({
      id: 'future',
      start_date: '2027-01-01T00:00:00Z',
      end_date: '2027-01-02T00:00:00Z',
    });
    expect(getOngoingEvents([future])).toBeNull();
  });
});
