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
    } catch {
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
      if (res.total_conflitos > 0) {
        toast.warning(`${res.total_conflitos} conflito(s)`)
      } else {
        toast.success('Grade gerada!')
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
    <div className="container mx-auto py-8 px-6 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gt-on-surface flex items-center gap-3">
          <Calendar className="w-8 h-8 text-gt-primary-container" />
          Grade de Horários
        </h1>
        <p className="text-gt-on-surface-variant mt-1">
          Gerencie a grade semanal e alocação de professores
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="gt-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gt-outline">Professores</p>
                <p className="text-3xl font-bold text-gt-primary-container">
                  {professores.filter((p) => p.ativo).length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-gt-primary-container" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="gt-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gt-outline">Alocações</p>
                <p className="text-3xl font-bold text-green-600">{alocacoes.length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="gt-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gt-outline">Conflitos</p>
                <p className="text-3xl font-bold text-red-600">{conflitos.length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Generate Grade */}
        <Card className="gt-card">
          <CardHeader className="border-b border-gt-outline-variant">
            <CardTitle className="text-lg font-bold text-gt-on-surface">
              Gerar Grade Semanal
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-5">
            <div>
              <Label htmlFor="semana" className="text-sm font-medium text-gt-on-surface">
                Data de início
              </Label>
              <Input
                id="semana"
                type="date"
                value={semanaInicio}
                onChange={(e) => setSemanaInicio(e.target.value)}
                className="mt-1.5 border-gt-outline-variant focus:ring-gt-primary-container"
              />
            </div>
            <Button
              onClick={gerarGrade}
              disabled={gerando}
              className="w-full bg-gt-primary-container hover:bg-gt-primary text-white"
            >
              {gerando && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Gerar grade
            </Button>
          </CardContent>
        </Card>

        {/* Teachers List */}
        <Card className="gt-card">
          <CardHeader className="border-b border-gt-outline-variant">
            <CardTitle className="text-lg font-bold text-gt-on-surface">Professores</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {professores.length === 0 ? (
              <div className="p-8 text-center text-gt-outline">Nenhum professor.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-gt-outline-variant">
                    <TableHead className="font-semibold text-gt-on-surface">Nome</TableHead>
                    <TableHead className="font-semibold text-gt-on-surface">Idiomas</TableHead>
                    <TableHead className="font-semibold text-gt-on-surface">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {professores.map((p) => (
                    <TableRow
                      key={p.id}
                      className="border-b border-gt-outline-variant hover:bg-gt-surface-container"
                    >
                      <TableCell className="font-medium text-gt-on-surface">{p.nome}</TableCell>
                      <TableCell className="text-gt-on-surface-variant">{p.idiomas}</TableCell>
                      <TableCell>
                        <Badge className={p.ativo ? 'gt-badge-green' : 'bg-gray-100 text-gray-700'}>
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

      {/* Allocations Table */}
      <Card className="gt-card">
        <CardHeader className="border-b border-gt-outline-variant">
          <CardTitle className="text-lg font-bold text-gt-on-surface">Alocações</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {alocacoes.length === 0 ? (
            <div className="p-8 text-center text-gt-outline">
              Nenhuma alocação. Gere a grade acima.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-b border-gt-outline-variant">
                  <TableHead className="font-semibold text-gt-on-surface">Dia</TableHead>
                  <TableHead className="font-semibold text-gt-on-surface">Horário</TableHead>
                  <TableHead className="font-semibold text-gt-on-surface">Professor</TableHead>
                  <TableHead className="font-semibold text-gt-on-surface">Conflito</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alocacoes.map((a) => {
                  const prof = professores.find((p) => p.id === a.professor_id)
                  return (
                    <TableRow
                      key={a.id}
                      className="border-b border-gt-outline-variant hover:bg-gt-surface-container"
                    >
                      <TableCell className="font-medium text-gt-on-surface">
                        {diaLabel(a.dia_semana)}
                      </TableCell>
                      <TableCell className="text-gt-on-surface-variant">
                        {a.horario_inicio} - {a.horario_fim}
                      </TableCell>
                      <TableCell className="text-gt-on-surface">{prof?.nome || '—'}</TableCell>
                      <TableCell>
                        {a.conflito_detectado ? (
                          <Badge className="gt-badge-red">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Conflito
                          </Badge>
                        ) : (
                          <Badge className="gt-badge-green">OK</Badge>
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
