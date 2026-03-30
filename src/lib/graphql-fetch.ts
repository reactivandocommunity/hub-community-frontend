/**
 * Server-side GraphQL fetch utility for SSR metadata generation.
 * This bypasses Apollo Client (which requires browser context) and makes
 * direct fetch requests to the GraphQL BFF.
 */

const GRAPHQL_URL =
  process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:4000/graphql';

interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}

export async function fetchGraphQL<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T | null> {
  try {
    const response = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, variables }),
      next: { revalidate: 60 }, // Cache for 60 seconds
    });

    if (!response.ok) {
      console.error(`GraphQL fetch failed: ${response.status}`);
      return null;
    }

    const json: GraphQLResponse<T> = await response.json();

    if (json.errors) {
      console.error('GraphQL errors:', json.errors);
    }

    return json.data || null;
  } catch (error) {
    console.error('GraphQL fetch error:', error);
    return null;
  }
}

// ── Event metadata query ──────────────────────────────────────────────
export const EVENT_METADATA_QUERY = `
  query GetEventBySlugOrId($slugOrId: String!) {
    eventBySlugOrId(slugOrId: $slugOrId) {
      id
      slug
      title
      description
      start_date
      end_date
      images
      communities {
        title
      }
      location {
        title
        city
      }
    }
  }
`;

export interface EventMetadataResponse {
  eventBySlugOrId: {
    id: string;
    slug: string;
    title: string;
    description: string;
    start_date: string;
    end_date: string;
    images: string[];
    communities: Array<{ title: string }>;
    location?: {
      title?: string;
      city?: string;
    };
  } | null;
}

// ── Community metadata query ──────────────────────────────────────────
export const COMMUNITY_METADATA_QUERY = `
  query GetCommunityBySlugOrId($slugOrId: String!) {
    communityBySlugOrId(slugOrId: $slugOrId) {
      id
      slug
      title
      short_description
      members_quantity
      images
      tags {
        value
      }
    }
  }
`;

export interface CommunityMetadataResponse {
  communityBySlugOrId: {
    id: string;
    slug: string;
    title: string;
    short_description: string;
    members_quantity: number;
    images: string[];
    tags: Array<{ value: string }>;
  } | null;
}
