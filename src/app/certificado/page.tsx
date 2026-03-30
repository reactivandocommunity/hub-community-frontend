'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@apollo/client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle2, Loader2, AlertCircle, Clock } from 'lucide-react';
import { GET_EVENT_BY_SLUG_OR_ID } from '@/lib/queries';
import { adjustToBrazilTimezone } from '@/utils/event';
import Link from 'next/link';

export default function CertificadoPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[80vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <CertificadoContent />
    </Suspense>
  );
}

function CertificadoContent() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get('event') || 'q1y8wohrfis0ox81y5xr125w';

  const { data: eventData, loading: eventLoading } = useQuery<{ eventBySlugOrId: any }>(
    GET_EVENT_BY_SLUG_OR_ID,
    { variables: { slugOrId: eventId } }
  );

  const event = eventData?.eventBySlugOrId;

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    identifier: '', // CPF
    email: '',
    phone_number: '', // WhatsApp
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const cleanIdentifier = formData.identifier.replace(/\D/g, '');
      const cleanPhone = formData.phone_number.replace(/\D/g, '');

      const response = await fetch('https://manager.hubcommunity.io/api/participants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: {
            name: formData.name,
            identifier: cleanIdentifier,
            email: formData.email,
            phone_number: cleanPhone,
            event: eventId,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao enviar a solicitação. Verifique os dados e tente novamente.');
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocorreu um erro inesperado.');
    } finally {
      setLoading(false);
    }
  };

  // Loading event data
  if (eventLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Check if the event has ended
  if (event?.end_date) {
    const endDate = adjustToBrazilTimezone(new Date(event.end_date));
    const now = new Date();
    if (now <= endDate) {
      return (
        <div className="container max-w-2xl mx-auto py-20 px-4 min-h-[80vh] flex items-center justify-center">
          <Card className="w-full text-center shadow-lg border-amber-500/20">
            <CardContent className="pt-10 pb-8 flex flex-col items-center">
              <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mb-6">
                <Clock className="w-10 h-10 text-amber-500" />
              </div>
              <h2 className="text-3xl font-bold mb-4">Evento em andamento</h2>
              <p className="text-muted-foreground mb-8 text-lg max-w-md">
                O certificado estará disponível para solicitação após a conclusão do evento
                {event.title ? ` "${event.title}"` : ''}.
              </p>
              <Link href={`/events/${event.slug || eventId}`}>
                <Button size="lg" variant="outline" className="rounded-full">
                  Voltar para o evento
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      );
    }
  }

  if (success) {
    return (
      <div className="container max-w-2xl mx-auto py-20 px-4">
        <Card className="text-center shadow-lg border-primary/10">
          <CardContent className="pt-10 pb-8 flex flex-col items-center">
            <CheckCircle2 className="w-20 h-20 text-green-500 mb-6" />
            <h2 className="text-3xl font-bold mb-4">Solicitação Concluída!</h2>
            <p className="text-muted-foreground mb-8 text-lg">
              Seus dados foram recebidos com sucesso. Seu certificado será processado em breve.
            </p>
            <Button
              size="lg"
              onClick={() => {
                setSuccess(false);
                setFormData({ name: '', identifier: '', email: '', phone_number: '' });
              }}
            >
              Solicitar outro
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto py-12 px-4 min-h-[80vh] flex items-center justify-center">
      <Card className="w-full shadow-lg border-primary/10">
        <CardHeader className="text-center space-y-2 pb-8">
          <CardTitle className="text-3xl font-bold tracking-tight">
            Solicitar Certificado
          </CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            Preencha seus dados abaixo para solicitar o seu certificado de participação.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-destructive/15 text-destructive p-4 rounded-md flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-semibold">
                  Série / Nome Completo
                </Label>
                <Input
                  id="name"
                  placeholder="Ex: João da Silva"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  disabled={loading}
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="identifier" className="text-sm font-semibold">
                  CPF
                </Label>
                <Input
                  id="identifier"
                  placeholder="Apenas números"
                  required
                  value={formData.identifier}
                  onChange={handleChange}
                  disabled={loading}
                  className="h-12"
                  maxLength={14}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold">
                  E-mail
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="exemplo@email.com"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading}
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone_number" className="text-sm font-semibold">
                  Número do WhatsApp
                </Label>
                <Input
                  id="phone_number"
                  type="tel"
                  placeholder="(DDD) 90000-0000"
                  required
                  value={formData.phone_number}
                  onChange={handleChange}
                  disabled={loading}
                  className="h-12"
                  maxLength={15}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-lg font-medium"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Enviando...
                </>
              ) : (
                'Solicitar Certificado'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
