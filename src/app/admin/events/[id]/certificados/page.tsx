'use client';

import { FadeIn } from '@/components/animations';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { GET_EVENT_BY_SLUG_OR_ID } from '@/lib/queries';
import { useQuery } from '@apollo/client';
import { ArrowLeft, Loader2, Download } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import * as XLSX from 'xlsx';

interface Participant {
  id: number;
  documentId: string;
  name: string;
  email: string;
  identifier: string; // CPF
  phone_number: string;
  createdAt: string;
}

const ITEMS_PER_PAGE = 25;
const STRAPI_PAGE_SIZE = 100;

export default function CertificadosAdminPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const { data: eventData, loading: eventLoading } = useQuery(
    GET_EVENT_BY_SLUG_OR_ID,
    {
      variables: { slugOrId: id },
      skip: !id,
    }
  );

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!eventData?.eventBySlugOrId?.documentId) {
      if (!eventLoading) setLoading(false);
      return;
    }

    const fetchAllParticipants = async () => {
      try {
        const eventDocId = eventData.eventBySlugOrId.documentId;
        let allData: Participant[] = [];
        let page = 1;
        let hasMore = true;

        while (hasMore) {
          const res = await fetch(
            `https://manager.hubcommunity.io/api/participants?populate=*&filters[event][documentId][$eq]=${eventDocId}&sort=createdAt:desc&pagination[page]=${page}&pagination[pageSize]=${STRAPI_PAGE_SIZE}`
          );
          if (!res.ok) throw new Error('Falha ao buscar os participantes');

          const json = await res.json();
          const data = json.data || [];
          allData = [...allData, ...data];

          const pagination = json.meta?.pagination;
          if (pagination && page < pagination.pageCount) {
            page++;
          } else {
            hasMore = false;
          }
        }

        setParticipants(allData);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Erro desconhecido ao carregar os dados.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAllParticipants();
  }, [eventData, eventLoading]);

  const totalPages = Math.ceil(participants.length / ITEMS_PER_PAGE);

  const paginatedParticipants = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return participants.slice(start, start + ITEMS_PER_PAGE);
  }, [participants, currentPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getVisiblePages = (): (number | 'ellipsis')[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | 'ellipsis')[] = [1];

    if (currentPage > 3) {
      pages.push('ellipsis');
    }

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) {
      pages.push('ellipsis');
    }

    pages.push(totalPages);
    return pages;
  };

  const formatParticipant = (p: Participant) => {
    const date = p.createdAt
      ? new Date(p.createdAt).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : '--/--/----';

    let formattedCpf = p.identifier || '-';
    if (formattedCpf.length === 11) {
      formattedCpf = formattedCpf.replace(
        /(\d{3})(\d{3})(\d{3})(\d{2})/,
        '$1.$2.$3-$4'
      );
    }

    let formattedPhone = p.phone_number || '-';
    if (formattedPhone.length >= 10 && formattedPhone.length <= 11) {
      formattedPhone = formattedPhone.replace(
        /(\d{2})(\d{4,5})(\d{4})/,
        '($1) $2-$3'
      );
    }

    return { date, formattedCpf, formattedPhone };
  };

  const handleDownloadCSV = () => {
    if (participants.length === 0) return;

    const wsData = participants.map(p => {
      const { date, formattedCpf, formattedPhone } = formatParticipant(p);

      return {
        'Nome': p.name || '-',
        'CPF': formattedCpf,
        'E-mail': p.email || '-',
        'WhatsApp': formattedPhone,
        'Data da Solicitação': date,
      };
    });

    const ws = XLSX.utils.json_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Certificados');
    XLSX.writeFile(wb, `certificados-${eventData?.eventBySlugOrId?.slug || 'evento'}.xlsx`, { bookType: 'xlsx' });
  };

  if (eventLoading || (loading && !error)) {
    return (
      <div className="container mx-auto py-10 px-4 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const eventTitle = eventData?.eventBySlugOrId?.title || 'Evento';

  return (
    <FadeIn direction="up" duration={0.3}>
      <div className="container mx-auto py-10 px-4 max-w-6xl">
        <div className="flex items-center space-x-4 mb-8">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Solicitações de Certificado
            </h1>
            <p className="text-muted-foreground mt-1">{eventTitle}</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div>
                <CardTitle>Participantes ({participants.length})</CardTitle>
                <CardDescription>
                  Lista de pessoas que solicitaram o certificado.
                </CardDescription>
              </div>
              {participants.length > 0 && (
                <Button onClick={handleDownloadCSV} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Exportar XLSX
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="text-red-500 bg-red-500/10 p-4 rounded-lg">
                {error}
              </div>
            ) : participants.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Nenhuma solicitação encontrada.
              </p>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>CPF</TableHead>
                        <TableHead>E-mail</TableHead>
                        <TableHead>WhatsApp</TableHead>
                        <TableHead>Data da Solicitação</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedParticipants.map(p => {
                        const { date, formattedCpf, formattedPhone } = formatParticipant(p);

                        return (
                          <TableRow key={p.documentId || p.id}>
                            <TableCell className="font-medium whitespace-nowrap">
                              {p.name || '-'}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              {formattedCpf}
                            </TableCell>
                            <TableCell>{p.email || '-'}</TableCell>
                            <TableCell className="whitespace-nowrap">
                              {formattedPhone}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              {date}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
                    <p className="text-sm text-muted-foreground">
                      Exibindo {((currentPage - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, participants.length)} de {participants.length} participantes
                    </p>
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              handlePageChange(currentPage - 1);
                            }}
                            className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                          />
                        </PaginationItem>

                        {getVisiblePages().map((page, index) =>
                          page === 'ellipsis' ? (
                            <PaginationItem key={`ellipsis-${index}`}>
                              <PaginationEllipsis />
                            </PaginationItem>
                          ) : (
                            <PaginationItem key={page}>
                              <PaginationLink
                                href="#"
                                isActive={page === currentPage}
                                onClick={(e) => {
                                  e.preventDefault();
                                  handlePageChange(page);
                                }}
                                className="cursor-pointer"
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          )
                        )}

                        <PaginationItem>
                          <PaginationNext
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              handlePageChange(currentPage + 1);
                            }}
                            className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </FadeIn>
  );
}
