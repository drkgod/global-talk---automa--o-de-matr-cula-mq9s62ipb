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
import { Input, Label } from '@/components/ui/input'
import { toast } from 'sonner'
import { Calendar, Users, AlertTriangle, Loader2 } from 'lucide-react'
import pb from '@/lib/pocketbase/client'

const PainelGrade = () => {
  const [professores, setProfessores] = useState<any[]>([])
  const [alocacoes, setAlocacoes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [semanaInicio, setSemanaInicio] = useState('')
  const [gerando, setGerando] = useState(false)

  const carregar = useCallback(async () => {
    try {
      setProfessores(await pb.collection('professores').getFullList({ sort: 'nome' }))
      setAlocacoes(await pb.collection('alocacao_professores').getFullList({ sort: 'dia_semana' }))
    } catch (_) {
    } finally {
      setLoading(false)
    }
  }, [])
  useEffect(() => {
    carregar()
  }, [carregar])

  const gerarGrade = async () => {
    if (!semanaInicio) {
      toast.error('Informe a data')
      return
    }
    setGerando(true)
    try {
      const res = await pb.send('/backend/v1/grade/gerar', {
        method: 'POST',
        body: { semana_inicio: semanaInicio },
      })
      res.total_conflitos > 0
        ? toast.warning(`${res.total_conflitos} conflito(s)`)
        : toast.success('Grade gerada!')
      carregar()
    } catch (err: any) {
      toast.error(err.response?.erro || err.message)
    } finally {
      setGerando(false)
    }
  }

  const diaLabel = (d: string) =>
    ({
      segunda: 'Seg',
      terca: 'Ter',
      quarta: 'Qua',
      quinta: 'Qui',
      sexta: 'Sex',
      sabado: 'Sáb',
      domingo: 'Dom',
    })[d] || d
  const conflitos = alocacoes.filter((a) => a.conflito_detectado)

  return (
    <div className="container mx-auto py-6 px-4 max-w-5xl">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Calendar className="w-6 h-6 text-blue-600" />
        Grade de Horários
      </h1>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Professores</p>
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
            <p className="text-sm text-gray-500">Alocações</p>
            <p className="text-2xl font-bold text-green-600">{alocacoes.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-500">Conflitos</p>
            <p className="text-2xl font-bold text-red-600">{conflitos.length}</p>
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
              <Label htmlFor="semana">Data de início</Label>
              <Input
                id="semana"
                type="date"
                value={semanaInicio}
                onChange={(e) => setSemanaInicio(e.target.value)}
              />
            </div>
            <Button onClick={gerarGrade} disabled={gerando} className="w-full">
              {gerando && <Loader2 className="w-4 h-4 animate-spin mr-2" />}Gerar grade
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Professores</CardTitle>
          </CardHeader>
          <CardContent>
            {professores.length === 0 ? (
              <p className="text-gray-400 text-center py-4">Nenhum professor.</p>
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
          <CardTitle className="text-lg">Alocações</CardTitle>
        </CardHeader>
        <CardContent>
          {alocacoes.length === 0 ? (
            <p className="text-gray-400 text-center py-4">Nenhuma alocação. Gere a grade acima.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dia</TableHead>
                  <TableHead>Horário</TableHead>
                  <TableHead>Professor</TableHead>
                  <TableHead>Conflito</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alocacoes.map((a) => {
                  const prof = professores.find((p) => p.id === a.professor_id)
                  return (
                    <TableRow key={a.id}>
                      <TableCell>{diaLabel(a.dia_semana)}</TableCell>
                      <TableCell>
                        {a.horario_inicio} - {a.horario_fim}
                      </TableCell>
                      <TableCell>{prof?.nome || '—'}</TableCell>
                      <TableCell>
                        {a.conflito_detectado ? (
                          <Badge className="bg-red-100 text-red-800">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Conflito
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
