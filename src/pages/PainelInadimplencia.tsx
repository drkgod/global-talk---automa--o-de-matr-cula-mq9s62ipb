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
import { Mail, Bell, Lock, UserCheck, TrendingDown } from 'lucide-react'
import pb from '@/lib/pocketbase/client'

const PainelInadimplencia = () => {
  const [inadimplencias, setInadimplencias] = useState<any[]>([])
  const [acoes, setAcoes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const carregar = useCallback(async () => {
    try {
      setInadimplencias(await pb.collection('inadimplencia').getFullList({ sort: '-dias_atraso' }))
      setAcoes(await pb.collection('acoes_cobranca').getFullList({ sort: '-created' }))
    } catch (_) {
      /* dados ainda não existem */
    } finally {
      setLoading(false)
    }
  }, [])
  useEffect(() => {
    carregar()
  }, [carregar])

  const nivelBadge = (n: string) =>
    ({
      lembrete: 'bg-blue-100 text-blue-800',
      notificacao: 'bg-amber-100 text-amber-800',
      bloqueio: 'bg-orange-100 text-orange-800',
      renegociacao: 'bg-red-100 text-red-800',
      cobranca_inicial: 'bg-blue-100 text-blue-800',
      reenvio_3d: 'bg-amber-100 text-amber-800',
      escala_15d_diretoria: 'bg-red-100 text-red-800',
    })[n] || 'bg-gray-100'
  const statusBadge = (s: string) =>
    ({
      ativo: 'bg-red-100 text-red-800',
      resolvido: 'bg-green-100 text-green-800',
      renegociado: 'bg-blue-100 text-blue-800',
      encaminhado_diretoria: 'bg-purple-100 text-purple-800',
      escalado_diretoria: 'bg-purple-100 text-purple-800',
    })[s] || 'bg-gray-100'
  const totalDevido = inadimplencias
    .filter(
      (i) =>
        i.status === 'ativo' ||
        i.status === 'encaminhado_diretoria' ||
        i.status === 'escalado_diretoria',
    )
    .reduce((s, i) => s + i.valor_devido, 0)

  return (
    <div className="container mx-auto py-6 px-4 max-w-5xl">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <TrendingDown className="w-6 h-6 text-red-600" />
        Inadimplência
      </h1>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-500">Total devido</p>
            <p className="text-2xl font-bold text-red-600">R$ {totalDevido.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-500">Casos ativos</p>
            <p className="text-2xl font-bold text-amber-600">
              {inadimplencias.filter((i) => i.status === 'ativo').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-500">Diretoria</p>
            <p className="text-2xl font-bold text-purple-600">
              {
                inadimplencias.filter(
                  (i) => i.status === 'encaminhado_diretoria' || i.status === 'escalado_diretoria',
                ).length
              }
            </p>
          </CardContent>
        </Card>
      </div>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Níveis de Escalonamento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-3">
            {[
              { n: 'lembrete', d: '1-7 dias', i: Mail, c: 'text-blue-600' },
              { n: 'notificacao', d: '8-15 dias', i: Bell, c: 'text-amber-600' },
              { n: 'bloqueio', d: '16-30 dias', i: Lock, c: 'text-orange-600' },
              { n: 'renegociacao', d: '30+ dias', i: UserCheck, c: 'text-red-600' },
            ].map((n) => (
              <div key={n.n} className="border rounded-lg p-3">
                <n.i className={`w-5 h-5 ${n.c} mb-1`} />
                <p className="font-medium text-sm">{n.n}</p>
                <p className="text-xs text-gray-500">{n.d}</p>
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
            <p className="text-gray-400 text-center py-4">Nenhum caso registrado.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dias atraso</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Nível</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inadimplencias.map((i) => (
                  <TableRow key={i.id}>
                    <TableCell className="font-medium">{i.dias_atraso} dias</TableCell>
                    <TableCell>R$ {i.valor_devido.toFixed(2)}</TableCell>
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
      {acoes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Histórico de Ações</CardTitle>
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
                      <Badge variant="outline">{a.tipo_acao}</Badge>
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
