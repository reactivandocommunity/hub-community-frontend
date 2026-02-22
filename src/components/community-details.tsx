'use client';

import { useQuery } from '@apollo/client';
import {
  Calendar,
  ExternalLink,
  Instagram,
  Link2Icon,
  Linkedin,
  MapPin,
  MessageCircle,
  Share2,
  Users,
} from 'lucide-react';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExpandableRichText } from '@/components/ui/expandable-rich-text';
import { GET_COMMUNITY_BY_SLUG_OR_ID } from '@/lib/queries';
import { CommunityResponse } from '@/lib/types';

import {
  adjustToBrazilTimezone,
  getNextFutureEvents,
  getOngoingEvents,
  getPastEvents,
} from '../utils/event';

import { RichText } from './ui/rich-text';

interface CommunityDetailsProps {
  slugOrId: string;
}

export function CommunityDetails({ slugOrId }: CommunityDetailsProps) {
  const { data, loading, error } = useQuery<CommunityResponse>(
    GET_COMMUNITY_BY_SLUG_OR_ID,
    {
      variables: { slugOrId },
    }
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="animate-pulse">
          <div className="h-96 bg-muted"></div>
          <div className="container mx-auto px-4 py-12">
            <div className="h-8 bg-muted rounded mb-4"></div>
            <div className="h-4 bg-muted rounded mb-2"></div>
            <div className="h-4 bg-muted rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Erro ao carregar comunidade
          </h2>
          <p className="text-muted-foreground mb-4">
            Não foi possível carregar os detalhes da comunidade.
          </p>
          <Button
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.location.reload();
              }
            }}
          >
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  const community = data?.communityBySlugOrId;

  if (!community) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Comunidade não encontrada
          </h2>
          <p className="text-muted-foreground">
            A comunidade que você está procurando não existe ou foi removida.
          </p>
        </div>
      </div>
    );
  }

  const pastEvents = getPastEvents(community.events || []);
  const nextFutureEvents = getNextFutureEvents(community.events || []);
  const ongoingEvents = getOngoingEvents(community.events || []);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative min-h-64 md:min-h-80 lg:min-h-96 bg-gradient-to-r from-blue-600 to-purple-700">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{
            backgroundImage: `url(${community.images?.[0]})`,
          }}
        ></div>
        <div className="absolute inset-0 bg-black/40"></div>

        <div className="relative container mx-auto px-4 sm:px-6 lg:px-4 h-full flex items-center py-8 md:py-12">
          <div className="text-white max-w-4xl">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              {community.title}
            </h1>
            <RichText
              content={community.short_description}
              className="text-base md:text-lg lg:text-xl mb-6 opacity-90"
            />

            <div className="flex flex-wrap gap-4 md:gap-6 mb-6">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <span className="text-sm md:text-base">
                  {(community.members_quantity || 0).toLocaleString()} membros
                </span>
              </div>
              {community.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  <span className="text-sm md:text-base">
                    {community.location}
                  </span>
                </div>
              )}
              {community.founded_date && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  <span className="text-sm md:text-base">
                    Fundada em {community.founded_date}
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                size="lg"
                className="bg-white text-blue-600 hover:bg-white/90 dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90 w-full sm:w-auto"
                disabled={
                  !community.links ||
                  community.links.length === 0 ||
                  !community.links[0]?.url
                }
                onClick={() => {
                  if (
                    community.links &&
                    community.links.length > 0 &&
                    community.links[0].url &&
                    typeof window !== 'undefined'
                  ) {
                    window.open(community.links[0].url, '_blank');
                  }
                }}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Participar da comunidade
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-blue-600 bg-transparent w-full sm:w-auto"
                onClick={() => {
                  if (
                    typeof navigator !== 'undefined' &&
                    typeof window !== 'undefined' &&
                    'share' in navigator
                  ) {
                    navigator.share({
                      title: `Confira a comunidade ${community.title}\n`,
                      text: `\n${community.short_description}`,
                      url: window.location.href,
                    });
                  }
                }}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Compartilhar
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            <Card>
              <CardHeader>
                <CardTitle>Sobre a Comunidade</CardTitle>
              </CardHeader>
              <CardContent>
                <ExpandableRichText
                  content={
                    community.full_description || community.short_description
                  }
                  className="text-muted-foreground leading-relaxed mb-6"
                />

                <div className="flex flex-wrap gap-2">
                  {community.tags.map(tag => (
                    <Badge key={tag.id} variant="secondary">
                      {tag.value}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Ongoing Events */}
            {!!ongoingEvents?.length && (
              <Card className="border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-700">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                    Eventos em Andamento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {ongoingEvents.map(event => (
                      <div
                        key={event.id}
                        className="flex items-center justify-between p-4 bg-card border border-border rounded-lg hover:shadow-md transition-shadow"
                      >
                        <div>
                          <h4 className="font-semibold text-foreground">
                            {event.title}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {adjustToBrazilTimezone(
                              new Date(event.start_date)
                            ).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: 'long',
                              year: 'numeric',
                            })}
                            {' - '}
                            {adjustToBrazilTimezone(
                              new Date(event.end_date)
                            ).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </p>
                          {!!event.talks?.length && (
                            <p className="text-sm text-muted-foreground">
                              • {event.talks.length} palestras
                            </p>
                          )}
                        </div>
                        <Link href={`/events/${event.slug || event.id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-primary text-primary hover:bg-primary/10"
                          >
                            Ver Detalhes
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Upcoming Events */}
            <Card>
              <CardHeader>
                <CardTitle>Próximos Eventos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {!!nextFutureEvents?.length ? (
                    nextFutureEvents.map(event => (
                      <div
                        key={event.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent hover:text-accent-foreground"
                      >
                        <div>
                          <h4 className="font-semibold">{event.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {adjustToBrazilTimezone(
                              new Date(event.start_date)
                            ).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </p>
                          {!!event.talks?.length && (
                            <p className="text-sm text-muted-foreground">
                              • {event.talks.length} palestras
                            </p>
                          )}
                        </div>
                        <Link href={`/events/${event.slug || event.id}`}>
                          <Button variant="outline" size="sm">
                            Ver Detalhes
                          </Button>
                        </Link>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      Nenhum evento programado no momento.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Past Events */}
            <Card>
              <CardHeader>
                <CardTitle>Eventos Realizados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {!!pastEvents?.length ? (
                    pastEvents.map(event => (
                      <div
                        key={event.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent hover:text-accent-foreground"
                      >
                        <div>
                          <h4 className="font-semibold">{event.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {adjustToBrazilTimezone(
                              new Date(event.start_date)
                            ).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </p>
                          {!!event.talks?.length && (
                            <p className="text-sm text-muted-foreground">
                              • {event.talks.length} palestras
                            </p>
                          )}
                        </div>
                        <Link href={`/events/${event.slug || event.id}`}>
                          <Button variant="outline" size="sm">
                            Ver Detalhes
                          </Button>
                        </Link>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      Nenhum evento realizado ainda.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Organizers */}
            <Card>
              <CardHeader>
                <CardTitle>Organizadores</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {community.organizers.map(organizer => (
                    <Link
                      key={organizer.id}
                      href={`/users/${organizer.username}`}
                      className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      {/* <Image
                        src={organizer.avatar || '/placeholder.svg'}
                        alt={organizer.username}
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded-full object-cover"
                        unoptimized
                      /> */}
                      <div>
                        <h4 className="font-semibold hover:text-blue-600">
                          {organizer.username}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {organizer.role || 'Organizador'}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle>Contato</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Social Media Links */}
                {['whatsapp', 'instagram', 'linkedin', 'web'].map(media => {
                  const found = community.links?.find(
                    link => link.name.toLowerCase() === media
                  );
                  let Icon;
                  switch (media) {
                    case 'whatsapp':
                      Icon = MessageCircle;
                      break;
                    case 'instagram':
                      Icon = Instagram;
                      break;
                    case 'linkedin':
                      Icon = Linkedin;
                      break;
                    case 'web':
                      Icon = ExternalLink;
                      break;
                    default:
                      Icon = Link2Icon;
                  }
                  return found ? (
                    <a
                      key={media}
                      href={found.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-600 hover:underline"
                    >
                      <Icon className="h-4 w-4" />
                      {media.charAt(0).toUpperCase() + media.slice(1)}
                    </a>
                  ) : null;
                })}
              </CardContent>
            </Card>

            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Estatísticas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Membros</span>
                  <span className="font-semibold">
                    {(community.members_quantity || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Eventos realizados
                  </span>
                  <span className="font-semibold">
                    {pastEvents?.length || 0}
                  </span>
                </div>
                {!!ongoingEvents?.length && (
                  <div className="flex justify-between">
                    <span className="text-green-600 font-medium">
                      Eventos em andamento
                    </span>
                    <span className="font-semibold text-green-600">
                      {ongoingEvents.length}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Próximos eventos
                  </span>
                  <span className="font-semibold">
                    {nextFutureEvents?.length || 0}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
