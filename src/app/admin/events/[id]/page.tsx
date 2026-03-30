'use client';

import { EventForm } from '@/components/admin/event-form';
import { FadeIn } from '@/components/animations';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { GET_EVENT_BY_SLUG_OR_ID, UPDATE_EVENT } from '@/lib/queries';
import { EventInput, EventResponse, UpdateEventResponse } from '@/lib/types';
import { useMutation, useQuery } from '@apollo/client';
import { format } from 'date-fns';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Award } from 'lucide-react';

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const { toast } = useToast();
  const {
    data,
    loading: queryLoading,
    error,
  } = useQuery<EventResponse>(GET_EVENT_BY_SLUG_OR_ID, {
    variables: { slugOrId: id },
    skip: !id,
  });

  const [updateEvent, { loading: mutationLoading }] =
    useMutation<UpdateEventResponse>(UPDATE_EVENT);
  const [initialData, setInitialData] = useState<any>(null);

  useEffect(() => {
    if (data?.eventBySlugOrId) {
      const event = data.eventBySlugOrId;
      setInitialData({
        title: event.title,
        slug: event.slug,
        start_date: event.start_date
          ? format(new Date(event.start_date), "yyyy-MM-dd'T'HH:mm")
          : '',
        end_date: event.end_date
          ? format(new Date(event.end_date), "yyyy-MM-dd'T'HH:mm")
          : '',
        max_slots: event.max_slots || 0,
        is_online: event.is_online || false,
        call_link: event.call_link || '',
        description: event.description,
        communityId: event.communities?.[0]?.id, // Get the first community ID if available
        location: event.location,
        id: event.id, // Keep reference for update
        talks: event.talks || [],
        products: event.products || [],
        coverImage: event.images?.[0] || null,
      });
    }
  }, [data]);

  const handleSubmit = async (formData: any) => {
    try {
      const input: EventInput = {
        title: formData.title,
        slug: formData.slug,
        start_date: new Date(formData.start_date).toISOString(),
        end_date: new Date(formData.end_date).toISOString(),
        max_slots: Number(formData.max_slots),
        pixai_token_integration: formData.pixai_token_integration,
        is_online: formData.is_online || false,
        call_link: formData.call_link || '',
        description: formData.description,
        location: formData.location?.id || formData.location, // Send ID string
        communities: formData.communityId ? [formData.communityId] : [],
        talks: formData.talks?.map((t: any) => t.id) || [],
      };

      // Ensure we have the id
      const eventId = data?.eventBySlugOrId?.id || id;

      const { data: responseData } = await updateEvent({
        variables: {
          id: eventId,
          data: input,
        },
      });

      toast({
        title: 'Evento atualizado',
        description: 'O evento foi atualizado com sucesso.',
      });

      return responseData?.updateEvent?.id || eventId;
    } catch (error) {
      console.error('Error updating event:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao atualizar',
        description: 'Não foi possível atualizar o evento.',
      });
    }
  };

  if (queryLoading) {
    return (
      <div className="container mx-auto py-10 px-4 max-w-3xl">
        <div className="mb-8">
          <div className="h-8 w-48 bg-muted animate-pulse rounded mb-2" />
          <div className="h-4 w-72 bg-muted animate-pulse rounded" />
        </div>
        <div className="border rounded-lg p-6 bg-card space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              <div className="h-10 w-full bg-muted animate-pulse rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-10 text-center text-red-500">
        <p>Erro ao carregar evento: {error.message}</p>
        <Button
          variant="outline"
          onClick={() => router.push('/admin/events')}
          className="mt-4"
        >
          Voltar para lista
        </Button>
      </div>
    );
  }

  return (
    <FadeIn direction="up" duration={0.3}>
    <div className="container mx-auto py-10 px-4 max-w-3xl">
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Editar Evento</h1>
          <p className="text-muted-foreground mt-2">
            Atualize os detalhes do evento abaixo.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => router.push(`/admin/events/${id}/certificados`)}
        >
          <Award className="w-4 h-4 mr-2" />
          Ver Certificados
        </Button>
      </div>

      <div className="border rounded-lg p-6 bg-card">
        {initialData && (
          <EventForm
            initialData={initialData}
            onSubmit={handleSubmit}
            isLoading={mutationLoading}
          />
        )}
      </div>
    </div>
    </FadeIn>
  );
}
