import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
  ArrowRight,
  ArrowLeft,
  Wifi,
  WifiOff,
  CheckCircle2,
  Circle,
  FileText,
  GraduationCap,
  Upload,
  FileSignature,
  CreditCard,
  Bell,
} from 'lucide-react'
import pb from '@/lib/pocketbase/client'

const steps = [
  { num: 1, label: 'Formulário', icon: FileText },
  { num: 2, label: 'Prova', icon: GraduationCap },
  { num: 3, label: 'Importação', icon: Upload },
  { num: 4, label: 'Contrato', icon: FileSignature },
  { num: 5, label: 'Pagamento', icon: CreditCard },
  { num: 6, label: 'Notificação', icon: Bell },
]

const MatriculaWizard = () => {
  const [currentStep, setCurrentStep] = useState(1)
  const [offline, setOffline] = useState(false)
  const [saving, setSaving] = useState(false)
  const [provaRespondida, setProvaRespondida] = useState(false)

  const [form, setForm] = useState({
    nome: '',
    cpf: '',
    endereco: '',
    telefone: '',
    curso: 'ingles',
    horario: '19:00',
    nivel: 'basico',
  })

  const [prova, setProva] = useState({
    q1: '',
    q2: '',
    q3: '',
    q4: '',
    q5: '',
  })

  const [respostaAluno, setRespostaAluno] = useState({
    q1: '',
    q2: '',
    q3: '',
    q4: '',
    q5: '',
  })

  const [questoes, setQuestoes] = useState<any[]>([])

  useEffect(() => {
    const saved = localStorage.getItem('matricula_draft')
    if (saved) {
      try {
        setForm(JSON.parse(saved))
      } catch {}
    }
    carregarQuestoes()
  }, [])

  const carregarQuestoes = useCallback(async () => {
    try {
      const qs = await pb.collection('questoes_prova').getFullList({ sort: 'ordem' })
      if (qs.length > 0) {
        setQuestoes(qs)
        const p: any = {}
        qs.forEach((q: any) => {
          p[q.id] = ''
        })
        setProva(p)
        setRespostaAluno({ ...p })
      }
    } catch {
    } finally {
    }
  }, [])

  useEffect(() => {
    if (!offline) {
      localStorage.setItem('matricula_draft', JSON.stringify(form))
    }
  }, [form, offline])

  const updateField = (field: string, value: string) => setForm({ ...form, [field]: value })
  const updateResposta = (field: string, value: string) =>
    setRespostaAluno({ ...respostaAluno, [field]: value })

  const simularOffline = () => {
    setOffline(true)
    toast.info('Modo offline ativado. Dados salvos localmente.')
  }

  const handleAvancar = async () => {
    if (currentStep === 1) {
      if (!form.nome || !form.cpf) {
        toast.error('Preencha nome e CPF')
        return
      }
      setSaving(true)
      await new Promise((r) => setTimeout(r, 500))
      setSaving(false)
      toast.success('Dados salvos localmente')
    }
    if (currentStep === 2 && !provaRespondida) {
      if (questoes.length > 0) {
        const respostas: any = {}
        questoes.forEach((q: any) => {
          respostas[q.id] = respostaAluno[q.id] || ''
        })
        setProva(respostas)
      }
      setProvaRespondida(true)
      toast.success('Prova salva localmente')
    }
    setCurrentStep(Math.min(currentStep + 1, 6))
  }

  const handleVoltar = () => setCurrentStep(Math.max(currentStep - 1, 1))

  return (
    <div className="container mx-auto py-8 px-6 max-w-4xl">
      {/* Progress Stepper */}
      <div className="mb-8">
        <div className="flex items-center justify-between relative">
          {/* Progress Line */}
          <div className="absolute top-5 left-0 right-0 h-1 bg-gt-outline-variant rounded-full mx-12">
            <div
              className="h-full bg-gt-primary-container rounded-full transition-all duration-500"
              style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
            />
          </div>

          {/* Steps */}
          {steps.map((step) => (
            <div key={step.num} className="relative z-10 flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  currentStep > step.num
                    ? 'bg-green-500 text-white'
                    : currentStep === step.num
                      ? 'bg-gt-primary-container text-white shadow-lg scale-110'
                      : 'bg-gt-surface-container text-gt-outline border-2 border-gt-outline-variant'
                }`}
              >
                {currentStep > step.num ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <step.icon className="w-5 h-5" />
                )}
              </div>
              <span
                className={`mt-2 text-xs font-medium ${
                  currentStep === step.num ? 'text-gt-primary-container' : 'text-gt-outline'
                }`}
              >
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <Card className="gt-card">
        <CardHeader className="border-b border-gt-outline-variant">
          <CardTitle className="text-xl font-bold text-gt-on-surface flex items-center gap-3">
            {(() => {
              const Icon = steps[currentStep - 1].icon
              return <Icon className="w-6 h-6 text-gt-primary-container" />
            })()}
            Passo {currentStep}: {steps[currentStep - 1].label}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {/* Step 1: Formulário */}
          {currentStep === 1 && (
            <div className="space-y-5 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <Label htmlFor="nome" className="text-sm font-medium text-gt-on-surface">
                    Nome completo *
                  </Label>
                  <Input
                    id="nome"
                    value={form.nome}
                    onChange={(e) => updateField('nome', e.target.value)}
                    className="mt-1.5 border-gt-outline-variant focus:ring-gt-primary-container"
                    placeholder="Nome do aluno"
                  />
                </div>
                <div>
                  <Label htmlFor="cpf" className="text-sm font-medium text-gt-on-surface">
                    CPF *
                  </Label>
                  <Input
                    id="cpf"
                    value={form.cpf}
                    onChange={(e) => updateField('cpf', e.target.value)}
                    className="mt-1.5 border-gt-outline-variant focus:ring-gt-primary-container"
                    placeholder="000.000.000-00"
                  />
                </div>
                <div>
                  <Label htmlFor="telefone" className="text-sm font-medium text-gt-on-surface">
                    Telefone
                  </Label>
                  <Input
                    id="telefone"
                    value={form.telefone}
                    onChange={(e) => updateField('telefone', e.target.value)}
                    className="mt-1.5 border-gt-outline-variant focus:ring-gt-primary-container"
                    placeholder="(00) 00000-0000"
                  />
                </div>
                <div>
                  <Label htmlFor="endereco" className="text-sm font-medium text-gt-on-surface">
                    Endereço
                  </Label>
                  <Input
                    id="endereco"
                    value={form.endereco}
                    onChange={(e) => updateField('endereco', e.target.value)}
                    className="mt-1.5 border-gt-outline-variant focus:ring-gt-primary-container"
                    placeholder="Rua, número, bairro"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <Label htmlFor="curso" className="text-sm font-medium text-gt-on-surface">
                    Curso pretendido
                  </Label>
                  <select
                    id="curso"
                    value={form.curso}
                    onChange={(e) => updateField('curso', e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-gt-outline-variant bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-gt-primary-container focus:border-gt-primary-container"
                  >
                    <option value="ingles">Inglês</option>
                    <option value="espanhol">Espanhol</option>
                    <option value="frances">Francês</option>
                    <option value="alemao">Alemão</option>
                    <option value="italiano">Italiano</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="horario" className="text-sm font-medium text-gt-on-surface">
                    Horário pretendido
                  </Label>
                  <select
                    id="horario"
                    value={form.horario}
                    onChange={(e) => updateField('horario', e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-gt-outline-variant bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-gt-primary-container focus:border-gt-primary-container"
                  >
                    <option value="08:00">08:00 - 09:30</option>
                    <option value="10:00">10:00 - 11:30</option>
                    <option value="14:00">14:00 - 15:30</option>
                    <option value="19:00">19:00 - 20:30</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Prova de Nivelamento */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-gt-surface-container rounded-lg p-4 border border-gt-outline-variant">
                <p className="text-sm text-gt-on-surface-variant">
                  Responda as perguntas abaixo para definir o nível do aluno. Não se preocupe, isso
                  é apenas uma orientação.
                </p>
              </div>

              {questoes.length > 0 ? (
                questoes.map((q, i) => (
                  <div key={q.id} className="space-y-2">
                    <Label className="text-sm font-medium text-gt-on-surface">
                      {i + 1}. {q.enunciado}
                    </Label>
                    <div className="space-y-2">
                      {q.alternativas?.map((alt: string, j: number) => (
                        <label
                          key={j}
                          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                            respostaAluno[q.id] === alt
                              ? 'border-gt-primary-container bg-blue-50'
                              : 'border-gt-outline-variant hover:bg-gt-surface-container'
                          }`}
                        >
                          <input
                            type="radio"
                            name={q.id}
                            value={alt}
                            checked={respostaAluno[q.id] === alt}
                            onChange={(e) => updateResposta(q.id, e.target.value)}
                            className="w-4 h-4 text-gt-primary-container"
                          />
                          <span className="text-sm">{alt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gt-outline">
                  <p>Carregando questões...</p>
                </div>
              )}
            </div>
          )}

          {/* Steps 3-6: Placeholder */}
          {currentStep >= 3 && (
            <div className="text-center py-12 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-gt-surface-container flex items-center justify-center mx-auto mb-4">
                {(() => {
                  const Icon = steps[currentStep - 1].icon
                  return <Icon className="w-8 h-8 text-gt-primary-container" />
                })()}
              </div>
              <h3 className="text-lg font-semibold text-gt-on-surface mb-2">
                {steps[currentStep - 1].label}
              </h3>
              <p className="text-gt-on-surface-variant max-w-md mx-auto">
                {currentStep === 3 &&
                  'Importação automática de dados do aluno a partir de documentos.'}
                {currentStep === 4 && 'Geração automática do contrato de prestação de serviços.'}
                {currentStep === 5 && 'Pagamento via PIX com confirmação automática.'}
                {currentStep === 6 &&
                  'Notificação para a coordenadora com todos os dados do aluno.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-6">
        <div className="flex gap-3">
          {currentStep > 1 && (
            <Button variant="outline" onClick={handleVoltar} className="border-gt-outline-variant">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          )}
          <Button variant="ghost" onClick={simularOffline} className="text-gt-outline">
            {offline ? <WifiOff className="w-4 h-4 mr-2" /> : <Wifi className="w-4 h-4 mr-2" />}
            {offline ? 'Offline' : 'Simular queda de conexão'}
          </Button>
        </div>

        {currentStep < 6 ? (
          <Button
            onClick={handleAvancar}
            disabled={saving}
            className="bg-gt-primary-container hover:bg-gt-primary text-white"
          >
            {saving ? (
              <span className="flex items-center">
                <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Salvando...
              </span>
            ) : (
              <>
                Avançar para {steps[currentStep].label}
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        ) : (
          <Button className="bg-green-600 hover:bg-green-700 text-white">
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Finalizar Matrícula
          </Button>
        )}
      </div>

      {/* Offline Indicator */}
      {offline && (
        <div className="fixed bottom-4 right-4 bg-amber-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in">
          <WifiOff className="w-4 h-4" />
          <span className="text-sm font-medium">Modo offline — dados salvos localmente</span>
        </div>
      )}
    </div>
  )
}

export default MatriculaWizard
