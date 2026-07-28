import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText, Receipt, Calendar, TrendingDown, Award, ArrowRight } from 'lucide-react'

const fases = [
  {
    num: 1,
    titulo: 'Matrícula sem redigitação',
    icon: FileText,
    rota: '/matricula',
    cta: 'Iniciar Matrícula',
    desc: 'Formulário, prova, contrato, pagamento e notificação — sem redigitação.',
  },
  {
    num: 2,
    titulo: 'Cobrança e conciliação',
    icon: Receipt,
    rota: '/financeiro',
    cta: 'Painel Financeiro',
    desc: 'Boletos recorrentes, lembretes e conciliação bancária automática.',
  },
  {
    num: 3,
    titulo: 'Grade de horários',
    icon: Calendar,
    rota: '/grade',
    cta: 'Ver Grade',
    desc: 'Geração semanal da grade com detecção de conflitos de professor.',
  },
  {
    num: 4,
    titulo: 'Escalonamento de inadimplência',
    icon: TrendingDown,
    rota: '/inadimplencia',
    cta: 'Ver Inadimplência',
    desc: 'Escalonamento automático em 4 níveis. Renegociação pela diretora.',
  },
  {
    num: 5,
    titulo: 'Consolidação e encerramento',
    icon: Award,
    rota: '/consolidacao',
    cta: 'Ver Consolidação',
    desc: 'Métricas finais, capacitação da equipe e documentação.',
  },
]

const Index = () => (
  <div className="container mx-auto py-8 px-4">
    <div className="text-center mb-10">
      <h1 className="text-3xl font-bold mb-3">Global Talk — Automação de Matrícula</h1>
      <p className="text-gray-600 max-w-2xl mx-auto">
        Cinco fases implementadas ponta a ponta. Reduzir o tempo de matrícula de 40 para menos de 15
        minutos.
      </p>
    </div>
    <div className="space-y-4">
      {fases.map((f) => (
        <Card key={f.num}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
                  <f.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-blue-100 text-blue-700">Fase {f.num}</Badge>
                    <h2 className="text-lg font-bold">{f.titulo}</h2>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{f.desc}</p>
                </div>
              </div>
              <Link to={f.rota}>
                <Button variant="outline" size="sm" className="hidden sm:flex">
                  {f.cta} <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
            <Link to={f.rota} className="sm:hidden mt-3 block">
              <Button variant="outline" size="sm" className="w-full">
                {f.cta} <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
    <div className="mt-8 flex gap-3 justify-center">
      <Link to="/matricula">
        <Button size="lg">Iniciar Nova Matrícula</Button>
      </Link>
      <Link to="/fases">
        <Button size="lg" variant="outline">
          Ver Painel de Fases
        </Button>
      </Link>
    </div>
  </div>
)

export default Index
