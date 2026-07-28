import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { AlertTriangle, TrendingDown, Mail, Bell, Lock, UserCheck } from 'lucide-react'
import { toast } from 'sonner'
import pb from '@/lib/pocketbase/client'

interface Inadimplencia {
  id: string
  matricula_id: string
  dias_atraso: number
  valor_devido: number
  nivel_escalonamento: string
  status: string
  observacao: string
  created: string
}

interface AcaoCobranca {
  id: string
  inadimplencia_id: string
  tipo_acao: string
  descricao: string
  executada: boolean
  resultado: string
  created: string
}

const PainelInadimplencia = () => {
  const [inadimplencias, setInadimplencias] = useState<Inadimplencia[]>([])
  const [acoes, setAcoes] = useState<AcaoCobranca[]>([])
  const [loading, setLoading] = useState(true)

  const carregar = useCallback(async () => {
    try {
      const inads = await pb.collection('inadimplencia').getFullList({ sort: '-dias_atraso' })
      setInadimplencias(inads as unknown as Inadimplencia[])
      const acs = await pb.collection('acoes_cobranca').getFullList({ sort: '-created' })
      setAcoes(acs as unknown as AcaoCobranca[])
    } catch (err) {
      /* ignore */
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    carregar()
  }, [carregar])

  const nivelIcon = (nivel: string) => {
    const map: Record<string, typeof Mail> = {
      lembrete: Mail,
      notificacao: Bell,
      bloqueio: Lock,
      renegociacao: UserCheck,
    }
    return map[nivel] || AlertTriangle
  }

  const nivelLabel = (n: string) =>
    ({
      lembrete: 'Lembrete',
      notificacao: 'Notificação',
      bloqueio: 'Bloqueio',
      renegociacao: 'Renegociação',
    })[n] || n

  const nivelBadge = (n: string) => {
    const map: Record<string, string> = {
      lembrete: 'bg-blue-100 text-blue-800',
      notificacao: 'bg-amber-100 text-amber-800',
      bloqueio: 'bg-orange-100 text-orange-800',
      renegociacao: 'bg-red-100 text-red-800',
    }
    return map[n] || 'bg-gray-100'
  }

  const statusBadge = (s: string) => {
    const map: Record<string, string> = {
      ativo: 'bg-red-100 text-red-800',
      resolvido: 'bg-green-100 text-green-800',
      renegociado: 'bg-blue-100 text-blue-800',
      encaminhado_diretoria: 'bg-purple-100 text-purple-800',
    }
    return map[s] || 'bg-gray-100'
  }

  const tipoAcaoLabel = (t: string) =>
    ({
      lembrete_email: 'E-mail',
      lembrete_sms: 'SMS',
      notificacao_sistema: 'Sistema',
      bloqueio_acesso: 'Bloqueio',
      convocacao_diretoria: 'Diretoria',
      proposta_renegociacao: 'Renegociação',
    })[t] || t

  const totalDevido = inadimplencias
    .filter((i) => i.status === 'ativo' || i.status === 'encaminhado_diretoria')
    .reduce((s, i) => s + i.valor_devido, 0)
  const ativos = inadimplencias.filter((i) => i.status === 'ativo').length
  const encaminhados = inadimplencias.filter((i) => i.status === 'encaminhado_diretoria').length

  return (
    <div className="container mx-auto py-6 px-4 max-w-5xl">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <TrendingDown className="w-6 h-6 text-red-600" />
        Inadimplência — Escalonamento Automático
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-500">Total devido</p>
            <p className="text-2xl font-bold text-red-600">R$ {totalDevido.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-500">Casos ativos</p>
            <p className="text-2xl font-bold text-amber-600">{ativos}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-500">Encaminhados à diretoria</p>
            <p className="text-2xl font-bold text-purple-600">{encaminhados}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de escalonamento */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Níveis de Escalonamento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            {[
              {
                nivel: 'lembrete',
                dias: '1-7 dias',
                desc: 'E-mail de lembrete automático',
                icon: Mail,
                color: 'text-blue-600',
              },
              {
                nivel: 'notificacao',
                dias: '8-15 dias',
                desc: 'Notificação no sistema',
                icon: Bell,
                color: 'text-amber-600',
              },
              {
                nivel: 'bloqueio',
                dias: '16-30 dias',
                desc: 'Bloqueio de acesso + diretoria',
                icon: Lock,
                color: 'text-orange-600',
              },
              {
                nivel: 'renegociacao',
                dias: '30+ dias',
                desc: 'Renegociação pela diretora',
                icon: UserCheck,
                color: 'text-red-600',
              },
            ].map((n) => (
              <div key={n.nivel} className="border rounded-lg p-3">
                <n.icon className={`w-5 h-5 ${n.color} mb-1`} />
                <p className="font-medium text-sm">{n.nivel}</p>
                <p className="text-xs text-gray-500">{n.dias}</p>
                <p className="text-xs text-gray-400 mt-1">{n.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Casos de Inadimplência</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-gray-500 text-center py-4">Carregando...</p>
          ) : inadimplencias.length === 0 ? (
            <p className="text-gray-400 text-center py-4">
              Nenhum caso de inadimplência registrado.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dias atraso</TableHead>
                  <TableHead>Valor devido</TableHead>
                  <TableHead>Nível</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Obs</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inadimplencias.map((i) => {
                  const Icon = nivelIcon(i.nivel_escalonamento)
                  return (
                    <TableRow key={i.id}>
                      <TableCell className="font-medium">{i.dias_atraso} dias</TableCell>
                      <TableCell>R$ {i.valor_devido.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge className={nivelBadge(i.nivel_escalonamento)}>
                          <Icon className="w-3 h-3 mr-1" />
                          {nivelLabel(i.nivel_escalonamento)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusBadge(i.status)}>{i.status}</Badge>
                      </TableCell>
                      <TableCell className="text-xs text-gray-500 max-w-xs truncate">
                        {i.observacao || '—'}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {acoes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Histórico de Ações de Cobrança</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {acoes.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell>
                      <Badge variant="outline">{tipoAcaoLabel(a.tipo_acao)}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">{a.descricao}</TableCell>
                    <TableCell className="text-xs text-gray-400">
                      {new Date(a.created).toLocaleString('pt-BR')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default PainelInadimplencia
