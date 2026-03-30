'use client';

import {
  ArrowUpRight,
  Calendar,
  Github,
  Globe,
  Heart,
  Info,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Sparkles,
  Target,
  Twitter,
  Users,
  Zap,
} from 'lucide-react';
import Image from 'next/image';

import {
  AnimateOnScroll,
  FadeIn,
  StaggerContainer,
  StaggerItem,
} from '@/components/animations';
import { Button } from '@/components/ui/button';

const values = [
  {
    icon: Users,
    title: 'Comunidade',
    description:
      'Acreditamos no poder da colaboração e do compartilhamento de conhecimento.',
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
  },
  {
    icon: Target,
    title: 'Foco',
    description:
      'Mantemos o foco em conectar pessoas com as oportunidades certas.',
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
  },
  {
    icon: Heart,
    title: 'Paixão',
    description:
      'Somos apaixonados por tecnologia e pelo crescimento da comunidade tech.',
    color: 'text-rose-500',
    bg: 'bg-rose-500/10',
  },
  {
    icon: Zap,
    title: 'Inovação',
    description:
      'Buscamos sempre novas formas de melhorar a experiência dos usuários.',
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
  },
];

const stats = [
  { value: '500+', label: 'Comunidades', icon: Users },
  { value: '10K+', label: 'Desenvolvedores', icon: Globe },
  { value: '1K+', label: 'Eventos', icon: Calendar },
  { value: '50+', label: 'Cidades', icon: MapPin },
];

