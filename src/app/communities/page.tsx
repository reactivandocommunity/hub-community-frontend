'use client';

import { useQuery } from '@apollo/client';
import { Search, Users, X } from 'lucide-react';
import { Suspense, useState } from 'react';

import { FadeIn } from '@/components/animations';
import { CommunityGrid } from '@/components/community-grid';
import { CommunityGridSkeleton } from '@/components/community-grid-skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useFilters } from '@/contexts/filter-context';
import { GET_TAGS } from '@/lib/queries';
import { TagsResponse } from '@/lib/types';

function TagFilters() {
  const { selectedTags, toggleTag, clearFilters, searchTerm } = useFilters();
  const { data } = useQuery<TagsResponse>(GET_TAGS);
  const tags = data?.tags?.data || [];
  const hasActiveFilters = searchTerm || selectedTags.length > 0;

  if (tags.length === 0) return null;

  return (
    <FadeIn direction="up" duration={0.3} delay={0.1}>
      <div className="flex flex-wrap items-center gap-2">
        {tags.map(tag => (
          <Badge
            key={tag.id}
            variant={selectedTags.includes(tag?.value) ? 'default' : 'outline'}
            className="cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors rounded-full px-3 py-1 text-xs"
            onClick={() => toggleTag(tag?.value)}
          >
            {tag?.value}
          </Badge>
        ))}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-muted-foreground hover:text-foreground h-7 px-2 text-xs gap-1"
          >
            <X className="h-3 w-3" />
            Limpar
          </Button>
        )}
      </div>
    </FadeIn>
  );
}

export default function CommunitiesPage() {
  const [communityCount, setCommunityCount] = useState<number>(0);
  const { searchTerm, setSearchTerm } = useFilters();

  return (
    <div className="min-h-screen bg-background">
      {/* Compact Header — matching events page pattern */}
      <div className="border-b border-border/40 bg-card/30">
        <div className="container mx-auto px-4 pt-24 pb-8">
          <FadeIn direction="up" duration={0.3}>
            <div className="max-w-3xl">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-secondary" />
                </div>
                <h1 className="text-3xl font-bold text-foreground">
                  Comunidades
                </h1>
                {communityCount > 0 && (
                  <span className="text-sm text-muted-foreground bg-muted px-2.5 py-0.5 rounded-full">
                    {communityCount} comunidade{communityCount !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <p className="text-muted-foreground ml-[52px]">
                Explore comunidades de tecnologia e encontre a sua tribo
              </p>
            </div>
          </FadeIn>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search */}
        <FadeIn direction="up" duration={0.3} delay={0.05}>
          <div className="max-w-lg mb-6">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar comunidades..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10 h-11 rounded-xl border-border/60 focus:border-primary"
              />
            </div>
          </div>
        </FadeIn>

        {/* Tag Filters */}
        <div className="mb-8">
          <TagFilters />
        </div>

        {/* Community Grid */}
        <FadeIn direction="up" duration={0.3} delay={0.15}>
          <Suspense fallback={<CommunityGridSkeleton />}>
            <CommunityGrid onCountChange={setCommunityCount} />
          </Suspense>
        </FadeIn>
      </div>
    </div>
  );
}
