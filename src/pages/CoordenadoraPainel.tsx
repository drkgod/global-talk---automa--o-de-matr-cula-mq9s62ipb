import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Bell, CheckCircle2, Clock, Users, AlertCircle } from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import { useRealtime } from '@/hooks/use-realtime'
import { toast } from 'sonner'

interface Notificacao {
  id: string
  matricula_id: string
  nome_aluno: string
  nivel: string
  curso: string
  horario_pretendido: string
  lida: boolean
  created: string
}

interface Matricula {
  id: string
  nome: string
  cpf: string
  status: string
  nivel: string
  curso_pretendido: string
  horario_pretendido: string
  created: string
}

const CoordenadoraPainel = () => {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([])
  const [matriculas, setMatriculas] = useState<Matricula[]>([])
  const [loading, setLoading] = useState(true)

  const carregarDados = useCallback(async () => {
    try {
      const notifs = await pb.collection('notificacoes_coordenadora').getFullList({
        sort: '-created',
        expand: 'matricula_id',
      })
      setNotificacoes(notifs as unknown as Notificacao[])

      const mats = await pb.collection('matriculas').getFullList({ sort: '-created' })
      setMatriculas(mats as unknown as Matricula[])
    } catch (err) {
      toast.error('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    carregarDados()
  }, [carregarDados])

  // Realtime: atualiza quando nova notificação chega (SPEC-1-006)
  useRealtime('notificacoes_coordenadora', () => {
    carregarDados()
  })

  // Realtime: atualiza quando matrícula muda de status
  useRealtime('matriculas', () => {
    carregarDados()
  })

  const marcarComoLida = async (id: string) => {
    try {
      await pb.collection('notificacoes_coordenadora').update(id, { lida: true })
      setNotificacoes((prev) => prev.map((n) => (n.id === id ? { ...n, lida: true } : n)))
    } catch (err) {
      toast.error('Erro ao marcar notificação')
    }
  }

  const marcarTodasComoLidas = async () => {
    const naoLidas = notificacoes.filter((n) => !n.lida)
    for (const n of naoLidas) {
      try {
        await pb.collection('notificacoes_coordenadora').update(n.id, { lida: true })
      } catch (err) {
        /* ignore */
      }
    }
    setNotificacoes((prev) => prev.map((n) => ({ ...n, lida: true })))
    toast.success('Todas as notificações marcadas como lidas')
  }

  const naoLidas = notificacoes.filter((n) => !n.lida)
  const ativas = matriculas.filter((m) => m.status === 'ativo')
  const pendentes = matriculas.filter((m) => m.status === 'pendente')

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      rascunho: 'bg-gray-100 text-gray-700',
      formulario_concluido: 'bg-blue-100 text-blue-700',
      prova_concluida: 'bg-indigo-100 text-indigo-700',
      pendente: 'bg-amber-100 text-amber-700',
      ativo: 'bg-green-100 text-green-700',
    }
    return map[status] || 'bg-gray-100 text-gray-700'
  }

  const nivelLabel = (n: string) => {
    const map: Record<string, string> = {
      basico: 'Básico',
      intermediario: 'Intermediário',
      avancado: 'Avançado',
    }
    return map[n] || '—'
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <p className="text-gray-500 text-center">Carregando...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Bell className="w-6 h-6 text-blue-600" />
          Painel da Coordenadora
        </h1>
        {naoLidas.length > 0 && (
          <Button variant="outline" size="sm" onClick={marcarTodasComoLidas}>
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Marcar todas como lidas ({naoLidas.length})
          </Button>
        )}
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Não lidas</p>
                <p className="text-2xl font-bold text-amber-600">{naoLidas.length}</p>
              </div>
              <Bell className="w-8 h-8 text-amber-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Matrículas ativas</p>
                <p className="text-2xl font-bold text-green-600">{ativas.length}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pendentes</p>
                <p className="text-2xl font-bold text-orange-600">{pendentes.length}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fila de notificações */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Fila de Notificações</CardTitle>
          <p className="text-sm text-gray-500">
            Novos alunos confirmados — sem depender de WhatsApp.
          </p>
        </CardHeader>
        <CardContent>
          {notificacoes.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Bell className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p>Nenhuma notificação ainda.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notificacoes.map((n) => (
                <div
                  key={n.id}
                  className={`flex items-start justify-between p-3 rounded-lg border transition-colors ${
                    n.lida ? 'bg-white border-gray-200' : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {!n.lida && (
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                    )}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">{n.nome_aluno}</span>
                        {n.nivel && <Badge variant="secondary">{nivelLabel(n.nivel)}</Badge>}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-3">
                        {n.curso && <span>Curso: {n.curso}</span>}
                        {n.horario_pretendido && <span>Horário: {n.horario_pretendido}</span>}
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(n.created).toLocaleString('pt-BR')}
                      </span>
                    </div>
                  </div>
                  {!n.lida && (
                    <Button variant="ghost" size="sm" onClick={() => marcarComoLida(n.id)}>
                      Marcar como lida
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lista de matrículas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Todas as Matrículas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {matriculas.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Users className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p>Nenhuma matrícula registrada ainda.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="py-2 pr-4">Nome</th>
                    <th className="py-2 pr-4">CPF</th>
                    <th className="py-2 pr-4">Nível</th>
                    <th className="py-2 pr-4">Curso</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {matriculas.map((m) => (
                    <tr key={m.id} className="border-b hover:bg-gray-50">
                      <td className="py-2 pr-4 font-medium">{m.nome || '—'}</td>
                      <td className="py-2 pr-4 text-gray-500">{m.cpf || '—'}</td>
                      <td className="py-2 pr-4">{nivelLabel(m.nivel)}</td>
                      <td className="py-2 pr-4">{m.curso_pretendido || '—'}</td>
                      <td className="py-2 pr-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge(m.status)}`}
                        >
                          {m.status}
                        </span>
                      </td>
                      <td className="py-2 text-gray-400 text-xs">
                        {new Date(m.created).toLocaleDateString('pt-BR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default CoordenadoraPainel
