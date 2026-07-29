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
import { toast } from 'sonner'
import { Bell, CheckCircle2, Clock, Users, Mail, Eye } from 'lucide-react'
import pb from '@/lib/pocketbase/client'

const CoordenadoraPainel = () => {
  const [notificacoes, setNotificacoes] = useState<any[]>([])
  const [matriculas, setMatriculas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const carregar = useCallback(async () => {
    try {
      const n = await pb.collection('notificacoes_coordenadora').getFullList({ sort: '-created' })
      setNotificacoes(n)
      const m = await pb.collection('matriculas').getFullList({ sort: '-created' })
      setMatriculas(m)
    } catch {
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    carregar()
  }, [carregar])

  const marcarLida = async (id: string) => {
    try {
      await pb.collection('notificacoes_coordenadora').update(id, { lida: true })
      toast.success('Notificação marcada como lida')
      carregar()
    } catch {
      toast.error('Erro ao atualizar')
    }
  }

  const marcarTodasLidas = async () => {
    const naoLidas = notificacoes.filter((n) => !n.lida)
    for (const n of naoLidas) {
      await pb.collection('notificacoes_coordenadora').update(n.id, { lida: true })
    }
    toast.success(`${naoLidas.length} notificações marcadas como lidas`)
    carregar()
  }

  const naoLidas = notificacoes.filter((n) => !n.lida)
  const matriculasAtivas = matriculas.filter((m) => m.status === 'ativo')
  const pendentes = matriculas.filter((m) => m.status === 'pendente' || m.status === 'em_andamento')

  return (
    <div className="container mx-auto py-8 px-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gt-on-surface flex items-center gap-3">
            <Bell className="w-8 h-8 text-gt-primary-container" />
            Painel da Coordenadora
          </h1>
          <p className="text-gt-on-surface-variant mt-1">
            Gerencie notificações e acompanhe as matrículas
          </p>
        </div>
        {naoLidas.length > 0 && (
          <Button
            onClick={marcarTodasLidas}
            variant="outline"
            className="border-gt-outline-variant"
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Marcar todas como lidas
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="gt-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gt-outline">Não lidas</p>
                <p className="text-3xl font-bold text-amber-600">{naoLidas.length}</p>
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
                <p className="text-sm font-medium text-gt-outline">Matrículas ativas</p>
                <p className="text-3xl font-bold text-green-600">{matriculasAtivas.length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="gt-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gt-outline">Pendentes</p>
                <p className="text-3xl font-bold text-orange-600">{pendentes.length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notifications */}
      <Card className="gt-card mb-8">
        <CardHeader className="border-b border-gt-outline-variant">
          <CardTitle className="text-lg font-bold text-gt-on-surface">
            Fila de Notificações
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-gt-outline">Carregando...</div>
          ) : notificacoes.length === 0 ? (
            <div className="p-8 text-center text-gt-outline">Nenhuma notificação</div>
          ) : (
            <div className="divide-y divide-gt-outline-variant">
              {notificacoes.slice(0, 5).map((n) => (
                <div
                  key={n.id}
                  className={`p-4 flex items-center justify-between ${!n.lida ? 'bg-blue-50' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    {!n.lida && <div className="w-2 h-2 rounded-full bg-gt-primary-container" />}
                    <div>
                      <p className="font-medium text-gt-on-surface">{n.aluno_nome || 'Aluno'}</p>
                      <p className="text-sm text-gt-on-surface-variant">{n.mensagem || n.tipo}</p>
                    </div>
                  </div>
                  {!n.lida && (
                    <Button size="sm" variant="ghost" onClick={() => marcarLida(n.id)}>
                      <Eye className="w-4 h-4 mr-1" />
                      Lida
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enrollments Table */}
      <Card className="gt-card">
        <CardHeader className="border-b border-gt-outline-variant">
          <CardTitle className="text-lg font-bold text-gt-on-surface">
            Todas as Matrículas
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {matriculas.length === 0 ? (
            <div className="p-8 text-center text-gt-outline">Nenhuma matrícula encontrada</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-b border-gt-outline-variant">
                  <TableHead className="font-semibold text-gt-on-surface">Nome</TableHead>
                  <TableHead className="font-semibold text-gt-on-surface">CPF</TableHead>
                  <TableHead className="font-semibold text-gt-on-surface">Nível</TableHead>
                  <TableHead className="font-semibold text-gt-on-surface">Curso</TableHead>
                  <TableHead className="font-semibold text-gt-on-surface">Status</TableHead>
                  <TableHead className="font-semibold text-gt-on-surface">Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {matriculas.map((m) => (
                  <TableRow
                    key={m.id}
                    className="border-b border-gt-outline-variant hover:bg-gt-surface-container"
                  >
                    <TableCell className="font-medium text-gt-on-surface">{m.nome_aluno}</TableCell>
                    <TableCell className="text-gt-on-surface-variant">{m.cpf}</TableCell>
                    <TableCell>
                      <Badge className="gt-badge-blue">{m.nivel || '—'}</Badge>
                    </TableCell>
                    <TableCell className="text-gt-on-surface-variant">{m.curso}</TableCell>
                    <TableCell>
                      <Badge className={m.status === 'ativo' ? 'gt-badge-green' : 'gt-badge-amber'}>
                        {m.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gt-outline">
                      {new Date(m.created).toLocaleDateString('pt-BR')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default CoordenadoraPainel
