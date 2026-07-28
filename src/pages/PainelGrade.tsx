import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Calendar, Users, AlertTriangle, Loader2, CheckCircle2 } from 'lucide-react'
import pb from '@/lib/pocketbase/client'

interface Professor {
  id: string
  nome: string
  idiomas: string
  ativo: boolean
}

interface Alocacao {
  id: string
  grade_id: string
  turma_id: string
  professor_id: string
  dia_semana: string
  horario_inicio: string
  horario_fim: string
  conflito_detectado: boolean
}

interface Turma {
  id: string
  curso: string
  nivel: string
  horario: string
  vagas_disponiveis: number
}

const PainelGrade = () => {
  const [professores, setProfessores] = useState<Professor[]>([])
  const [alocacoes, setAlocacoes] = useState<Alocacao[]>([])
  const [turmas, setTurmas] = useState<Turma[]>([])
  const [loading, setLoading] = useState(true)
  const [semanaInicio, setSemanaInicio] = useState('')
  const [gerando, setGerando] = useState(false)

  const carregar = useCallback(async () => {
    try {
      const profs = await pb.collection('professores').getFullList({ sort: 'nome' })
      setProfessores(profs as unknown as Professor[])
      const alcs = await pb.collection('alocacao_professores').getFullList({ sort: 'dia_semana' })
      setAlocacoes(alcs as unknown as Alocacao[])
      const turs = await pb.collection('turmas').getFullList({ sort: 'curso' })
      setTurmas(turs as unknown as Turma[])
    } catch (err) {
      /* ignore */
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    carregar()
  }, [carregar])

  const gerarGrade = async () => {
    if (!semanaInicio) {
      toast.error('Informe a data de início da semana')
      return
    }
    setGerando(true)
    try {
      const res = await pb.send('/backend/v1/grade/gerar', {
        method: 'POST',
        body: { semana_inicio: semanaInicio, criada_por: 'coordenadora' },
      })
      if (res.total_conflitos > 0) {
        toast.warning(`Grade gerada com ${res.total_conflitos} conflito(s)`)
      } else {
        toast.success('Grade gerada sem conflitos!')
      }
      carregar()
    } catch (err: any) {
      toast.error(err.response?.erro || err.message)
    } finally {
      setGerando(false)
    }
  }

  const diaLabel = (d: string) =>
    ({
      segunda: 'Segunda',
      terca: 'Terça',
      quarta: 'Quarta',
      quinta: 'Quinta',
      sexta: 'Sexta',
      sabado: 'Sábado',
      domingo: 'Domingo',
    })[d] || d

  const conflitos = alocacoes.filter((a) => a.conflito_detectado)

  return (
    <div className="container mx-auto py-6 px-4 max-w-5xl">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Calendar className="w-6 h-6 text-blue-600" />
        Grade de Horários — Fase 3
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Professores ativos</p>
                <p className="text-2xl font-bold text-blue-600">
                  {professores.filter((p) => p.ativo).length}
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Alocações</p>
                <p className="text-2xl font-bold text-green-600">{alocacoes.length}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Conflitos</p>
                <p className="text-2xl font-bold text-red-600">{conflitos.length}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Gerar Grade Semanal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="semana">Data de início da semana</Label>
              <Input
                id="semana"
                type="date"
                value={semanaInicio}
                onChange={(e) => setSemanaInicio(e.target.value)}
              />
            </div>
            <div className="bg-blue-50 rounded-lg p-4 text-sm text-gray-600">
              <p className="font-medium mb-1">O que o sistema faz:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Cria nova grade para a semana (rascunho)</li>
                <li>Aloca professores automaticamente por idioma</li>
                <li>Detecta conflitos de horário</li>
                <li>Permite publicar após revisão</li>
              </ul>
            </div>
            <Button onClick={gerarGrade} disabled={gerando} className="w-full">
              {gerando ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Gerar grade
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Professores</CardTitle>
          </CardHeader>
          <CardContent>
            {professores.length === 0 ? (
              <p className="text-gray-400 text-center py-4">Nenhum professor cadastrado.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Idiomas</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {professores.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.nome}</TableCell>
                      <TableCell>{p.idiomas}</TableCell>
                      <TableCell>
                        <Badge className={p.ativo ? 'bg-green-100 text-green-800' : 'bg-gray-100'}>
                          {p.ativo ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Alocações da Grade</CardTitle>
        </CardHeader>
        <CardContent>
          {alocacoes.length === 0 ? (
            <p className="text-gray-400 text-center py-4">
              Nenhuma alocação gerada. Use "Gerar grade" acima.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dia</TableHead>
                  <TableHead>Horário</TableHead>
                  <TableHead>Professor</TableHead>
                  <TableHead>Turma</TableHead>
                  <TableHead>Conflito</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alocacoes.map((a) => {
                  const prof = professores.find((p) => p.id === a.professor_id)
                  const turma = turmas.find((t) => t.id === a.turma_id)
                  return (
                    <TableRow key={a.id}>
                      <TableCell>{diaLabel(a.dia_semana)}</TableCell>
                      <TableCell>
                        {a.horario_inicio} - {a.horario_fim}
                      </TableCell>
                      <TableCell>{prof?.nome || '—'}</TableCell>
                      <TableCell>
                        {turma?.curso || '—'} ({turma?.nivel})
                      </TableCell>
                      <TableCell>
                        {a.conflito_detectado ? (
                          <Badge className="bg-red-100 text-red-800">
                            <AlertTriangle className="w-3 h-3 mr-1" /> Conflito
                          </Badge>
                        ) : (
                          <Badge className="bg-green-100 text-green-800">OK</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default PainelGrade
