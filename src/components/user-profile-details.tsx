'use client';

import { useQuery } from '@apollo/client';
import { Calendar } from 'lucide-react';
import Image from 'next/image';

import { FadeIn } from '@/components/animations';
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
import { UserProfileDetailsSkeleton } from '@/components/user-profile-details-skeleton';
import { GET_USER_BY_USERNAME } from '@/lib/queries';
import { UserProfileResponse } from '@/lib/types';

interface UserProfileDetailsProps {
    username: string;
}

function getInitials(username: string) {
    return username?.charAt(0)?.toUpperCase() || 'U';
}

export function UserProfileDetails({ username }: UserProfileDetailsProps) {
    const { data, loading, error } = useQuery<UserProfileResponse>(
        GET_USER_BY_USERNAME,
        { variables: { username } }
    );

    if (loading) {
        return <UserProfileDetailsSkeleton />;
    }

    if (error) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center py-12 md:py-16">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-foreground mb-4">
                        Erro ao carregar perfil
                    </h2>
                    <p className="text-muted-foreground mb-4">
                        Não foi possível carregar os detalhes do usuário.
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

    const user = data?.userByUsername;

    if (!user) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center py-12 md:py-16">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-foreground mb-4">
                        Usuário não encontrado
                    </h2>
                    <p className="text-muted-foreground">
                        O usuário que você está procurando não existe ou foi
                        removido.
                    </p>
                </div>
            </div>
        );
    }

    const agenda = (user.agenda ?? []).filter((item: any) => item?.event);

    return (
        <FadeIn direction="up" duration={0.3}>
        <div className="min-h-screen bg-background">
            {/* Profile hero */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-700 py-10 sm:py-12 lg:py-16 xl:py-20">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col items-center gap-4 lg:flex-row lg:items-center lg:gap-6">
                        <Avatar className="h-24 w-24 sm:h-28 sm:w-28 lg:h-32 lg:w-32 ring-4 ring-white/30 flex-shrink-0">
                            <AvatarImage
                                src={user.speaker?.avatar}
                                alt={user.username}
                            />
                            <AvatarFallback className="text-2xl sm:text-3xl lg:text-4xl text-white bg-white/20">
                                {getInitials(user.username)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="text-center lg:text-left">
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
                                {user.username}
                            </h1>
                            <p className="text-white/90 text-base sm:text-lg mt-1">
                                @{user.username}
                            </p>
                            <Badge
                                variant="secondary"
                                className="mt-2 bg-white/20 text-white border-0 hover:bg-white/30"
                            >
                                Membro
                            </Badge>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content: Eventos do usuário */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12">
                <div className="max-w-4xl mx-auto">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Eventos do usuário
                            </CardTitle>
                            <CardDescription>
                                Eventos na agenda deste usuário
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {agenda.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    Este usuário ainda não tem eventos na
                                    agenda.
                                </p>
                            ) : (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5">
                                    {agenda.map((item: any, index: number) => (
                                        <div
                                            key={index}
                                            className="rounded-lg border border-border overflow-hidden"
                                        >
                                            <div className="relative h-36 sm:h-40 w-full bg-muted">
                                                {item?.event?.images &&
                                                item?.event?.images.length > 0 ? (
                                                    <Image
                                                        src={
                                                            item?.event?.images[0]
                                                        }
                                                        alt={
                                                            item?.event?.title
                                                        }
                                                        fill
                                                        className="object-cover"
                                                        unoptimized
                                                    />
                                                ) : (
                                                    <div className="h-full w-full bg-muted flex items-center justify-center">
                                                        <Calendar className="h-10 w-10 text-muted-foreground" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-3 sm:p-4">
                                                <p className="font-semibold text-foreground line-clamp-2">
                                                    {item?.event?.title}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
        </FadeIn>
    );
}
