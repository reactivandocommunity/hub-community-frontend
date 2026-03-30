'use client';
import { Calendar, MapPin, Search, Sparkles } from 'lucide-react';
import { Suspense, useState } from 'react';

import { FadeIn } from '@/components/animations';
import { EventsSection } from '@/components/events-section';
import { EventsSectionSkeleton } from '@/components/events-section-skeleton';
import { PastEventsSection } from '@/components/past-events-section';
import { PastEventsSectionSkeleton } from '@/components/past-events-section-skeleton';
import { Input } from '@/components/ui/input';
import { useFilters } from '@/contexts/filter-context';

export default function EventsPage() {
  const [eventCount, setEventCount] = useState<number>(0);
  const { searchTerm, setSearchTerm } = useFilters();

  return (
    <div className="min-h-screen bg-background">
      {/* Compact Header */}
      <div className="border-b border-border/40 bg-card/30">
        <div className="container mx-auto px-4 pt-24 pb-8">
          <FadeIn direction="up" duration={0.3}>
            <div className="max-w-3xl">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <h1 className="text-3xl font-bold text-foreground">
                  Eventos
                </h1>
                {eventCount > 0 && (
                  <span className="text-sm text-muted-foreground bg-muted px-2.5 py-0.5 rounded-full">
                    {eventCount} próximo{eventCount !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <p className="text-muted-foreground ml-[52px]">
                Workshops, palestras, meetups e conferências de tecnologia
              </p>
            </div>
          </FadeIn>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search */}
        <FadeIn direction="up" duration={0.3} delay={0.05}>
          <div className="max-w-lg mb-8">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar eventos..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10 h-11 rounded-xl border-border/60 focus:border-primary"
              />
            </div>
          </div>
        </FadeIn>

        {/* Upcoming Events */}
        <FadeIn direction="up" duration={0.3} delay={0.1}>
          <section className="mb-16">
            <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Próximos Eventos
            </h2>
            <Suspense fallback={<EventsSectionSkeleton />}>
              <EventsSection onCountChange={setEventCount} />
            </Suspense>
          </section>
        </FadeIn>

        {/* Past Events */}
        <FadeIn direction="up" duration={0.3} delay={0.15}>
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2 text-muted-foreground">
              Eventos Passados
            </h2>
            <Suspense fallback={<PastEventsSectionSkeleton />}>
              <PastEventsSection />
            </Suspense>
          </section>
        </FadeIn>
      </div>
    </div>
  );
}
