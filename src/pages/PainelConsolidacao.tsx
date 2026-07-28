import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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
import { BarChart3, GraduationCap, CheckCircle2, Target, TrendingUp, Award } from 'lucide-react'
import pb from '@/lib/pocketbase/client'

interface Metrica {
  id: string
  nome: string
  valor: number
  unidade: string
  meta: string
  status: string
  fase: string
  observacao: string
}

interface Treinamento {
  id: string
  funcionario: string
  papel: string
  topico: string
  data_treinamento: string
  status: string
  avaliacao: string
}

const PainelConsolidacao = () => {
  const [metricas, setMetricas] = useState<Metrica[]>([])
  const [treinamentos, setTreinamentos] = useState<Treinamento[]>([])
  const [loading, setLoading] = useState(true)

  const carregar = useCallback(async () => {
    try {
      const mets = await pb.collection('metricas').getFullList({ sort: 'fase' })
      setMetricas(mets as unknown as Metrica[])
      const treins = await pb.collection('treinamentos').getFullList({ sort: '-data_treinamento' })
      setTreinamentos(treins as unknown as Treinamento[])
    } catch (err) {
      /* ignore */
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    carregar()
  }, [carregar])

  const statusMetrica = (s: string) => {
    const map: Record<string, string> = {
      atingido: 'bg-green-100 text-green-800',
      parcial: 'bg-amber-100 text-amber-800',
      nao_atingido: 'bg-red-100 text-red-800',
      em_andamento: 'bg-blue-100 text-blue-800',
    }
    return map[s] || 'bg-gray-100'
  }

  const statusTrein = (s: string) => {
    const map: Record<string, string> = {
      agendado: 'bg-blue-100 text-blue-800',
      concluido: 'bg-green-100 text-green-800',
      cancelado: 'bg-red-100 text-red-800',
    }
    return map[s] || 'bg-gray-100'
  }

  const metricasPorFase = (fase: string) => metricas.filter((m) => m.fase === fase)
  const treinsConcluidos = treinamentos.filter((t) => t.status === 'concluido').length

  const fases = [
    { num: '1', nome: 'Matrícula sem redigitação', icon: Target },
    { num: '2', nome: 'Cobrança e conciliação', icon: TrendingUp },
    { num: '3', nome: 'Grade de horários', icon: BarChart3 },
    { num: '4', nome: 'Inadimplência', icon: Award },
    { num: '5', nome: 'Consolidação', icon: GraduationCap },
  ]

  return (
    <div className="container mx-auto py-6 px-4 max-w-5xl">
      <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
        <Award className="w-6 h-6 text-blue-600" />
        Consolidação e Encerramento — Fase 5
      </h1>
      <p className="text-gray-500 mb-6">
        Medição final dos resultados, capacitação da equipe e documentação.
      </p>

      {/* Resumo de métricas por fase */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {fases.map((f) => {
          const ms = metricasPorFase(f.num)
          const atingidas = ms.filter((m) => m.status === 'atingido').length
          return (
            <Card key={f.num}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <f.icon className="w-5 h-5 text-blue-600" />
                  <CardTitle className="text-sm">
                    Fase {f.num}: {f.nome}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-blue-600">
                  {atingidas}/{ms.length || '—'}
                </p>
                <p className="text-xs text-gray-500">métricas atingidas</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Métricas detalhadas */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            Métricas Finais do Projeto
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-gray-500 text-center py-4">Carregando...</p>
          ) : metricas.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 mb-2">Nenhuma métrica registrada ainda.</p>
              <p className="text-sm text-gray-300">
                As métricas serão preenchidas ao final do projeto.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fase</TableHead>
                  <TableHead>Métrica</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Meta</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {metricas.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>
                      <Badge variant="outline">Fase {m.fase}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{m.nome}</TableCell>
                    <TableCell>
                      {m.valor} {m.unidade}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">{m.meta}</TableCell>
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

      {/* Treinamentos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-blue-600" />
            Capacitação da Equipe
          </CardTitle>
          <CardDescription>
            {treinsConcluidos} de {treinamentos.length} treinamentos concluídos
          </CardDescription>
        </CardHeader>
        <CardContent>
          {treinamentos.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 mb-2">Nenhum treinamento agendado.</p>
              <p className="text-sm text-gray-300">
                Os treinamentos serão registrados conforme a equipe for capacitada.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Funcionário</TableHead>
                  <TableHead>Papel</TableHead>
                  <TableHead>Tópico</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Avaliação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {treinamentos.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{t.funcionario}</TableCell>
                    <TableCell className="capitalize">{t.papel}</TableCell>
                    <TableCell>{t.topico}</TableCell>
                    <TableCell>
                      {new Date(t.data_treinamento).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusTrein(t.status)}>{t.status}</Badge>
                    </TableCell>
                    <TableCell className="capitalize">{t.avaliacao || '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Resumo final */}
      <Card className="mt-6 bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-blue-900">Status do Projeto</p>
              <p className="text-sm text-blue-700 mt-1">
                Todas as 5 fases implementadas: matrícula sem redigitação, cobrança recorrente com
                conciliação, grade de horários com detecção de conflitos, escalonamento automático
                de inadimplência e consolidação com métricas e capacitação.
              </p>
              <p className="text-sm text-blue-600 mt-2">
                <strong>Linha vermelha respeitada:</strong> nenhuma renegociação de inadimplência é
                automática — sempre passa pela diretora.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default PainelConsolidacao
