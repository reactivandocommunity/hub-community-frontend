import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { EventDetails } from '@/components/event-details';
import {
  EVENT_METADATA_QUERY,
  EventMetadataResponse,
  fetchGraphQL,
  getOgImageUrl,
} from '@/lib/graphql-fetch';

interface EventPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({
  params,
}: EventPageProps): Promise<Metadata> {
  const { id } = await params;

  const data = await fetchGraphQL<EventMetadataResponse>(
    EVENT_METADATA_QUERY,
    { slugOrId: id }
  );

  const event = data?.eventBySlugOrId;

  if (!event) {
    return {
      title: 'Evento não encontrado | Hub Community',
    };
  }

  const title = `${event.title} | Hub Community`;
  const description =
    typeof event.description === 'string'
      ? event.description.slice(0, 160)
      : `Confira o evento ${event.title} no Hub Community.`;

  const ogImage = getOgImageUrl(event.images?.[0]);

  const communityNames = event.communities
    ?.map(c => c.title)
    .join(', ');

  const locationText = event.location?.city || event.location?.title || '';

  const startDate = event.start_date
    ? new Date(event.start_date).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : '';

  const richDescription = [
    description,
    startDate && `📅 ${startDate}`,
    locationText && `📍 ${locationText}`,
    communityNames && `🏘️ ${communityNames}`,
  ]
    .filter(Boolean)
    .join(' · ');

  return {
    title,
    description: richDescription,
    keywords: [
      'evento',
      'tecnologia',
      'comunidade',
      event.title,
      ...(event.communities?.map(c => c.title) || []),
      locationText,
    ].filter(Boolean),
    openGraph: {
      title,
      description: richDescription,
      type: 'article',
      images: ogImage
        ? [
            {
              url: ogImage,
              width: 1200,
              height: 630,
              alt: event.title,
            },
          ]
        : [],
      siteName: 'Hub Community',
      locale: 'pt_BR',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: richDescription,
      images: ogImage ? [ogImage] : [],
    },
    alternates: {
      canonical: `/events/${event.slug || id}`,
    },
  };
}

export default async function EventPage({ params }: EventPageProps) {
  const { id } = await params;

  if (!id) {
    notFound();
  }

  return <EventDetails slugOrId={id} />;
}
