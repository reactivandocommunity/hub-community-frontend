'use client';

import { useMutation } from '@apollo/client';
import { BookmarkMinus, BookmarkPlus, MapPin, Mic } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  trackAddTalkToAgenda,
  trackCreateAgenda,
  trackRemoveTalkFromAgenda,
} from '@/lib/analytics';
import { CREATE_AGENDA, UPDATE_AGENDA } from '@/lib/queries';
import { Talk } from '@/lib/types';

interface TalkCardProps {
  talk: Talk;
  eventDocumentId?: string;
  eventSlug?: string;
  agendaDocumentId?: string;
  isInAgenda?: boolean;
  onAgendaChange?: () => void;
  showAgendaActions?: boolean;
  onOptimisticUpdate?: (talkDocumentId: string, isInAgenda: boolean) => void;
}

export function TalkCard({
  talk,
  eventDocumentId,
  eventSlug,
  agendaDocumentId,
  isInAgenda = false,
  onAgendaChange,
  showAgendaActions = false,
  onOptimisticUpdate,
}: TalkCardProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [createAgenda] = useMutation(CREATE_AGENDA);
  const [updateAgenda] = useMutation(UPDATE_AGENDA);

  const handleAddToAgenda = async () => {
    if (!talk.documentId || !eventDocumentId) return;

    setIsLoading(true);
    try {
      if (!agendaDocumentId) {
        const { data: createData } = await createAgenda({
          variables: {
            input: {
              is_public: false,
              event: eventDocumentId,
            },
          },
        });

        if (createData?.createAgenda?.documentId) {
          trackCreateAgenda(eventSlug || eventDocumentId!);

          await updateAgenda({
            variables: {
              updateAgendaId: createData.createAgenda.documentId,
              input: {
                talksToAdd: [talk.documentId],
              },
            },
          });
        }
      } else {
        await updateAgenda({
          variables: {
            updateAgendaId: agendaDocumentId,
            input: {
              talksToAdd: [talk.documentId],
            },
          },
        });
      }

      onOptimisticUpdate?.(talk.documentId, true);
      trackAddTalkToAgenda(talk.documentId!, eventSlug || eventDocumentId!);

      toast({
        title: 'Talk adicionada à agenda',
        description: `"${talk.title}" foi adicionada à sua agenda.`,
      });

      onAgendaChange?.();
    } catch (error) {
      console.error('Erro ao adicionar talk à agenda:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível adicionar a talk à agenda.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFromAgenda = async () => {
    if (!talk.documentId || !agendaDocumentId) return;

    setIsLoading(true);
    try {
      await updateAgenda({
        variables: {
          updateAgendaId: agendaDocumentId,
          input: {
            talksToRemove: [talk.documentId],
          },
        },
      });

      onOptimisticUpdate?.(talk.documentId, false);
      trackRemoveTalkFromAgenda(
        talk.documentId!,
        eventSlug || eventDocumentId!
      );

      toast({
        title: 'Talk removida da agenda',
        description: `"${talk.title}" foi removida da sua agenda.`,
      });

      onAgendaChange?.();
    } catch (error) {
      console.error('Erro ao remover talk da agenda:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível remover a talk da agenda.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const speakers = talk.speakers?.filter(Boolean) || [];
  const primarySpeaker = speakers[0];

  const cardContent = (
    <div
      className={`group relative flex items-center gap-4 p-3 rounded-xl transition-all duration-200 hover:bg-card/80 ${
        talk.highlight
          ? 'bg-primary/5 border border-primary/20'
          : 'hover:bg-muted/30'
      } ${isInAgenda ? 'ring-1 ring-primary/30 bg-primary/5' : ''}`}
    >
      {/* Speaker Avatar — hero element */}
      {primarySpeaker ? (
        <div className="relative shrink-0">
          <Image
            src={primarySpeaker.avatar || '/placeholder-user.jpg'}
            alt={
              typeof primarySpeaker.name === 'string'
                ? primarySpeaker.name
                : 'Speaker'
            }
            width={56}
            height={56}
            className="w-14 h-14 rounded-full object-cover ring-2 ring-border/40 group-hover:ring-primary/40 transition-all"
            unoptimized
          />
          {speakers.length > 1 && (
            <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-background">
              +{speakers.length - 1}
            </span>
          )}
        </div>
      ) : (
        <div className="shrink-0 w-14 h-14 rounded-full bg-muted/50 flex items-center justify-center ring-2 ring-border/40">
          <Mic className="h-5 w-5 text-muted-foreground" />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h4 className="font-semibold text-sm leading-snug text-foreground group-hover:text-primary transition-colors line-clamp-2">
              {typeof talk.title === 'string'
                ? talk.title
                : 'Título não disponível'}
            </h4>
            <div className="flex items-center gap-3 mt-1">
              {primarySpeaker && (
                <span className="text-xs text-muted-foreground font-medium truncate">
                  {typeof primarySpeaker.name === 'string'
                    ? primarySpeaker.name
                    : 'Speaker'}
                  {speakers.length > 1 &&
                    `, +${speakers.length - 1}`}
                </span>
              )}
              {talk.room_description &&
                typeof talk.room_description === 'string' && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground/70">
                    <MapPin className="h-3 w-3" />
                    {talk.room_description}
                  </span>
                )}
            </div>
          </div>

          {/* Right side: badges & agenda */}
          <div className="flex items-center gap-2 shrink-0">
            {talk.highlight && (
              <Badge
                variant="default"
                className="bg-blue-600/80 text-[10px] px-1.5 py-0 h-5"
              >
                Destaque
              </Badge>
            )}

            {showAgendaActions && eventDocumentId && talk.documentId && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  isInAgenda ? handleRemoveFromAgenda() : handleAddToAgenda();
                }}
                disabled={isLoading}
                className={`p-1.5 rounded-lg transition-all duration-200 ${
                  isInAgenda
                    ? 'text-primary bg-primary/10 hover:bg-primary/20'
                    : 'text-muted-foreground hover:text-primary hover:bg-primary/10'
                } disabled:opacity-50`}
                title={isInAgenda ? 'Remover da agenda' : 'Adicionar à agenda'}
              >
                {isInAgenda ? (
                  <BookmarkMinus className="h-4 w-4" />
                ) : (
                  <BookmarkPlus className="h-4 w-4" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Wrap in Link if talk has a detail page
  if (talk.documentId) {
    return (
      <Link
        href={`/talks/${talk.documentId}`}
        className="block"
      >
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}
