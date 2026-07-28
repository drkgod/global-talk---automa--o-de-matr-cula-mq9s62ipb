import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { FileText, ClipboardCheck, Upload, FileSignature, CreditCard, Bell } from 'lucide-react'

const steps = [
  {
    icon: FileText,
    title: '1. Formulário',
    desc: 'Captura nome, CPF, endereço, telefone, curso e horário — uma única vez, com autosave.',
  },
  {
    icon: ClipboardCheck,
    title: '2. Prova de Nivelamento',
    desc: 'Prova objetiva corrigida automaticamente. Define nível e direciona para turma.',
  },
  {
    icon: Upload,
    title: '3. Importação',
    desc: 'Pacote gerado e subido em 1 ação. Sem redigitação. Deduplicação por CPF.',
  },
  {
    icon: FileSignature,
    title: '4. Contrato PDF',
    desc: 'Gerado automaticamente a partir dos dados do formulário. Sem edição manual.',
  },
  {
    icon: CreditCard,
    title: '5. Pagamento PIX',
    desc: 'Identificação automática por valor + nome. Ativação automática da matrícula.',
  },
  {
    icon: Bell,
    title: '6. Notificação',
    desc: 'Coordenadora recebe aviso estruturado no sistema. Sem WhatsApp.',
  },
]

const Index = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-3">Global Talk — Automação de Matrícula</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Reduzir o tempo de matrícula de 40 minutos para menos de 15 minutos por aluno, sem
          redigitação de dados.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {steps.map((step) => (
          <Card key={step.title}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <step.icon className="w-6 h-6 text-blue-600" />
                <CardTitle className="text-base">{step.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>{step.desc}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link to="/matricula">
          <Button size="lg" className="w-full sm:w-auto">
            Iniciar Nova Matrícula
          </Button>
        </Link>
        <Link to="/coordenadora">
          <Button size="lg" variant="outline" className="w-full sm:w-auto">
            Painel da Coordenadora
          </Button>
        </Link>
      </div>
    </div>
  )
}

export default Index
