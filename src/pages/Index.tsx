import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  UserPlus,
  Receipt,
  Calendar,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
  Clock,
  CheckCircle2,
  Users,
  GraduationCap,
  DollarSign,
  Bell,
} from 'lucide-react'

const stats = [
  {
    label: 'Matrículas ativas',
    value: '47',
    icon: Users,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    label: 'A receber',
    value: 'R$ 8.410',
    icon: DollarSign,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
  { label: 'Pendentes', value: '3', icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
  {
    label: 'Inadimplentes',
    value: '2',
    icon: AlertTriangle,
    color: 'text-red-600',
    bg: 'bg-red-50',
  },
]

const acoesRapidas = [
  {
    label: 'Nova Matrícula',
    desc: 'Cadastrar aluno',
    icon: UserPlus,
    rota: '/matricula',
    cor: 'bg-blue-600',
  },
  {
    label: 'Financeiro',
    desc: 'Mensalidades e cobranças',
    icon: Receipt,
    rota: '/financeiro',
    cor: 'bg-emerald-600',
  },
  {
    label: 'Grade de Horários',
    desc: 'Alocar professores',
    icon: Calendar,
    rota: '/grade',
    cor: 'bg-violet-600',
  },
  {
    label: 'Inadimplência',
    desc: 'Acompanhar atrasos',
    icon: AlertTriangle,
    rota: '/inadimplencia',
    cor: 'bg-amber-600',
  },
]

const atividadeRecente = [
  {
    aluno: 'Maria Silva',
    ação: 'Matrícula confirmada',
    curso: 'Inglês — 19:00',
    status: 'confirmada',
    tempo: '2min atrás',
  },
  {
    aluno: 'João Santos',
    ação: 'Pagamento recebido',
    curso: 'Espanhol — 14:00',
    status: 'pago',
    tempo: '15min atrás',
  },
  {
    aluno: 'Ana Oliveira',
    ação: 'Prova de nivelamento',
    curso: 'Francês — 10:00',
    status: 'pendente',
    tempo: '1h atrás',
  },
  {
    aluno: 'Carlos Lima',
    ação: 'Atraso 12 dias',
    curso: 'Inglês — 19:00',
    status: 'atrasado',
    tempo: '3h atrás',
  },
  {
    aluno: 'Lucia Ferreira',
    ação: 'Matrícula confirmada',
    curso: 'Alemão — 08:00',
    status: 'confirmada',
    tempo: '5h atrás',
  },
]

const statusColors: Record<string, string> = {
  confirmada: 'gt-badge-green',
  pago: 'gt-badge-green',
  pendente: 'gt-badge-amber',
  atrasado: 'gt-badge-red',
}

const Index = () => (
  <div className="container mx-auto py-8 px-6 max-w-7xl">
    {/* Header */}
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold text-gt-on-surface">Dashboard</h1>
        <p className="text-gt-on-surface-variant mt-1">Visão geral da operação</p>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" className="border-gt-outline-variant">
          <Bell className="w-4 h-4 mr-2" />
          <Badge className="gt-badge-red ml-1">2</Badge>
        </Button>
        <Link to="/matricula">
          <Button size="sm" className="bg-gt-primary-container hover:bg-gt-primary text-white">
            <UserPlus className="w-4 h-4 mr-2" />
            Nova Matrícula
          </Button>
        </Link>
      </div>
    </div>

    {/* Stats Grid */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((s) => (
        <Card key={s.label} className="gt-card">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gt-outline">{s.label}</p>
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              </div>
              <div className={`w-11 h-11 rounded-xl ${s.bg} flex items-center justify-center`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Quick Actions */}
      <div className="lg:col-span-1">
        <Card className="gt-card">
          <CardHeader className="border-b border-gt-outline-variant pb-3">
            <CardTitle className="text-base font-bold text-gt-on-surface">Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            <div className="space-y-2">
              {acoesRapidas.map((a) => (
                <Link key={a.rota} to={a.rota}>
                  <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gt-surface-container transition-colors cursor-pointer group">
                    <div
                      className={`w-10 h-10 rounded-lg ${a.cor} flex items-center justify-center flex-shrink-0`}
                    >
                      <a.icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gt-on-surface group-hover:text-gt-primary-container transition-colors">
                        {a.label}
                      </p>
                      <p className="text-xs text-gt-outline truncate">{a.desc}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gt-outline group-hover:text-gt-primary-container transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="lg:col-span-2">
        <Card className="gt-card">
          <CardHeader className="border-b border-gt-outline-variant pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-bold text-gt-on-surface">
              Atividade Recente
            </CardTitle>
            <Button variant="ghost" size="sm" className="text-gt-primary-container text-xs">
              Ver tudo
              <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gt-outline-variant">
              {atividadeRecente.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-5 py-4 hover:bg-gt-surface-container transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gt-surface-container flex items-center justify-center flex-shrink-0">
                      <GraduationCap className="w-5 h-5 text-gt-outline" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gt-on-surface">{item.aluno}</p>
                      <p className="text-xs text-gt-outline">
                        {item.ação} — {item.curso}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <Badge className={statusColors[item.status]}>{item.status}</Badge>
                    <p className="text-xs text-gt-outline mt-1">{item.tempo}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>

    {/* Coordinator Link */}
    <div className="mt-6">
      <Link to="/coordenadora">
        <Card className="gt-card hover:shadow-card-hover transition-shadow cursor-pointer">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
                <Bell className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <p className="font-bold text-gt-on-surface">Painel da Coordenadora</p>
                <p className="text-sm text-gt-outline">3 notificações não lidas</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-gt-outline" />
          </CardContent>
        </Card>
      </Link>
    </div>
  </div>
)

export default Index
