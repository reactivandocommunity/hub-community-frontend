'use client';

import { useMutation, useQuery, useLazyQuery } from '@apollo/client';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  Loader2,
  MapPin,
  Phone,
  QrCode,
  Tag,
  Ticket,
  Copy,
  ExternalLink,
  Video,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';

import { FadeIn } from '@/components/animations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/auth-context';
import {
  GET_EVENT_BY_SLUG_OR_ID,
  SIGNUP_TO_EVENT,
  VALIDATE_COUPON,
  IS_USER_SIGNED_UP,
} from '@/lib/queries';
import { adjustToBrazilTimezone } from '@/utils/event';

interface Batch {
  id: string;
  batch_number: number;
  value: number;
  max_quantity: number;
  enabled: boolean;
  half_price_eligible: boolean;
}

interface Product {
  id: string;
  enabled: boolean;
  name: string;
  batches: Batch[];
}

type SignupStep = 'select' | 'confirm' | 'processing' | 'success' | 'payment';

export default function EventSignupPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated, updatePhone } = useAuth();
  const slugOrId = params.id as string;

  // State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState<number | null>(null);
  const [couponMessage, setCouponMessage] = useState('');
  const [step, setStep] = useState<SignupStep>('select');
  const [signupResult, setSignupResult] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [paymentPolling, setPaymentPolling] = useState(false);
  const [copied, setCopied] = useState(false);
  const [phoneInput, setPhoneInput] = useState('');
  const [phoneError, setPhoneError] = useState('');

  // Queries & Mutations
  const { data, loading } = useQuery(GET_EVENT_BY_SLUG_OR_ID, {
    variables: { slugOrId },
  });

  const [validateCoupon, { loading: validatingCoupon }] = useLazyQuery(VALIDATE_COUPON);

  const { data: signupCheckData, loading: checkingSignup } = useQuery(IS_USER_SIGNED_UP, {
    variables: { eventId: slugOrId, email: user?.email || '' },
    skip: !isAuthenticated || !user?.email,
  });

  const [signupToEvent, { loading: signingUp }] = useMutation(SIGNUP_TO_EVENT);

  const event = data?.eventBySlugOrId;
  const isAlreadySignedUp = signupCheckData?.isUserSignedUp?.is_signed_up;
  const callLink = signupCheckData?.isUserSignedUp?.call_link;

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      const currentPath = `/events/${slugOrId}/signup`;
      router.push(`/?login=true&redirect=${encodeURIComponent(currentPath)}`);
    }
  }, [isAuthenticated, loading, router, slugOrId]);

  // Get available products with enabled batches
  const availableProducts: Product[] = (event?.products || []).filter(
    (p: Product) => p.enabled && p.batches?.some((b: Batch) => b.enabled)
  );

  // Get all available batches flattened
  const allAvailableBatches = availableProducts.flatMap((p) =>
    p.batches.filter((b) => b.enabled)
  );

  // Auto-select when there's only one product with one batch
  useEffect(() => {
    if (availableProducts.length === 1) {
      const product = availableProducts[0];
      const enabledBatches = product.batches.filter((b) => b.enabled);
      if (enabledBatches.length === 1 && !selectedBatch) {
        setSelectedProduct(product);
        setSelectedBatch(enabledBatches[0]);
      }
    }
  }, [availableProducts, selectedBatch]);

  // Calculate price
  const basePrice = selectedBatch?.value || 0;
  const discountedPrice = couponDiscount
    ? basePrice - (basePrice * couponDiscount) / 100
    : basePrice;
  const finalPrice = discountedPrice;

  // Handle coupon validation
  const handleValidateCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      const { data } = await validateCoupon({
        variables: { eventSlug: slugOrId, code: couponCode.trim() },
      });
      const result = data?.validateCoupon;
      if (result?.valid) {
        setCouponDiscount(result.discount_percentage);
        setCouponMessage(result.message);
      } else {
        setCouponDiscount(null);
        setCouponMessage(result?.message || 'Cupom inválido.');
      }
    } catch {
      setCouponMessage('Erro ao validar cupom.');
    }
  };

  // Handle signup
  const handleSignup = async () => {
    if (!user || !selectedBatch) return;

    // If user has no phone and didn't provide one, show error
    if (!user.phone && !phoneInput.trim()) {
      setPhoneError('Informe seu WhatsApp para prosseguir com a inscrição.');
      setStep('confirm');
      return;
    }

    // Validate phone format if provided
    if (!user.phone && phoneInput.trim()) {
      const digitsOnly = phoneInput.replace(/\D/g, '');
      if (digitsOnly.length < 8 || digitsOnly.length > 15) {
        setPhoneError('Informe um número válido com código do país (ex: +55 11 98765-4321).');
        setStep('confirm');
        return;
      }
    }

    setStep('processing');
    setErrorMessage('');
    setPhoneError('');

    try {
      // If user has no phone, update it first
      if (!user.phone && phoneInput.trim()) {
        const cleaned = phoneInput.replace(/[^\d+\s()-]/g, '');
        await updatePhone(cleaned);
      }

      const phoneToSend = user.phone || phoneInput.replace(/[^\d+\s()-]/g, '');

      const variables: any = {
        eventId: slugOrId,
        name: user.username || user.email.split('@')[0],
        email: user.email,
        batch_id: selectedBatch.id,
        phone_number: phoneToSend || undefined,
      };

      if (couponCode && couponDiscount) {
        variables.coupon_code = couponCode;
      }

      const { data } = await signupToEvent({ variables });
      const result = data?.signupToEvent;

      if (result?.success) {
        setSignupResult(result);
        if (finalPrice === 0) {
          setStep('success');
        } else {
          setStep('payment');
        }
      } else {
        setErrorMessage(result?.message || 'Erro ao realizar inscrição.');
        setStep('confirm');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao realizar inscrição.');
      setStep('confirm');
    }
  };

  // Copy PIX code to clipboard
  const handleCopyPix = useCallback(async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = code;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, []);

  if (loading || checkingSignup) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Evento não encontrado</h2>
          <Link href="/events">
            <Button>Voltar para eventos</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const startDate = adjustToBrazilTimezone(new Date(event.start_date));

  // Already signed up — show confirmation
  if (isAlreadySignedUp) {
    return (
      <FadeIn direction="up" duration={0.3}>
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-8 max-w-2xl">
            <Link href={`/events/${event.slug || slugOrId}`}>
              <Button variant="ghost" size="sm" className="mb-6 -ml-2">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar ao evento
              </Button>
            </Link>

            <div className="bg-card border border-border rounded-2xl p-8 text-center space-y-6">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-2">Você já está inscrito!</h1>
                <p className="text-muted-foreground">
                  Sua inscrição no evento <strong>{event.title}</strong> já foi confirmada.
                </p>
              </div>

              {event.is_online && callLink && (
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-6">
                  <div className="flex items-center gap-2 justify-center mb-3">
                    <Video className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-foreground">Link da Chamada</h3>
                  </div>
                  <a
                    href={callLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
                  >
                    Acessar reunião
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              )}

              <div className="pt-4 flex gap-3 justify-center">
                <Link href={`/events/${event.slug || slugOrId}`}>
                  <Button variant="outline" className="rounded-full">
                    Ver detalhes do evento
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </FadeIn>
    );
  }

  return (
    <FadeIn direction="up" duration={0.3}>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          {/* Back button */}
          <Link href={`/events/${event.slug || slugOrId}`}>
            <Button variant="ghost" size="sm" className="mb-6 -ml-2">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao evento
            </Button>
          </Link>

          {/* Event Header Card */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden mb-8">
            <div className="relative h-48 bg-black">
              {event.images?.[0] && (
                <Image
                  src={event.images[0]}
                  alt={event.title}
                  fill
                  className="object-cover opacity-60"
                  unoptimized
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h1 className="text-2xl font-bold text-white mb-2">{event.title}</h1>
                <div className="flex flex-wrap gap-4 text-white/80 text-sm">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {startDate.toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {startDate.toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  {event.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {event.location.title || event.location.city}
                    </span>
                  )}
                  {event.is_online && (
                    <span className="flex items-center gap-1 text-green-400">
                      <Video className="h-4 w-4" />
                      Online
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* User info strip */}
            <div className="px-6 py-4 border-t border-border/50 bg-card/50 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Inscrevendo como</p>
                <p className="font-medium text-foreground">{user?.email}</p>
              </div>
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-primary font-bold text-lg">
                  {(user?.username || user?.email || '?')[0].toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Step: Select Product/Batch */}
          {step === 'select' && (
            <div className="space-y-6">
              {availableProducts.length === 0 ? (
                <div className="bg-card border border-border rounded-2xl p-8 text-center">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Ticket className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h2 className="text-lg font-semibold text-foreground mb-2">Inscrições indisponíveis</h2>
                  <p className="text-sm text-muted-foreground">
                    Não há ingressos disponíveis para este evento no momento.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <Ticket className="h-5 w-5 text-primary" />
                    Selecione seu ingresso
                  </h2>

                  {availableProducts.map((product) => (
                    <div
                      key={product.id}
                      className="bg-card border border-border rounded-2xl overflow-hidden"
                    >
                      <div className="px-6 py-4 border-b border-border/50 bg-muted/30">
                        <h3 className="font-semibold text-foreground">{product.name}</h3>
                      </div>
                      <div className="p-4 space-y-3">
                        {product.batches
                          .filter((b) => b.enabled)
                          .sort((a, b) => a.batch_number - b.batch_number)
                          .map((batch) => {
                            const isSelected =
                              selectedProduct?.id === product.id &&
                              selectedBatch?.id === batch.id;

                            return (
                              <button
                                key={batch.id}
                                onClick={() => {
                                  setSelectedProduct(product);
                                  setSelectedBatch(batch);
                                }}
                                className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                                  isSelected
                                    ? 'border-primary bg-primary/5 shadow-sm'
                                    : 'border-border/50 hover:border-primary/30 hover:bg-muted/30'
                                }`}
                              >
                                <div className="text-left">
                                  <p className="font-medium text-foreground">
                                    {batch.batch_number}º Lote
                                  </p>
                                  {batch.half_price_eligible && (
                                    <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                                      Meia-entrada disponível
                                    </span>
                                  )}
                                </div>
                                <div className="text-right">
                                  <p className="text-lg font-bold text-foreground">
                                    {batch.value === 0
                                      ? 'Grátis'
                                      : `R$ ${(batch.value / 100).toFixed(2)}`}
                                  </p>
                                </div>
                              </button>
                            );
                          })}
                      </div>
                    </div>
                  ))}

                  {/* Coupon — only show for paid batches */}
                  {selectedBatch && selectedBatch.value > 0 && (
                    <div className="bg-card border border-border rounded-2xl p-6">
                      <h3 className="font-medium text-foreground mb-3 flex items-center gap-2">
                        <Tag className="h-4 w-4 text-primary" />
                        Cupom de desconto
                      </h3>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Digite seu cupom"
                          value={couponCode}
                          onChange={(e) => {
                            setCouponCode(e.target.value.toUpperCase());
                            setCouponDiscount(null);
                            setCouponMessage('');
                          }}
                          className="flex-1"
                        />
                        <Button
                          variant="outline"
                          onClick={handleValidateCoupon}
                          disabled={validatingCoupon || !couponCode.trim()}
                        >
                          {validatingCoupon ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            'Aplicar'
                          )}
                        </Button>
                      </div>
                      {couponMessage && (
                        <p
                          className={`text-sm mt-2 ${
                            couponDiscount ? 'text-green-600' : 'text-red-500'
                          }`}
                        >
                          {couponMessage}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Summary & Continue */}
                  {selectedBatch && (
                    <div className="bg-card border border-primary/30 rounded-2xl p-6">
                      <h3 className="font-semibold text-foreground mb-4">Resumo</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            {selectedProduct?.name} — {selectedBatch.batch_number}º Lote
                          </span>
                          <span className="text-foreground">
                            {basePrice === 0 ? 'Grátis' : `R$ ${(basePrice / 100).toFixed(2)}`}
                          </span>
                        </div>
                        {couponDiscount && basePrice > 0 && (
                          <div className="flex justify-between text-green-600">
                            <span>Desconto ({couponDiscount}%)</span>
                            <span>
                              -R$ {(((basePrice * couponDiscount) / 100) / 100).toFixed(2)}
                            </span>
                          </div>
                        )}
                        <div className="border-t border-border pt-2 flex justify-between font-bold text-lg">
                          <span>Total</span>
                          <span className="text-primary">
                            {finalPrice === 0
                              ? 'Grátis'
                              : `R$ ${(finalPrice / 100).toFixed(2)}`}
                          </span>
                        </div>
                      </div>

                      {/* Phone input — only if user has no phone */}
                      {!user?.phone && (
                        <div className="mt-6 p-4 bg-amber-500/5 border border-amber-500/30 rounded-xl space-y-3">
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-amber-600" />
                            <h4 className="font-medium text-foreground text-sm">WhatsApp</h4>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Informe seu WhatsApp para receber informações sobre o evento.
                            Aceita números internacionais.
                          </p>
                          <Input
                            type="tel"
                            placeholder="+55 11 98765-4321"
                            value={phoneInput}
                            onChange={(e) => {
                              setPhoneInput(e.target.value);
                              setPhoneError('');
                            }}
                          />
                          {phoneError && (
                            <p className="text-xs text-red-500">{phoneError}</p>
                          )}
                        </div>
                      )}

                      <Button
                        className="w-full mt-6 rounded-full"
                        size="lg"
                        onClick={() => setStep('confirm')}
                        disabled={!user?.phone && !phoneInput.trim()}
                      >
                        {finalPrice === 0 ? 'Confirmar Inscrição' : 'Continuar para pagamento'}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step: Confirm */}
          {step === 'confirm' && (
            <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
              <h2 className="text-lg font-semibold text-foreground">Confirmar Inscrição</h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-border/30">
                  <span className="text-muted-foreground">Evento</span>
                  <span className="font-medium text-foreground">{event.title}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border/30">
                  <span className="text-muted-foreground">Participante</span>
                  <span className="font-medium text-foreground">{user?.email}</span>
                </div>
                {selectedProduct && (
                  <div className="flex justify-between py-2 border-b border-border/30">
                    <span className="text-muted-foreground">Produto</span>
                    <span className="font-medium text-foreground">
                      {selectedProduct.name} — {selectedBatch?.batch_number}º Lote
                    </span>
                  </div>
                )}
                {(user?.phone || phoneInput) && (
                  <div className="flex justify-between py-2 border-b border-border/30">
                    <span className="text-muted-foreground">WhatsApp</span>
                    <span className="font-medium text-foreground">{user?.phone || phoneInput}</span>
                  </div>
                )}
                <div className="flex justify-between py-2 text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">
                    {finalPrice === 0
                      ? 'Grátis'
                      : `R$ ${(finalPrice / 100).toFixed(2)}`}
                  </span>
                </div>
              </div>

              {errorMessage && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-600 text-sm">
                  {errorMessage}
                </div>
              )}
              {phoneError && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-600 text-sm">
                  {phoneError}
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 rounded-full"
                  onClick={() => {
                    setStep('select');
                    setErrorMessage('');
                  }}
                >
                  Voltar
                </Button>
                <Button
                  className="flex-1 rounded-full"
                  size="lg"
                  onClick={handleSignup}
                  disabled={signingUp}
                >
                  {signingUp ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    'Confirmar Inscrição'
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Step: Processing */}
          {step === 'processing' && (
            <div className="bg-card border border-border rounded-2xl p-12 text-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-foreground">Processando inscrição...</h2>
              <p className="text-sm text-muted-foreground mt-2">
                Aguarde enquanto confirmamos sua inscrição.
              </p>
            </div>
          )}

          {/* Step: Success (Free Event) */}
          {step === 'success' && (
            <div className="bg-card border border-border rounded-2xl p-8 text-center space-y-6">
              <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-10 w-10 text-green-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Inscrição Confirmada! 🎉
                </h2>
                <p className="text-muted-foreground">
                  Sua inscrição no evento <strong>{event.title}</strong> foi realizada com sucesso.
                </p>
              </div>

              {event.is_online && (
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-6">
                  <div className="flex items-center gap-2 justify-center mb-3">
                    <Video className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-foreground">Evento Online</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    O link da chamada estará disponível na página do evento.
                  </p>
                </div>
              )}

              <Link href={`/events/${event.slug || slugOrId}`}>
                <Button className="rounded-full" size="lg">
                  Ver página do evento
                </Button>
              </Link>
            </div>
          )}

          {/* Step: Payment (Paid Event) */}
          {step === 'payment' && signupResult?.payment && (
            <div className="space-y-6">
              <div className="bg-card border border-border rounded-2xl p-6 text-center space-y-6">
                <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto">
                  <QrCode className="h-8 w-8 text-amber-500" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-2">
                    Pagamento Pendente
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    Escaneie o QR Code abaixo ou copie o código PIX para realizar o pagamento.
                  </p>
                </div>

                {/* PIX QR Code */}
                {signupResult.payment.qr_code && (
                  <div className="space-y-4">
                    <div className="bg-white p-6 rounded-xl inline-block mx-auto">
                      <img
                        src={`data:image/png;base64,${signupResult.payment.qr_code}`}
                        alt="QR Code PIX"
                        className="w-48 h-48 mx-auto"
                      />
                    </div>

                    <div className="flex items-center gap-2 max-w-md mx-auto">
                      <Input
                        value={signupResult.payment.qr_code}
                        readOnly
                        className="text-xs font-mono"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyPix(signupResult.payment.qr_code)}
                      >
                        {copied ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Payment Link (credit card) */}
                {signupResult.payment.payment_link && (
                  <div className="border-t border-border pt-6">
                    <p className="text-sm text-muted-foreground mb-3">
                      Ou pague com cartão de crédito:
                    </p>
                    <a
                      href={signupResult.payment.payment_link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button
                        variant="outline"
                        className="rounded-full gap-2"
                        size="lg"
                      >
                        <CreditCard className="h-4 w-4" />
                        Pagar com Cartão
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </a>
                  </div>
                )}

                <div className="text-sm text-muted-foreground bg-muted/30 rounded-xl p-4">
                  <p>
                    Após o pagamento, sua inscrição será confirmada automaticamente.
                  </p>
                </div>
              </div>

              <div className="text-center">
                <Link href={`/events/${event.slug || slugOrId}`}>
                  <Button variant="ghost" className="rounded-full">
                    Voltar para o evento
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </FadeIn>
  );
}
