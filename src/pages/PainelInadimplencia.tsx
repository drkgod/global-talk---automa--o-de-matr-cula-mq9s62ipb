import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Mail, Bell, Lock, UserCheck, TrendingDown, AlertTriangle } from 'lucide-react'
import pb from '@/lib/pocketbase/client'

const PainelInadimplencia = () => {
  const [inadimplencias, setInadimplencias] = useState<any[]>([])
  const [acoes, setAcoes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const carregar = useCallback(async () => {
    try {
      setInadimplencias(await pb.collection('inadimplencia').getFullList({ sort: '-dias_atraso' }))
      setAcoes(await pb.collection('acoes_cobranca').getFullList({ sort: '-created' }))
    } catch {
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    carregar()
  }, [carregar])

  const nivelBadge = (n: string) =>
    ({
      lembrete: 'gt-badge-blue',
      notificacao: 'gt-badge-amber',
      bloqueio: 'bg-orange-100 text-orange-700',
      renegociacao: 'gt-badge-red',
      cobranca_inicial: 'gt-badge-blue',
      reenvio_3d: 'gt-badge-amber',
      escala_15d_diretoria: 'gt-badge-red',
    })[n] || 'bg-gray-100 text-gray-700'

  const statusBadge = (s: string) =>
    ({
      ativo: 'gt-badge-red',
      resolvido: 'gt-badge-green',
      renegociado: 'gt-badge-blue',
      encaminhado_diretoria: 'gt-badge-purple',
      escalado_diretoria: 'gt-badge-purple',
    })[s] || 'bg-gray-100 text-gray-700'

  const totalDevido = inadimplencias
    .filter(
      (i) =>
        i.status === 'ativo' ||
        i.status === 'encaminhado_diretoria' ||
        i.status === 'escalado_diretoria',
    )
    .reduce((s, i) => s + i.valor_devido, 0)

  const niveis = [
    { n: 'lembrete', d: '1-7 dias', i: Mail, c: 'text-blue-600', bg: 'bg-blue-100' },
    { n: 'notificacao', d: '8-15 dias', i: Bell, c: 'text-amber-600', bg: 'bg-amber-100' },
    { n: 'bloqueio', d: '16-30 dias', i: Lock, c: 'text-orange-600', bg: 'bg-orange-100' },
    { n: 'renegociacao', d: '30+ dias', i: UserCheck, c: 'text-red-600', bg: 'bg-red-100' },
  ]

  return (
    <div className="container mx-auto py-8 px-6 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gt-on-surface flex items-center gap-3">
          <TrendingDown className="w-8 h-8 text-red-600" />
          Inadimplência
        </h1>
        <p className="text-gt-on-surface-variant mt-1">
          Acompanhe e gerencie casos de inadimplência
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="gt-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gt-outline">Total devido</p>
                <p className="text-3xl font-bold text-red-600">R$ {totalDevido.toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="gt-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gt-outline">Casos ativos</p>
                <p className="text-3xl font-bold text-amber-600">
                  {inadimplencias.filter((i) => i.status === 'ativo').length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                <Bell className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="gt-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gt-outline">Diretoria</p>
                <p className="text-3xl font-bold text-purple-600">
                  {
                    inadimplencias.filter(
                      (i) =>
                        i.status === 'encaminhado_diretoria' || i.status === 'escalado_diretoria',
                    ).length
                  }
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Escalation Levels */}
      <Card className="gt-card mb-8">
        <CardHeader className="border-b border-gt-outline-variant">
          <CardTitle className="text-lg font-bold text-gt-on-surface">
            Níveis de Escalonamento
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {niveis.map((n) => (
              <div key={n.n} className={`rounded-xl p-4 border border-gt-outline-variant ${n.bg}`}>
                <n.i className={`w-6 h-6 ${n.c} mb-2`} />
                <p className="font-semibold text-gt-on-surface capitalize">{n.n}</p>
                <p className="text-sm text-gt-on-surface-variant">{n.d}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Cases Table */}
      <Card className="gt-card mb-8">
        <CardHeader className="border-b border-gt-outline-variant">
          <CardTitle className="text-lg font-bold text-gt-on-surface">
            Casos de Inadimplência
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-gt-outline">Carregando...</div>
          ) : inadimplencias.length === 0 ? (
            <div className="p-8 text-center text-gt-outline">Nenhum caso registrado.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-b border-gt-outline-variant">
                  <TableHead className="font-semibold text-gt-on-surface">Dias atraso</TableHead>
                  <TableHead className="font-semibold text-gt-on-surface">Valor</TableHead>
                  <TableHead className="font-semibold text-gt-on-surface">Nível</TableHead>
                  <TableHead className="font-semibold text-gt-on-surface">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inadimplencias.map((i) => (
                  <TableRow
                    key={i.id}
                    className="border-b border-gt-outline-variant hover:bg-gt-surface-container"
                  >
                    <TableCell className="font-medium text-gt-on-surface">
                      {i.dias_atraso} dias
                    </TableCell>
                    <TableCell className="font-medium text-gt-on-surface">
                      R$ {i.valor_devido.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge className={nivelBadge(i.nivel_escalonamento)}>
                        {i.nivel_escalonamento}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusBadge(i.status)}>{i.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Actions History */}
      {acoes.length > 0 && (
        <Card className="gt-card">
          <CardHeader className="border-b border-gt-outline-variant">
            <CardTitle className="text-lg font-bold text-gt-on-surface">
              Histórico de Ações
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-gt-outline-variant">
                  <TableHead className="font-semibold text-gt-on-surface">Tipo</TableHead>
                  <TableHead className="font-semibold text-gt-on-surface">Descrição</TableHead>
                  <TableHead className="font-semibold text-gt-on-surface">Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {acoes.map((a) => (
                  <TableRow
                    key={a.id}
                    className="border-b border-gt-outline-variant hover:bg-gt-surface-container"
                  >
                    <TableCell>
                      <Badge variant="outline" className="border-gt-outline-variant">
                        {a.tipo_acao}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gt-on-surface">{a.descricao}</TableCell>
                    <TableCell className="text-sm text-gt-outline">
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
