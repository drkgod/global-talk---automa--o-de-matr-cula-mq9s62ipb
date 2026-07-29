import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  FileText,
  Receipt,
  Calendar,
  TrendingDown,
  Award,
  ArrowRight,
  GraduationCap,
} from 'lucide-react'

const fases = [
  {
    num: 1,
    titulo: 'Matrícula sem redigitação',
    icon: FileText,
    rota: '/matricula',
    cta: 'Iniciar',
    desc: 'Formulário, prova, contrato, pagamento e notificação — sem redigitação.',
    cor: 'bg-blue-600',
  },
  {
    num: 2,
    titulo: 'Cobrança e conciliação',
    icon: Receipt,
    rota: '/financeiro',
    cta: 'Configurar',
    desc: 'Boletos recorrentes, lembretes e conciliação bancária automática.',
    cor: 'bg-emerald-600',
  },
  {
    num: 3,
    titulo: 'Grade de horários',
    icon: Calendar,
    rota: '/grade',
    cta: 'Gerenciar',
    desc: 'Geração semanal da grade com detecção de conflitos de professor.',
    cor: 'bg-violet-600',
  },
  {
    num: 4,
    titulo: 'Escalonamento de inadimplência',
    icon: TrendingDown,
    rota: '/inadimplencia',
    cta: 'Acompanhar',
    desc: 'Escalonamento automático em 4 níveis. Renegociação pela diretora.',
    cor: 'bg-amber-600',
  },
  {
    num: 5,
    titulo: 'Consolidação e encerramento',
    icon: Award,
    rota: '/consolidacao',
    cta: 'Visualizar',
    desc: 'Métricas finais, capacitação da equipe e documentação.',
    cor: 'bg-rose-600',
  },
]

const Index = () => (
  <div className="container mx-auto py-12 px-6 max-w-5xl">
    {/* Hero Section */}
    <div className="text-center mb-12 animate-fade-in-up">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gt-primary-container mb-6 shadow-lg">
        <GraduationCap className="w-8 h-8 text-white" />
      </div>
      <h1 className="text-4xl md:text-5xl font-bold text-gt-on-surface mb-4 tracking-tight">
        Global Talk
      </h1>
      <h2 className="text-2xl md:text-3xl font-semibold text-gt-primary-container mb-4">
        Automação de Matrícula
      </h2>
      <p className="text-lg text-gt-on-surface-variant max-w-2xl mx-auto leading-relaxed">
        Cinco fases implementadas ponta a ponta. Reduzir o tempo de matrícula de 40 para menos de 15
        minutos.
      </p>
    </div>

    {/* Phase Cards */}
    <div className="space-y-4 mb-12">
      {fases.map((f, index) => (
        <Card
          key={f.num}
          className="gt-card animate-fade-in-up"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-5">
                {/* Icon */}
                <div
                  className={`w-14 h-14 rounded-xl ${f.cor} flex items-center justify-center flex-shrink-0 shadow-md`}
                >
                  <f.icon className="w-7 h-7 text-white" />
                </div>

                {/* Content */}
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <Badge className="gt-badge-blue">Fase {f.num}</Badge>
                    <h3 className="text-lg font-bold text-gt-on-surface">{f.titulo}</h3>
                  </div>
                  <p className="text-sm text-gt-on-surface-variant">{f.desc}</p>
                </div>
              </div>

              {/* CTA Button */}
              <Link to={f.rota} className="hidden sm:block">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gt-outline-variant text-gt-primary hover:bg-gt-surface-container"
                >
                  {f.cta}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>

            {/* Mobile CTA */}
            <Link to={f.rota} className="sm:hidden mt-4 block">
              <Button
                variant="outline"
                size="sm"
                className="w-full border-gt-outline-variant text-gt-primary"
              >
                {f.cta}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>

    {/* Bottom Actions */}
    <div
      className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up"
      style={{ animationDelay: '500ms' }}
    >
      <Link to="/matricula">
        <Button
          size="lg"
          className="bg-gt-primary-container hover:bg-gt-primary text-white shadow-lg px-8"
        >
          Iniciar Nova Matrícula
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </Link>
      <Link to="/fases">
        <Button
          size="lg"
          variant="outline"
          className="border-gt-outline-variant text-gt-on-surface px-8"
        >
          Ver Painel de Fases
        </Button>
      </Link>
    </div>
  </div>
)

export default Index
