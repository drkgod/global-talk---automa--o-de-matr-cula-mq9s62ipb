import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import {
  ArrowRight,
  ArrowLeft,
  Wifi,
  WifiOff,
  CheckCircle2,
  FileText,
  GraduationCap,
  Upload,
  FileSignature,
  CreditCard,
  Bell,
  Loader2,
  Download,
  AlertTriangle,
  Info,
} from 'lucide-react'
import pb from '@/lib/pocketbase/client'

const steps = [
  { num: 1, label: 'Formulário', icon: FileText },
  { num: 2, label: 'Prova', icon: GraduationCap },
  { num: 3, label: 'Importação', icon: Upload },
  { num: 4, label: 'Contrato', icon: FileSignature },
  { num: 5, label: 'Pagamento', icon: CreditCard },
  { num: 6, label: 'Confirmação', icon: Bell },
]

interface ProvaResult {
  acertos: number
  total: number
  nivel: string
  turma?: { id: string; curso: string; horario: string; nivel: string }
  horario_alternativo?: boolean
  pendente?: boolean
  mensagem?: string
}

interface PagamentoResult {
  pagamento_id: string
  status: string
  ativada: boolean
  divergencia_nome: boolean
  nota_divergencia: string
  mensagem: string
}

const MatriculaWizard = () => {
  const [currentStep, setCurrentStep] = useState(1)
  const [offline, setOffline] = useState(false)
  const [loading, setLoading] = useState(false)
  const [matriculaId, setMatriculaId] = useState('')

  const [form, setForm] = useState({
    nome: '',
    cpf: '',
    endereco: '',
    telefone: '',
    curso_pretendido: 'ingles',
    horario_pretendido: '19:00',
  })

  const [questoes, setQuestoes] = useState<any[]>([])
  const [respostas, setRespostas] = useState<Record<string, string>>({})
  const [provaResult, setProvaResult] = useState<ProvaResult | null>(null)

  const [pacoteId, setPacoteId] = useState('')
  const [pacoteDados, setPacoteDados] = useState<any>(null)
  const [uploadStatus, setUploadStatus] = useState('')

  const [contratoConteudo, setContratoConteudo] = useState('')
  const [contratoId, setContratoId] = useState('')

  const [valorPago, setValorPago] = useState('290')
  const [nomePagador, setNomePagador] = useState('')
  const [pagamentoResult, setPagamentoResult] = useState<PagamentoResult | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem('matricula_draft')
    if (saved) {
      try {
        setForm(JSON.parse(saved))
      } catch {
        /* ok */
      }
    }
  }, [])

  useEffect(() => {
    if (!offline && form.nome) {
      localStorage.setItem('matricula_draft', JSON.stringify(form))
    }
  }, [form, offline])

  const carregarQuestoes = useCallback(async () => {
    if (questoes.length > 0) {
      return
    }
    try {
      const qs = await pb.collection('questoes_prova').getFullList({ sort: 'ordem' })
      setQuestoes(qs)
    } catch {
      /* ok */
    }
  }, [questoes.length])

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const updateResposta = (questaoId: string, value: string) => {
    setRespostas((prev) => ({ ...prev, [questaoId]: value }))
  }

  const simularOffline = () => {
    setOffline(!offline)
    if (!offline) {
      toast.info('Modo offline ativado. Dados salvos localmente.')
    } else {
      toast.success('Conexão restaurada.')
    }
  }

  const avancarFormulario = async () => {
    if (!form.nome || !form.cpf) {
      toast.error('Preencha pelo menos nome e CPF')
      return
    }
    setLoading(true)
    try {
      let record
      if (matriculaId) {
        record = await pb.collection('matriculas').update(matriculaId, {
          ...form,
          status: 'formulario_concluido',
          valor_matricula: 290,
        })
      } else {
        record = await pb.collection('matriculas').create({
          ...form,
          status: 'formulario_concluido',
          valor_matricula: 290,
        })
      }
      setMatriculaId(record.id)
      localStorage.removeItem('matricula_draft')
      toast.success('Dados salvos!')
      setCurrentStep(2)
      carregarQuestoes()
    } catch (err: any) {
      toast.error(err.message || 'Erro ao salvar')
    } finally {
      setLoading(false)
    }
  }

  const avancarProva = async () => {
    const todasRespondidas = questoes.every((q) => respostas[q.id])
    if (!todasRespondidas) {
      toast.error('Responda todas as questões antes de avançar')
      return
    }
    setLoading(true)
    try {
      for (const q of questoes) {
        await pb.collection('prova_respostas').create({
          matricula_id: matriculaId,
          questao_id: q.id,
          resposta: respostas[q.id],
        })
      }
      const result = await pb.send('/backend/v1/prova/corrigir', {
        method: 'POST',
        body: { matricula_id: matriculaId },
      })
      setProvaResult(result)
      if (result.pendente) {
        toast.warning('Nenhuma turma compatível. Aluno pendente.')
      } else if (result.horario_alternativo) {
        toast.info('Turma encontrada em horário alternativo.')
      } else {
        toast.success(`Nível: ${result.nivel} — turma encontrada!`)
      }
      setCurrentStep(3)
    } catch (err: any) {
      toast.error(err.response?.erro || err.message || 'Erro na correção')
    } finally {
      setLoading(false)
    }
  }

  const processarImportacao = async (simularIndisponivel = false) => {
    setLoading(true)
    try {
      const gerarRes = await pb.send('/backend/v1/importacao/gerar', {
        method: 'POST',
        body: { matricula_id: matriculaId },
      })
      setPacoteId(gerarRes.pacote_id)
      setPacoteDados(gerarRes.dados)
      toast.success('Pacote de importação gerado!')

      const uploadRes = await pb.send('/backend/v1/importacao/upload', {
        method: 'POST',
        body: {
          pacote_id: gerarRes.pacote_id,
          simular_indisponivel: simularIndisponivel,
        },
      })
      setUploadStatus('confirmado')
      toast.success('Aluno cadastrado no sistema!')
      setCurrentStep(4)
    } catch (err: any) {
      if (err.status === 503) {
        setUploadStatus('retido')
        toast.warning('Sistema indisponível. Pacote retido para reintento.')
      } else if (err.status === 409) {
        toast.error('Duplicidade detectada: CPF já cadastrado.')
      } else {
        toast.error(err.response?.erro || err.message || 'Erro na importação')
      }
    } finally {
      setLoading(false)
    }
  }

  const gerarContrato = async () => {
    setLoading(true)
    try {
      const res = await pb.send('/backend/v1/contrato/gerar', {
        method: 'POST',
        body: { matricula_id: matriculaId },
      })
      setContratoConteudo(res.conteudo)
      setContratoId(res.contrato_id)
      toast.success('Contrato gerado!')
      setCurrentStep(5)
    } catch (err: any) {
      const campos = err.response?.campos_faltantes
      if (campos) {
        toast.error(`Geração bloqueada. Campos faltantes: ${campos.join(', ')}`)
      } else {
        toast.error(err.response?.erro || err.message || 'Erro ao gerar contrato')
      }
    } finally {
      setLoading(false)
    }
  }

  const confirmarPagamento = async () => {
    if (!valorPago || !nomePagador) {
      toast.error('Preencha valor e nome do pagador')
      return
    }
    setLoading(true)
    try {
      const res = await pb.send('/backend/v1/pagamento/confirmar', {
        method: 'POST',
        body: {
          matricula_id: matriculaId,
          valor_pago: parseFloat(valorPago),
          nome_pagador: nomePagador,
          data_pagamento: new Date().toISOString(),
        },
      })
      setPagamentoResult(res)
      if (res.ativada) {
        if (res.divergencia_nome) {
          toast.warning('Pagamento confirmado com nota de divergência de nome.')
        } else {
          toast.success('Matrícula ativada!')
        }
        setCurrentStep(6)
      } else {
        toast.error('Pagamento parcial. Matrícula não ativada.')
      }
    } catch (err: any) {
      toast.error(err.response?.erro || err.message || 'Erro no pagamento')
    } finally {
      setLoading(false)
    }
  }

  const baixarContrato = () => {
    const blob = new Blob([contratoConteudo], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `contrato-${form.nome || 'aluno'}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const nivelLabel = (n: string) =>
    ({
      basico: 'Básico',
      intermediario: 'Intermediário',
      avancado: 'Avançado',
    })[n] || n

  // Helper to get alternative options from a question
  const getAlternativas = (q: any) => {
    const opts: { key: string; label: string }[] = []
    if (q.opcao_a) opts.push({ key: 'a', label: q.opcao_a })
    if (q.opcao_b) opts.push({ key: 'b', label: q.opcao_b })
    if (q.opcao_c) opts.push({ key: 'c', label: q.opcao_c })
    if (q.opcao_d) opts.push({ key: 'd', label: q.opcao_d })
    return opts
  }

  return (
    <div className="container mx-auto py-8 px-6 max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-5 left-0 right-0 h-1 bg-gt-outline-variant rounded-full mx-12">
            <div
              className="h-full bg-gt-primary-container rounded-full transition-all duration-500"
              style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
            />
          </div>
          {steps.map((step) => (
            <div key={step.num} className="relative z-10 flex flex-col items-center">
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300',
                  currentStep > step.num
                    ? 'bg-green-500 text-white'
                    : currentStep === step.num
                      ? 'bg-gt-primary-container text-white shadow-lg scale-110'
                      : 'bg-gt-surface-container text-gt-outline border-2 border-gt-outline-variant',
                )}
              >
                {currentStep > step.num ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <step.icon className="w-5 h-5" />
                )}
              </div>
              <span
                className={`mt-2 text-xs font-medium ${currentStep === step.num ? 'text-gt-primary-container' : 'text-gt-outline'}`}
              >
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>

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
          {currentStep === 1 && (
            <div className="space-y-5 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <Label className="text-sm font-medium text-gt-on-surface">Nome completo *</Label>
                  <Input
                    value={form.nome}
                    onChange={(e) => updateField('nome', e.target.value)}
                    className="mt-1.5"
                    placeholder="Nome do aluno"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gt-on-surface">CPF *</Label>
                  <Input
                    value={form.cpf}
                    onChange={(e) => updateField('cpf', e.target.value)}
                    className="mt-1.5"
                    placeholder="000.000.000-00"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gt-on-surface">Telefone</Label>
                  <Input
                    value={form.telefone}
                    onChange={(e) => updateField('telefone', e.target.value)}
                    className="mt-1.5"
                    placeholder="(00) 00000-0000"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gt-on-surface">Endereço</Label>
                  <Input
                    value={form.endereco}
                    onChange={(e) => updateField('endereco', e.target.value)}
                    className="mt-1.5"
                    placeholder="Rua, número, bairro"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gt-on-surface">Curso pretendido</Label>
                  <select
                    value={form.curso_pretendido}
                    onChange={(e) => updateField('curso_pretendido', e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-gt-outline-variant bg-white px-3 py-2 text-sm"
                  >
                    <option value="ingles">Inglês</option>
                    <option value="espanhol">Espanhol</option>
                    <option value="frances">Francês</option>
                    <option value="alemao">Alemão</option>
                    <option value="italiano">Italiano</option>
                  </select>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gt-on-surface">
                    Horário pretendido
                  </Label>
                  <select
                    value={form.horario_pretendido}
                    onChange={(e) => updateField('horario_pretendido', e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-gt-outline-variant bg-white px-3 py-2 text-sm"
                  >
                    <option value="08:00">08:00 - 09:30</option>
                    <option value="10:00">10:00 - 11:30</option>
                    <option value="14:00">14:00 - 15:30</option>
                    <option value="19:00">19:00 - 20:30</option>
                  </select>
                </div>
              </div>
              {offline && (
                <div className="flex items-center gap-2 text-amber-600 text-sm bg-amber-50 p-3 rounded-lg">
                  <WifiOff className="w-4 h-4" /> Modo offline — dados sendo salvos localmente
                </div>
              )}
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6 animate-fade-in">
              {provaResult ? (
                <div className="text-center py-6">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gt-on-surface">Prova corrigida!</h3>
                  <p className="text-gt-on-surface-variant mt-2">
                    Acertos: {provaResult.acertos} de {provaResult.total}
                  </p>
                  <div className="flex justify-center gap-4 mt-4">
                    <Badge className="gt-badge-blue text-sm px-4 py-2">
                      Nível: {nivelLabel(provaResult.nivel)}
                    </Badge>
                    {provaResult.turma && (
                      <Badge className="gt-badge-green text-sm px-4 py-2">
                        Turma: {provaResult.turma.curso} — {provaResult.turma.horario}
                      </Badge>
                    )}
                  </div>
                  {provaResult.horario_alternativo && (
                    <div className="mt-4 flex items-center gap-2 text-amber-600 text-sm justify-center">
                      <Info className="w-4 h-4" /> Horário alternativo oferecido
                    </div>
                  )}
                  {provaResult.pendente && (
                    <div className="mt-4 flex items-center gap-2 text-orange-600 text-sm justify-center">
                      <AlertTriangle className="w-4 h-4" /> {provaResult.mensagem}
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div className="bg-gt-surface-container rounded-lg p-4 text-sm text-gt-on-surface-variant">
                    Responda as questões abaixo. A correção é automática.
                  </div>
                  {questoes.length === 0 ? (
                    <div className="text-center py-8 text-gt-outline">Carregando questões...</div>
                  ) : (
                    questoes.map((q, i) => {
                      const alternativas = getAlternativas(q)
                      return (
                        <div key={q.id} className="space-y-2">
                          <Label className="text-sm font-medium text-gt-on-surface">
                            {i + 1}. {q.enunciado}
                          </Label>
                          <div className="space-y-2">
                            {alternativas.map((alt) => (
                              <label
                                key={alt.key}
                                className={cn(
                                  'flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all',
                                  respostas[q.id] === alt.key
                                    ? 'border-gt-primary-container bg-blue-50'
                                    : 'border-gt-outline-variant hover:bg-gt-surface-container',
                                )}
                              >
                                <input
                                  type="radio"
                                  name={q.id}
                                  value={alt.key}
                                  checked={respostas[q.id] === alt.key}
                                  onChange={(e) => updateResposta(q.id, e.target.value)}
                                  className="w-4 h-4"
                                />
                                <span className="text-sm">
                                  {alt.key.toUpperCase()}) {alt.label}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )
                    })
                  )}
                </>
              )}
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-5 animate-fade-in">
              {pacoteDados && uploadStatus === 'confirmado' ? (
                <div className="text-center py-6">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gt-on-surface">Aluno cadastrado!</h3>
                  <p className="text-gt-on-surface-variant mt-2">
                    Status: <Badge className="gt-badge-amber">Pendente</Badge> (ativo após
                    pagamento)
                  </p>
                  <div className="mt-6 text-left bg-gt-surface-container rounded-lg p-4">
                    <p className="text-sm font-medium text-gt-on-surface mb-2">Dados do pacote:</p>
                    <pre className="text-xs text-gt-on-surface-variant overflow-x-auto">
                      {JSON.stringify(pacoteDados.dados, null, 2)}
                    </pre>
                  </div>
                </div>
              ) : uploadStatus === 'retido' ? (
                <div className="text-center py-6">
                  <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="w-8 h-8 text-amber-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gt-on-surface">Sistema indisponível</h3>
                  <p className="text-gt-on-surface-variant mt-2">
                    O pacote foi retido. Tente novamente.
                  </p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Upload className="w-12 h-12 text-gt-outline mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-gt-on-surface">
                    Importação no SchoolManager
                  </h3>
                  <p className="text-gt-on-surface-variant mt-2 max-w-md mx-auto">
                    O sistema vai gerar um pacote de importação com os dados do aluno e cadastrá-lo
                    no SchoolManager em uma única ação.
                  </p>
                </div>
              )}
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-5 animate-fade-in">
              {contratoConteudo ? (
                <>
                  <div className="flex items-center gap-2 text-green-600 text-sm">
                    <CheckCircle2 className="w-5 h-5" /> Contrato gerado sem edição manual.
                  </div>
                  <div className="bg-gt-surface-container rounded-lg p-4 max-h-96 overflow-y-auto">
                    <pre className="text-xs text-gt-on-surface whitespace-pre-wrap font-mono">
                      {contratoConteudo}
                    </pre>
                  </div>
                  <Button variant="outline" onClick={baixarContrato} className="w-full">
                    <Download className="w-4 h-4 mr-2" /> Baixar contrato
                  </Button>
                </>
              ) : (
                <div className="text-center py-8">
                  <FileSignature className="w-12 h-12 text-gt-outline mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-gt-on-surface">Geração de Contrato</h3>
                  <p className="text-gt-on-surface-variant mt-2 max-w-md mx-auto">
                    O contrato será gerado automaticamente com os dados do formulário, sem
                    necessidade de edição manual.
                  </p>
                </div>
              )}
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-5 animate-fade-in">
              {pagamentoResult && pagamentoResult.ativada ? (
                <div className="text-center py-6">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gt-on-surface">Pagamento confirmado!</h3>
                  <p className="text-gt-on-surface-variant mt-2">{pagamentoResult.mensagem}</p>
                  {pagamentoResult.divergencia_nome && (
                    <div className="mt-4 bg-amber-50 rounded-lg p-3 text-sm text-amber-700 text-left">
                      <Info className="w-4 h-4 inline mr-1" />
                      {pagamentoResult.nota_divergencia}
                    </div>
                  )}
                </div>
              ) : pagamentoResult && !pagamentoResult.ativada ? (
                <div className="text-center py-6">
                  <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="w-8 h-8 text-red-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gt-on-surface">Pagamento parcial</h3>
                  <p className="text-gt-on-surface-variant mt-2">{pagamentoResult.mensagem}</p>
                  <p className="text-sm text-gt-outline mt-2">
                    Caso enviado para fila de verificação manual.
                  </p>
                </div>
              ) : (
                <>
                  <div className="bg-gt-surface-container rounded-lg p-4 text-sm text-gt-on-surface-variant">
                    <p className="font-medium text-gt-on-surface mb-1">
                      Valor da matrícula: R$ 290,00
                    </p>
                    <p>Informe os dados do pagamento PIX para confirmação automática.</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gt-on-surface">
                      Valor pago (R$)
                    </Label>
                    <Input
                      type="number"
                      value={valorPago}
                      onChange={(e) => setValorPago(e.target.value)}
                      className="mt-1.5"
                      placeholder="290.00"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gt-on-surface">
                      Nome do pagador
                    </Label>
                    <Input
                      value={nomePagador}
                      onChange={(e) => setNomePagador(e.target.value)}
                      className="mt-1.5"
                      placeholder="Nome como aparece no comprovante"
                    />
                    <p className="text-xs text-gt-outline mt-1">
                      Se diferente do nome do aluno, será registrada uma nota de divergência.
                    </p>
                  </div>
                </>
              )}
            </div>
          )}

          {currentStep === 6 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center py-4">
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gt-on-surface">Matrícula concluída!</h3>
                <p className="text-gt-on-surface-variant mt-2">
                  A coordenadora foi notificada automaticamente.
                </p>
              </div>

              <div className="bg-gt-surface-container rounded-lg p-5 space-y-3">
                <h4 className="font-bold text-gt-on-surface">Resumo do aluno</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gt-outline">Nome:</span>{' '}
                    <span className="font-medium text-gt-on-surface">{form.nome}</span>
                  </div>
                  <div>
                    <span className="text-gt-outline">CPF:</span>{' '}
                    <span className="font-medium text-gt-on-surface">{form.cpf}</span>
                  </div>
                  <div>
                    <span className="text-gt-outline">Curso:</span>{' '}
                    <span className="font-medium text-gt-on-surface capitalize">
                      {form.curso_pretendido}
                    </span>
                  </div>
                  <div>
                    <span className="text-gt-outline">Horário:</span>{' '}
                    <span className="font-medium text-gt-on-surface">
                      {form.horario_pretendido}
                    </span>
                  </div>
                  {provaResult && (
                    <div>
                      <span className="text-gt-outline">Nível:</span>{' '}
                      <Badge className="gt-badge-blue">{nivelLabel(provaResult.nivel)}</Badge>
                    </div>
                  )}
                  {provaResult?.turma && (
                    <div>
                      <span className="text-gt-outline">Turma:</span>{' '}
                      <span className="font-medium text-gt-on-surface">
                        {provaResult.turma.curso} — {provaResult.turma.horario}
                      </span>
                    </div>
                  )}
                  <div>
                    <span className="text-gt-outline">Status:</span>{' '}
                    <Badge className="gt-badge-green">Ativo</Badge>
                  </div>
                  <div>
                    <span className="text-gt-outline">Pagamento:</span>{' '}
                    <Badge className="gt-badge-green">Confirmado</Badge>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-blue-50 rounded-lg p-4 text-sm text-blue-700">
                <Bell className="w-5 h-5 flex-shrink-0" />
                <span>
                  A coordenadora recebeu uma notificação com os dados deste aluno para alocação na
                  grade.
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between mt-6">
        <div className="flex gap-3">
          {currentStep > 1 && currentStep < 6 && (
            <Button
              variant="outline"
              onClick={() => setCurrentStep(currentStep - 1)}
              className="border-gt-outline-variant"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
            </Button>
          )}
          {currentStep === 1 && (
            <Button variant="ghost" onClick={simularOffline} className="text-gt-outline">
              {offline ? <WifiOff className="w-4 h-4 mr-2" /> : <Wifi className="w-4 h-4 mr-2" />}
              {offline ? 'Offline' : 'Simular queda'}
            </Button>
          )}
        </div>
        {currentStep === 1 && (
          <Button
            onClick={avancarFormulario}
            disabled={loading}
            className="bg-gt-primary-container hover:bg-gt-primary text-white"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Avançar para prova <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
        {currentStep === 2 && !provaResult && (
          <Button
            onClick={avancarProva}
            disabled={loading}
            className="bg-gt-primary-container hover:bg-gt-primary text-white"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Corrigir prova <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
        {currentStep === 2 && provaResult && (
          <Button
            onClick={() => setCurrentStep(3)}
            className="bg-gt-primary-container hover:bg-gt-primary text-white"
          >
            Avançar <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
        {currentStep === 3 && !pacoteDados && (
          <Button
            onClick={() => processarImportacao(false)}
            disabled={loading}
            className="bg-gt-primary-container hover:bg-gt-primary text-white"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Gerar e importar <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
        {currentStep === 3 && uploadStatus === 'retido' && (
          <Button
            onClick={() => processarImportacao(false)}
            disabled={loading}
            className="bg-gt-primary-container hover:bg-gt-primary text-white"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Tentar novamente
          </Button>
        )}
        {currentStep === 3 && uploadStatus === 'confirmado' && (
          <Button
            onClick={gerarContrato}
            disabled={loading}
            className="bg-gt-primary-container hover:bg-gt-primary text-white"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Gerar contrato <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
        {currentStep === 4 && contratoConteudo && (
          <Button
            onClick={() => setCurrentStep(5)}
            className="bg-gt-primary-container hover:bg-gt-primary text-white"
          >
            Avançar para pagamento <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
        {currentStep === 4 && !contratoConteudo && (
          <Button
            onClick={gerarContrato}
            disabled={loading}
            className="bg-gt-primary-container hover:bg-gt-primary text-white"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Gerar contrato <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}{' '}
        {currentStep === 5 && !pagamentoResult && (
          <Button
            onClick={confirmarPagamento}
            disabled={loading}
            className="bg-gt-primary-container hover:bg-gt-primary text-white"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Confirmar pagamento <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
        {currentStep === 5 && pagamentoResult?.ativada && (
          <Button
            onClick={() => setCurrentStep(6)}
            className="bg-gt-primary-container hover:bg-gt-primary text-white"
          >
            Ver confirmação <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
        {currentStep === 6 && (
          <Button
            onClick={() => {
              window.location.href = '/'
            }}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <CheckCircle2 className="w-4 h-4 mr-2" /> Concluir
          </Button>
        )}
      </div>
    </div>
  )
}

function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}

export default MatriculaWizard
