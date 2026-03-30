import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { CommunityDetails } from '@/components/community-details';
import {
  COMMUNITY_METADATA_QUERY,
  CommunityMetadataResponse,
  fetchGraphQL,
} from '@/lib/graphql-fetch';

interface CommunityPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({
  params,
}: CommunityPageProps): Promise<Metadata> {
  const { id } = await params;

  const data = await fetchGraphQL<CommunityMetadataResponse>(
    COMMUNITY_METADATA_QUERY,
    { slugOrId: id }
  );

  const community = data?.communityBySlugOrId;

  if (!community) {
    return {
      title: 'Comunidade não encontrada | Hub Community',
    };
  }

  const title = `${community.title} | Hub Community`;
  const description =
    typeof community.short_description === 'string'
      ? community.short_description.slice(0, 160)
      : `Conheça a comunidade ${community.title} no Hub Community.`;

  const ogImage = community.images?.[0] || '/images/logo-square.png';

  const tags = community.tags?.map(t => t.value) || [];
  const membersText = community.members_quantity
    ? `${community.members_quantity.toLocaleString()} membros`
    : '';

  const richDescription = [
    description,
    membersText && `👥 ${membersText}`,
  ]
    .filter(Boolean)
    .join(' · ');

  return {
    title,
    description: richDescription,
    keywords: [
      'comunidade',
      'tecnologia',
      community.title,
      ...tags,
    ].filter(Boolean),
    openGraph: {
      title,
      description: richDescription,
      type: 'website',
      images: ogImage
        ? [
            {
              url: ogImage,
              width: 1200,
              height: 630,
              alt: community.title,
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
      canonical: `/communities/${community.slug || id}`,
    },
  };
}

export default async function CommunityPage({ params }: CommunityPageProps) {
  const { id } = await params;

  if (!id) {
    notFound();
  }

  return <CommunityDetails slugOrId={id} />;
}