const team = [
  {
    name: 'Pedro Goiânia',
    role: 'Co-Fundador',
    bio: 'JavaScript Jedi com 10+ anos de experiência de desenvolvimento e em comunidades tech.',
    avatar:
      'https://hubcommunity-manager.8020digital.com.br/uploads/1730223158826_1b30749fc2.jpeg',
    social: {
      github: 'http://github.com/pedrogoiania',
      twitter: 'http://x.com/opedrogoiania',
      linkedin: 'http://linkedin.com/in/pedrogoiania',
    },
  },
  {
    name: 'Fábio Leão Júnior',
    role: 'Co-Fundador',
    bio: 'Desenvolvedor Full Stack com foco em React e Python, apaixonado por criar soluções inovadoras com mais de 6 anos de experiência.',
    avatar: 'http://github.com/fjrleao.png',
    social: {
      github: 'http://github.com/fjrleao',
      linkedin: 'http://linkedin.com/in/fjrleao',
    },
  },
  {
    name: 'Marcus Vinícius',
    role: 'Co-Fundador',
    bio: 'Desenvolvedor de Software com 7+ anos de experiência, especialista no ecossistema React e React Native.',
    avatar:
      'https://hubcommunity-manager.8020digital.com.br/uploads/1740619175287_b13423c1ca.jpeg',
    social: {
      github: 'http://github.com/mvmmarcus',
      linkedin: 'http://linkedin.com/in/mvmmarcus',
    },
  },
  {
    name: 'Lucas Lemos',
    role: 'Co-Fundador',
    bio: 'Engenheiro de Software com 8 anos de experiência, especialista em backend com Golang e Node.js, contribuidor open-source.',
    avatar: 'https://github.com/luk3skyw4lker.png',
    social: {
      github: 'http://github.com/luk3skyw4lker',
      linkedin: 'http://linkedin.com/in/lucashenriqueblemos',
    },
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Compact Header */}
      <div className="border-b border-border/40 bg-card/30">
        <div className="container mx-auto px-4 pt-24 pb-8">
          <FadeIn direction="up" duration={0.3}>
            <div className="max-w-3xl">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                  <Info className="h-5 w-5 text-secondary" />
                </div>
                <h1 className="text-3xl font-bold text-foreground">
                  Sobre o Hub Community
                </h1>
              </div>
              <p className="text-muted-foreground ml-[52px] max-w-xl leading-relaxed">
                Conectando desenvolvedores e comunidades de tecnologia em todo o
                Brasil desde 2013
              </p>
            </div>
          </FadeIn>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Mission / History Section */}
        <AnimateOnScroll>
          <section className="mb-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <span className="text-sm font-semibold text-primary uppercase tracking-wider">
                    Nossa História
                  </span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6 leading-tight">
                  De uma ideia local para uma{' '}
                  <span className="text-primary">plataforma nacional</span>
                </h2>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  O HubCommunity nasceu da necessidade de centralizar informações
                  sobre comunidades e eventos de tecnologia em Goiás. Percebemos
                  que muitas pessoas talentosas estavam perdendo oportunidades
                  incríveis de aprendizado e networking simplesmente porque não
                  sabiam onde encontrar essas informações.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Desde 2013, já conectamos diversas pessoas com suas comunidades
                  ideais, facilitando o acesso a diversos eventos em Goiás.
                </p>
              </div>
              <div className="relative">
                <div className="rounded-2xl overflow-hidden border border-border/50">
                  <Image
                    src="/images/hero-background.png"
                    alt="Equipe HubCommunity"
                    width={800}
                    height={400}
                    className="w-full h-72 lg:h-80 object-cover"
                    unoptimized
                  />
                </div>
                {/* Floating accent */}
                <div className="absolute -bottom-4 -left-4 w-24 h-24 rounded-2xl bg-primary/10 -z-10 hidden lg:block" />
                <div className="absolute -top-4 -right-4 w-16 h-16 rounded-xl bg-secondary/10 -z-10 hidden lg:block" />
              </div>
            </div>
          </section>
        </AnimateOnScroll>

        {/* Stats Section — clean row */}
        <AnimateOnScroll>
          <section className="mb-20">
            <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <StaggerItem key={stat.label}>
                    <div className="relative rounded-2xl border border-border/50 bg-card p-6 text-center hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="text-3xl font-bold text-foreground mb-1">
                        {stat.value}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {stat.label}
                      </div>
                    </div>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>
          </section>
        </AnimateOnScroll>

        {/* Values Section */}
        <AnimateOnScroll>
          <section className="mb-20">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="h-5 w-5 text-rose-500" />
              <span className="text-sm font-semibold text-rose-500 uppercase tracking-wider">
                Valores
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8">
              O que nos move
            </h2>

            <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {values.map((value) => {
                const Icon = value.icon;
                return (
                  <StaggerItem key={value.title}>
                    <div className="group relative rounded-2xl border border-border/50 bg-card p-6 hover:border-primary/20 hover:shadow-lg transition-all duration-300 h-full">
                      <div
                        className={`w-12 h-12 rounded-xl ${value.bg} flex items-center justify-center mb-4`}
                      >
                        <Icon className={`h-6 w-6 ${value.color}`} />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        {value.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {value.description}
                      </p>
                    </div>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>
          </section>
        </AnimateOnScroll>

        {/* Team Section */}
        <AnimateOnScroll>
          <section className="mb-20">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-5 w-5 text-secondary" />
              <span className="text-sm font-semibold text-secondary uppercase tracking-wider">
                Equipe
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8">
              Quem está por trás
            </h2>

            <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {team.map((member) => (
                <StaggerItem key={member.name}>
                  <div className="group relative rounded-2xl border border-border/50 bg-card overflow-hidden hover:border-primary/20 hover:shadow-lg transition-all duration-300 h-full">
                    {/* Avatar with subtle color bg */}
                    <div className="relative flex justify-center pt-8 pb-4">
                      <div className="relative">
                        <Image
                          src={member.avatar}
                          alt={member.name}
                          width={88}
                          height={88}
                          className="w-22 h-22 rounded-full object-cover ring-4 ring-border/50 group-hover:ring-primary/30 transition-all duration-300"
                          style={{ width: '88px', height: '88px' }}
                          unoptimized
                        />
                        {/* Online-style dot */}
                        <div className="absolute bottom-0.5 right-0.5 w-4 h-4 rounded-full bg-primary border-2 border-card" />
                      </div>
                    </div>

                    {/* Info */}
                    <div className="px-5 pb-6 text-center">
                      <h3 className="text-base font-semibold text-foreground mb-0.5">
                        {member.name}
                      </h3>
                      <p className="text-xs font-medium text-primary mb-3">
                        {member.role}
                      </p>
                      <p className="text-xs text-muted-foreground leading-relaxed mb-4 line-clamp-3">
                        {member.bio}
                      </p>

                      {/* Social links */}
                      <div className="flex justify-center gap-2">
                        {member.social.github && (
                          <a
                            href={member.social.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                          >
                            <Github className="h-4 w-4" />
                          </a>
                        )}
                        {member.social.twitter && (
                          <a
                            href={member.social.twitter}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                          >
                            <Twitter className="h-4 w-4" />
                          </a>
                        )}
                        {member.social.linkedin && (
                          <a
                            href={member.social.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                          >
                            <Linkedin className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </section>
        </AnimateOnScroll>

        {/* Contact CTA */}
        <AnimateOnScroll>
          <section>
            <div className="relative rounded-2xl border border-border/50 bg-card overflow-hidden">
              {/* Subtle gradient accents */}
              <div className="absolute top-0 left-0 w-40 h-40 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 right-0 w-40 h-40 bg-secondary/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

              <div className="relative p-8 md:p-12 text-center">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                  Entre em Contato
                </h2>
                <p className="text-muted-foreground mb-8 max-w-lg mx-auto leading-relaxed">
                  Tem alguma dúvida, sugestão ou quer fazer parte da nossa
                  equipe? Adoraríamos ouvir de você!
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    size="lg"
                    className="rounded-xl gap-2 font-semibold"
                    onClick={() => {
                      if (typeof window !== 'undefined') {
                        window.open('mailto:contato@8020digital.com.br');
                      }
                    }}
                  >
                    <Mail className="h-4 w-4" />
                    Enviar Email
                    <ArrowUpRight className="h-4 w-4" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="rounded-xl gap-2 font-semibold bg-transparent"
                    onClick={() => {
                      if (typeof window !== 'undefined') {
                        window.open(
                          'https://instagram.com/joincommunity',
                          '_blank'
                        );
                      }
                    }}
                  >
                    <Instagram className="h-4 w-4" />
                    Seguir no Instagram
                  </Button>
                </div>
              </div>
            </div>
          </section>
        </AnimateOnScroll>
      </div>
    </div>
  );
}
