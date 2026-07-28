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
    } catch (_) {
    } finally {
      setLoading(false)
    }
  }, [])
  useEffect(() => {
    carregar()
  }, [carregar])

  const statusMetrica = (s: string) =>
    ({
      atingido: 'bg-green-100 text-green-800',
      parcial: 'bg-amber-100 text-amber-800',
      nao_atingido: 'bg-red-100 text-red-800',
      em_andamento: 'bg-blue-100 text-blue-800',
    })[s] || 'bg-gray-100'
  const statusTrein = (s: string) =>
    ({
      agendado: 'bg-blue-100 text-blue-800',
      concluido: 'bg-green-100 text-green-800',
      cancelado: 'bg-red-100 text-red-800',
    })[s] || 'bg-gray-100'

  return (
    <div className="container mx-auto py-6 px-4 max-w-5xl">
      <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
        <Award className="w-6 h-6 text-blue-600" />
        Consolidação e Encerramento
      </h1>
      <p className="text-gray-500 mb-6">Medição final, capacitação e documentação.</p>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            Métricas Finais
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-gray-500 text-center py-4">Carregando...</p>
          ) : metricas.length === 0 ? (
            <p className="text-gray-400 text-center py-4">Nenhuma métrica registrada.</p>
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
                      <Badge variant="outline">F{m.fase}</Badge>
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
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-blue-600" />
            Capacitação da Equipe
          </CardTitle>
          <CardDescription>
            {treinamentos.filter((t) => t.status === 'concluido').length} de {treinamentos.length}{' '}
            concluídos
          </CardDescription>
        </CardHeader>
        <CardContent>
          {treinamentos.length === 0 ? (
            <p className="text-gray-400 text-center py-4">Nenhum treinamento agendado.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Funcionário</TableHead>
                  <TableHead>Papel</TableHead>
                  <TableHead>Tópico</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Status</TableHead>
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      <Card className="mt-6 bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-blue-900">Status do Projeto</p>
              <p className="text-sm text-blue-700 mt-1">
                Todas as 5 fases implementadas: matrícula sem redigitação, cobrança recorrente com
                conciliação, grade de horários, escalonamento de inadimplência e consolidação.
              </p>
              <p className="text-sm text-blue-600 mt-2">
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
