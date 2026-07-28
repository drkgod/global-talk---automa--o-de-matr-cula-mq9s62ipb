import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  FileText,
  ClipboardCheck,
  Upload,
  FileSignature,
  CreditCard,
  Bell,
  Receipt,
  Calendar,
  TrendingDown,
  Award,
  ArrowRight,
} from 'lucide-react'

const fases = [
  {
    num: 1,
    titulo: 'Matrícula sem redigitação',
    icon: FileText,
    status: 'implementada',
    entregas: [
      { icon: FileText, label: 'Formulário com autosave' },
      { icon: ClipboardCheck, label: 'Prova de nivelamento' },
      { icon: Upload, label: 'Importação sem redigitação' },
      { icon: FileSignature, label: 'Contrato PDF automático' },
      { icon: CreditCard, label: 'Pagamento PIX' },
      { icon: Bell, label: 'Notificação à coordenadora' },
    ],
    rota: '/matricula',
    cta: 'Iniciar Matrícula',
  },
  {
    num: 2,
    titulo: 'Cobrança e conciliação',
    icon: Receipt,
    status: 'implementada',
    entregas: [
      { icon: Receipt, label: 'Boletos recorrentes' },
      { icon: Bell, label: 'Lembrete antes do vencimento' },
      { icon: CreditCard, label: 'Conciliação bancária' },
    ],
    rota: '/financeiro',
    cta: 'Painel Financeiro',
  },
  {
    num: 3,
    titulo: 'Grade de horários',
    icon: Calendar,
    status: 'implementada',
    entregas: [
      { icon: Calendar, label: 'Geração semanal da grade' },
      { icon: Bell, label: 'Detecção de conflitos' },
      { icon: Upload, label: 'Importação de turmas' },
    ],
    rota: '/grade',
    cta: 'Ver Grade',
  },
  {
    num: 4,
    titulo: 'Escalonamento de inadimplência',
    icon: TrendingDown,
    status: 'implementada',
    entregas: [
      { icon: Bell, label: 'Lembrete automático' },
      { icon: TrendingDown, label: 'Escalonamento por dias' },
      { icon: FileText, label: 'Renegociação pela diretora' },
    ],
    rota: '/inadimplencia',
    cta: 'Ver Inadimplência',
  },
  {
    num: 5,
    titulo: 'Consolidação e encerramento',
    icon: Award,
    status: 'implementada',
    entregas: [
      { icon: Award, label: 'Métricas finais' },
      { icon: FileText, label: 'Capacitação da equipe' },
      { icon: FileSignature, label: 'Documentação completa' },
    ],
    rota: '/consolidacao',
    cta: 'Ver Consolidação',
  },
]

const Index = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-3">Global Talk — Automação de Matrícula</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Reduzir o tempo de matrícula de 40 minutos para menos de 15 minutos por aluno, sem
          redigitação de dados. Cinco fases implementadas ponta a ponta.
        </p>
      </div>

      <div className="space-y-6">
        {fases.map((fase) => (
          <Card key={fase.num}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                    <fase.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      Fase {fase.num}: {fase.titulo}
                    </CardTitle>
                    <Badge className="mt-1 bg-green-100 text-green-700">Implementada</Badge>
                  </div>
                </div>
                <Link to={fase.rota}>
                  <Button variant="outline" size="sm">
                    {fase.cta} <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {fase.entregas.map((e, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                    <e.icon className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    {e.label}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
        <Link to="/matricula">
          <Button size="lg">Iniciar Nova Matrícula</Button>
        </Link>
        <Link to="/coordenadora">
          <Button size="lg" variant="outline">
            Painel da Coordenadora
          </Button>
        </Link>
      </div>
    </div>
  )
}

export default Index
