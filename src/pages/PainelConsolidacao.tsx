import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Award, GraduationCap, Target, CheckCircle2 } from 'lucide-react'
import pb from '@/lib/pocketbase/client'

const PainelConsolidacao = () => {
  const [metricas, setMetricas] = useState<any[]>([])
  const [treinamentos, setTreinamentos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const carregar = useCallback(async () => {
    try {
      setMetricas(await pb.collection('metricas').getFullList({ sort: 'fase' }))
      setTreinamentos(
        await pb.collection('treinamentos').getFullList({ sort: '-data_treinamento' }),
      )
    } catch {
      // ok
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    carregar()
  }, [carregar])

  const statusMetrica = (s: string) =>
    ({
      atingido: 'gt-badge-green',
      parcial: 'gt-badge-amber',
      nao_atingido: 'gt-badge-red',
      em_andamento: 'gt-badge-blue',
    })[s] || 'bg-gray-100 text-gray-700'

  const statusTrein = (s: string) =>
    ({
      agendado: 'gt-badge-blue',
      concluido: 'gt-badge-green',
      cancelado: 'gt-badge-red',
    })[s] || 'bg-gray-100 text-gray-700'

  return (
    <div className="container mx-auto py-8 px-6 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gt-on-surface flex items-center gap-3">
          <Award className="w-8 h-8 text-gt-primary-container" />
          Consolidação e Encerramento
        </h1>
        <p className="text-gt-on-surface-variant mt-1">Medição final, capacitação e documentação</p>
      </div>

      {/* Metrics */}
      <Card className="gt-card mb-8">
        <CardHeader className="border-b border-gt-outline-variant">
          <CardTitle className="text-lg font-bold text-gt-on-surface flex items-center gap-2">
            <Target className="w-5 h-5 text-gt-primary-container" />
            Métricas Finais
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-gt-outline">Carregando...</div>
          ) : metricas.length === 0 ? (
            <div className="p-8 text-center text-gt-outline">Nenhuma métrica registrada.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-b border-gt-outline-variant">
                  <TableHead className="font-semibold text-gt-on-surface">Fase</TableHead>
                  <TableHead className="font-semibold text-gt-on-surface">Métrica</TableHead>
                  <TableHead className="font-semibold text-gt-on-surface">Valor</TableHead>
                  <TableHead className="font-semibold text-gt-on-surface">Meta</TableHead>
                  <TableHead className="font-semibold text-gt-on-surface">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {metricas.map((m) => (
                  <TableRow
                    key={m.id}
                    className="border-b border-gt-outline-variant hover:bg-gt-surface-container"
                  >
                    <TableCell>
                      <Badge className="gt-badge-blue">F{m.fase}</Badge>
                    </TableCell>
                    <TableCell className="font-medium text-gt-on-surface">{m.nome}</TableCell>
                    <TableCell className="text-gt-on-surface">
                      {m.valor} {m.unidade}
                    </TableCell>
                    <TableCell className="text-sm text-gt-on-surface-variant">{m.meta}</TableCell>
                    <TableCell>
                      <Badge className={statusMetrica(m.status)}>{m.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Training */}
      <Card className="gt-card mb-8">
        <CardHeader className="border-b border-gt-outline-variant">
          <CardTitle className="text-lg font-bold text-gt-on-surface flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-gt-primary-container" />
            Capacitação da Equipe
          </CardTitle>
          <CardDescription className="text-gt-on-surface-variant">
            {treinamentos.filter((t) => t.status === 'concluido').length} de {treinamentos.length}{' '}
            concluídos
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {treinamentos.length === 0 ? (
            <div className="p-8 text-center text-gt-outline">Nenhum treinamento agendado.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-b border-gt-outline-variant">
                  <TableHead className="font-semibold text-gt-on-surface">Funcionário</TableHead>
                  <TableHead className="font-semibold text-gt-on-surface">Papel</TableHead>
                  <TableHead className="font-semibold text-gt-on-surface">Tópico</TableHead>
                  <TableHead className="font-semibold text-gt-on-surface">Data</TableHead>
                  <TableHead className="font-semibold text-gt-on-surface">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {treinamentos.map((t) => (
                  <TableRow
                    key={t.id}
                    className="border-b border-gt-outline-variant hover:bg-gt-surface-container"
                  >
                    <TableCell className="font-medium text-gt-on-surface">
                      {t.funcionario}
                    </TableCell>
                    <TableCell className="capitalize text-gt-on-surface">{t.papel}</TableCell>
                    <TableCell className="text-gt-on-surface-variant">{t.topico}</TableCell>
                    <TableCell className="text-gt-on-surface-variant">
                      {new Date(t.data_treinamento).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusTrein(t.status)}>{t.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Project Status */}
      <Card className="gt-card bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-bold text-gt-on-surface text-lg">Status do Projeto</h3>
              <p className="text-gt-on-surface-variant mt-1">
                Todas as 5 fases implementadas: matrícula sem redigitação, cobrança recorrente com
                conciliação, grade de horários, escalonamento de inadimplência e consolidação.
              </p>
              <p className="text-gt-primary-container mt-2 font-medium">
                <strong>Linha vermelha:</strong> nenhuma renegociação é automática — sempre passa
                pela diretora.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default PainelConsolidacao
