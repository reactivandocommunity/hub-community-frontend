'use client';

import { useQuery } from '@apollo/client';
import { Calendar, LogOut, Mail, Monitor, Moon, Phone, Shield, Sun, User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

import { FadeIn } from '@/components/animations';
import { ProfileSkeleton } from '@/components/profile-skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAgenda } from '@/contexts/agenda-context';
import { useAuth } from '@/contexts/auth-context';
import { GET_USER_BY_USERNAME } from '@/lib/queries';

export default function ProfilePage() {
  const { user, isAuthenticated, signOut, isLoading, updatePhone, syncUser } = useAuth();
  const { agendas, isLoading: agendasLoading } = useAgenda();
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  const [phoneInput, setPhoneInput] = useState('');
  const [isUpdatingPhone, setIsUpdatingPhone] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [phoneSuccess, setPhoneSuccess] = useState(false);

  // Fetch fresh user data from BFF to sync with localStorage
  const { data: freshUserData } = useQuery(GET_USER_BY_USERNAME, {
    variables: { username: user?.username || '' },
    skip: !user?.username,
    fetchPolicy: 'network-only',
  });

  // Sync fresh data back to auth context
  useEffect(() => {
    if (freshUserData?.userByUsername && syncUser) {
      const fresh = freshUserData.userByUsername;
      syncUser({
        phone: fresh.phone || undefined,
        avatar: fresh.speaker?.avatar || undefined,
      });
    }
  }, [freshUserData]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleSignOut = () => {
    signOut();
    router.push('/');
  };

  const handlePhoneSubmit = async () => {
    if (!phoneInput.trim()) {
      setPhoneError('Informe um número de telefone.');
      return;
    }
    // Clean input: keep only +, digits, and spaces
    const cleaned = phoneInput.replace(/[^\d+\s()-]/g, '');
    // Basic international phone validation: starts with + and has at least 8 digits
    const digitsOnly = cleaned.replace(/\D/g, '');
    if (digitsOnly.length < 8 || digitsOnly.length > 15) {
      setPhoneError('Informe um número válido com código do país (ex: +55 11 98765-4321).');
      return;
    }

    setPhoneError('');
    setIsUpdatingPhone(true);
    try {
      await updatePhone(cleaned);
      setPhoneSuccess(true);
      setTimeout(() => setPhoneSuccess(false), 3000);
    } catch (err: any) {
      setPhoneError(err.message || 'Erro ao atualizar telefone.');
    } finally {
      setIsUpdatingPhone(false);
    }
  };

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <FadeIn direction="up" duration={0.3}>
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Meu Perfil
              </h1>
              <p className="text-muted-foreground">
                Gerencie suas informações pessoais
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Profile Card */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Informações Pessoais
                    </CardTitle>
                    <CardDescription>
                      Suas informações básicas de perfil
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-20 w-20">
                        <AvatarImage
                          src={user?.avatar}
                          alt={user?.name || user?.username}
                        />
                        <AvatarFallback className="text-lg">
                          {user?.name
                            ? getInitials(user.name)
                            : user?.username?.charAt(0)?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-xl font-semibold text-foreground">
                          {user?.name || 'Usuário'}
                        </h3>
                        <p className="text-muted-foreground">
                          @{user?.username}
                        </p>
                        <Badge variant="secondary" className="mt-1">
                          <Shield className="h-3 w-3 mr-1" />
                          Membro
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">
                          Nome
                        </label>
                        <p className="text-foreground">
                          {user?.name || 'Não informado'}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">
                          Username
                        </label>
                        <p className="text-foreground">@{user?.username}</p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">
                          Email
                        </label>
                        <p className="text-foreground flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          {user?.email}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">
                          Telefone WhatsApp
                        </label>
                        <p className="text-foreground flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          {user?.phone || 'Não informado'}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">
                          Status
                        </label>
                        <Badge
                          variant="outline"
                          className="text-emerald-600 dark:text-emerald-500 border-emerald-600 dark:border-emerald-500"
                        >
                          Ativo
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Phone Alert Card — only if no phone */}
                {!user?.phone && (
                  <Card className="border-amber-500/50 bg-amber-500/5">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                        <Phone className="h-5 w-5" />
                        Adicionar Telefone WhatsApp
                      </CardTitle>
                      <CardDescription>
                        Adicione seu número de WhatsApp para receber informações sobre os eventos.
                        Aceita números internacionais.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex gap-2">
                        <Input
                          type="tel"
                          placeholder="+55 11 98765-4321"
                          value={phoneInput}
                          onChange={(e) => {
                            setPhoneInput(e.target.value);
                            setPhoneError('');
                          }}
                          disabled={isUpdatingPhone}
                          className="flex-1"
                        />
                        <Button
                          onClick={handlePhoneSubmit}
                          disabled={isUpdatingPhone || !phoneInput.trim()}
                        >
                          {isUpdatingPhone ? 'Salvando...' : 'Salvar'}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Ex: +55 11 98765-4321 (Brasil), +1 555 123-4567 (EUA), +351 912 345 678 (Portugal)
                      </p>
                      {phoneError && (
                        <p className="text-sm text-red-500">{phoneError}</p>
                      )}
                      {phoneSuccess && (
                        <p className="text-sm text-green-600">Telefone atualizado com sucesso!</p>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Agendas Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Minhas Agendas
                    </CardTitle>
                    <CardDescription>
                      Eventos que você adicionou à sua agenda
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {agendasLoading ? (
                      <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                          <div
                            key={i}
                            className="flex items-center gap-3 p-3 rounded-lg border border-border"
                          >
                            <div className="h-12 w-12 rounded-lg bg-muted animate-pulse flex-shrink-0" />
                            <div className="flex-1">
                              <div className="h-5 w-3/4 bg-muted animate-pulse rounded mb-1" />
                              <div className="h-3 w-24 bg-muted animate-pulse rounded" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : agendas.length === 0 ? (
                      <div className="text-center py-8">
                        <Calendar className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                        <p className="text-muted-foreground mb-2">
                          Nenhuma agenda encontrada
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Adicione eventos à sua agenda para visualizá-los aqui
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {agendas.slice(0, 5).map(agenda => (
                          <div
                            key={agenda.documentId}
                            className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent hover:text-accent-foreground transition-colors"
                          >
                            <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                              {agenda?.event?.images &&
                              agenda?.event?.images.length > 0 ? (
                                <Image
                                  src={agenda?.event?.images[0]}
                                  alt={agenda?.event?.title}
                                  fill
                                  className="object-cover"
                                  unoptimized
                                />
                              ) : (
                                <div className="h-full w-full bg-muted flex items-center justify-center">
                                  <Calendar className="h-6 w-6 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-foreground truncate">
                                {agenda?.event?.title}
                              </h4>
                              <div className="flex gap-2 mt-1">
                                <Link
                                  href={`/events/${agenda?.event?.documentId}`}
                                  className="text-sm text-primary hover:underline"
                                >
                                  Ver evento
                                </Link>
                                <Link
                                  href={`/agendas/${agenda.documentId}`}
                                  className="text-sm text-emerald-600 dark:text-emerald-500 hover:underline"
                                >
                                  Ver agenda
                                </Link>
                              </div>
                            </div>
                          </div>
                        ))}
                        {agendas.length > 5 && (
                          <div className="text-center pt-2">
                            <p className="text-sm text-muted-foreground">
                              E mais {agendas.length - 5} evento
                              {agendas.length - 5 > 1 ? 's' : ''}...
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Actions Card */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Ações</CardTitle>
                    <CardDescription>Gerencie sua conta</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => {
                        /* TODO: Implement edit profile */
                      }}
                    >
                      <User className="h-4 w-4 mr-2" />
                      Editar Perfil
                    </Button>

                    {/* Theme Selector */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Sun className="h-4 w-4" />
                        Aparência
                      </label>
                      <div className="grid grid-cols-3 gap-1 p-1 bg-muted/50 rounded-lg">
                        <button
                          onClick={() => setTheme('light')}
                          className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                            theme === 'light'
                              ? 'bg-background text-foreground shadow-sm'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          <Sun className="h-4 w-4" />
                          <span className="hidden sm:inline">Claro</span>
                        </button>
                        <button
                          onClick={() => setTheme('dark')}
                          className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                            theme === 'dark'
                              ? 'bg-background text-foreground shadow-sm'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          <Moon className="h-4 w-4" />
                          <span className="hidden sm:inline">Escuro</span>
                        </button>
                        <button
                          onClick={() => setTheme('system')}
                          className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                            theme === 'system'
                              ? 'bg-background text-foreground shadow-sm'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          <Monitor className="h-4 w-4" />
                          <span className="hidden sm:inline">Sistema</span>
                        </button>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <Button
                        variant="destructive"
                        className="w-full justify-start"
                        onClick={handleSignOut}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sair da Conta
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="text-lg">Atividades</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          Comunidades
                        </span>
                        <span className="font-semibold">0</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          Eventos Participados
                        </span>
                        <span className="font-semibold">0</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          Eventos Criados
                        </span>
                        <span className="font-semibold">0</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
