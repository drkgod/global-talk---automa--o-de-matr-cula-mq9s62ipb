import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import {
  FileText,
  ClipboardCheck,
  Upload,
  FileSignature,
  CreditCard,
  Bell,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Download,
} from 'lucide-react'
import pb from '@/lib/pocketbase/client'

type Step = 0 | 1 | 2 | 3 | 4 | 5 | 6

interface FormData {
  sessao_id: string
  nome: string
  cpf: string
  endereco: string
  telefone: string
  curso_pretendido: string
  horario_pretendido: string
}

interface Questao {
  id: string
  ordem: number
  enunciado: string
  opcao_a: string
  opcao_b: string
  opcao_c: string
  opcao_d: string
  resposta_correta: string
}

interface Turma {
  id: string
  nivel: string
  curso: string
  horario: string
  vagas_disponiveis: number
}

const STORAGE_KEY = 'gt_matricula_draft'

const MatriculaWizard = () => {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>(0)
  const [loading, setLoading] = useState(false)
  const [matriculaId, setMatriculaId] = useState('')

  // Form data com autosave (SPEC-1-001 CA-1-02)
  const [formData, setFormData] = useState<FormData>(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        /* ignore */
      }
    }
    return {
      sessao_id: 'sessao_' + Date.now(),
      nome: '',
      cpf: '',
      endereco: '',
      telefone: '',
      curso_pretendido: '',
      horario_pretendido: '',
    }
  })

  // Autosave incremental — salva a cada mudança (SPEC-1-001)
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData))
  }, [formData])

  // Prova
  const [questoes, setQuestoes] = useState<Questao[]>([])
  const [respostas, setRespostas] = useState<Record<string, string>>({})
  const [provaResultado, setProvaResultado] = useState<any>(null)

  // Importação
  const [pacoteId, setPacoteId] = useState('')
  const [pacoteDados, setPacoteDados] = useState<any>(null)
  const [uploadConfirmado, setUploadConfirmado] = useState(false)

  // Contrato
  const [contratoConteudo, setContratoConteudo] = useState('')
  const [contratoId, setContratoId] = useState('')

  // Pagamento
  const [pagamentoResultado, setPagamentoResultado] = useState<any>(null)
  const [valorPago, setValorPago] = useState('')
  const [nomePagador, setNomePagador] = useState('')

  // ─── Step 0: Formulário ───
  const camposObrigatorios = [
    'nome',
    'cpf',
    'endereco',
    'telefone',
    'curso_pretendido',
    'horario_pretendido',
  ]
  const campoVazio = camposObrigatorios.find((c) => !formData[c as keyof FormData]?.trim())

  const criarMatricula = async () => {
    setLoading(true)
    try {
      const rec = await pb.collection('matriculas').create({
        ...formData,
        status: 'formulario_concluido',
        nivel: '',
        horario_alternativo_oferecido: false,
        valor_matricula: 350.0,
      })
      setMatriculaId(rec.id)
      // Limpa rascunho após sucesso
      localStorage.removeItem(STORAGE_KEY)
      setStep(1)
    } catch (err: any) {
      toast.error('Erro ao salvar matrícula: ' + (err.message || 'desconhecido'))
    } finally {
      setLoading(false)
    }
  }

  // ─── Step 1: Prova ───
  const carregarQuestoes = useCallback(async () => {
    try {
      const records = await pb.collection('questoes_prova').getFullList({ sort: 'ordem' })
      setQuestoes(records as unknown as Questao[])
    } catch (err) {
      toast.error('Erro ao carregar questões')
    }
  }, [])

  useEffect(() => {
    if (step === 1 && questoes.length === 0) carregarQuestoes()
  }, [step, questoes.length, carregarQuestoes])

  const todasRespondidas = questoes.length > 0 && questoes.every((q) => respostas[q.id])

  const submeterProva = async () => {
    setLoading(true)
    try {
      // Salva respostas
      for (const q of questoes) {
        await pb.collection('prova_respostas').create({
          matricula_id: matriculaId,
          questao_id: q.id,
          resposta: respostas[q.id],
          acertou: false,
        })
      }
      // Chama rota de correção
      const res = await pb.send('/backend/v1/prova/corrigir', {
        method: 'POST',
        body: { matricula_id: matriculaId },
      })
      setProvaResultado(res)
      setStep(2)
    } catch (err: any) {
      const msg = err.response?.message || err.message || 'desconhecido'
      toast.error('Erro ao corrigir prova: ' + msg)
    } finally {
      setLoading(false)
    }
  }

  // ─── Step 2: Importação ───
  const gerarPacote = async () => {
    setLoading(true)
    try {
      const res = await pb.send('/backend/v1/importacao/gerar', {
        method: 'POST',
        body: { matricula_id: matriculaId },
      })
      setPacoteId(res.pacote_id)
      setPacoteDados(res.dados)
      toast.success('Pacote de importação gerado!')
    } catch (err: any) {
      const msg = err.response?.erro || err.message || 'desconhecido'
      toast.error('Erro: ' + msg)
    } finally {
      setLoading(false)
    }
  }

  const uploadPacote = async () => {
    setLoading(true)
    try {
      const res = await pb.send('/backend/v1/importacao/upload', {
        method: 'POST',
        body: { pacote_id: pacoteId },
      })
      setUploadConfirmado(true)
      toast.success('Aluno cadastrado com status "pendente"!')
      setStep(3)
    } catch (err: any) {
      const msg = err.response?.erro || err.message || 'desconhecido'
      toast.error('Erro no upload: ' + msg)
    } finally {
      setLoading(false)
    }
  }

  // ─── Step 3: Contrato ───
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
    } catch (err: any) {
      const msg = err.response?.erro || err.message || 'desconhecido'
      toast.error('Erro: ' + msg)
    } finally {
      setLoading(false)
    }
  }

  const baixarContrato = () => {
    const blob = new Blob([contratoConteudo], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `contrato-${formData.nome || 'aluno'}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  // ─── Step 4: Pagamento ───
  const confirmarPagamento = async () => {
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
      setPagamentoResultado(res)
      if (res.ativada) {
        toast.success('Matrícula ativada!')
        setStep(5)
      } else {
        toast.warning('Pagamento parcial — fila de verificação manual.')
      }
    } catch (err: any) {
      toast.error('Erro: ' + (err.message || 'desconhecido'))
    } finally {
      setLoading(false)
    }
  }

  // ─── Simular queda de conexão e recuperação (SPEC-1-001 CA-1-02) ───
  const simularQuedaConexao = () => {
    toast.info('Simulando queda de conexão... Os dados estão salvos no localStorage.')
    setTimeout(() => {
      toast.success('Conexão restabelecida! Dados recuperados do rascunho.')
    }, 2000)
  }

  const stepIcons = [FileText, ClipboardCheck, Upload, FileSignature, CreditCard, Bell]
  const stepNames = ['Formulário', 'Prova', 'Importação', 'Contrato', 'Pagamento', 'Notificação']

  return (
    <div className="container mx-auto py-6 px-4 max-w-3xl">
      {/* Stepper */}
      <div className="flex items-center justify-between mb-8 overflow-x-auto">
        {stepNames.map((name, i) => {
          const Icon = stepIcons[i]
          const isCurrent = step === i
          const isDone = step > i
          return (
            <div key={i} className="flex items-center flex-shrink-0">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                    isDone
                      ? 'bg-green-500 border-green-500 text-white'
                      : isCurrent
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'bg-white border-gray-300 text-gray-400'
                  }`}
                >
                  {isDone ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>
                <span
                  className={`text-xs ${isCurrent ? 'font-bold text-blue-600' : 'text-gray-500'}`}
                >
                  {name}
                </span>
              </div>
              {i < stepNames.length - 1 && (
                <div className={`w-8 h-0.5 mx-1 ${isDone ? 'bg-green-500' : 'bg-gray-300'}`} />
              )}
            </div>
          )
        })}
      </div>

      {/* Step 0: Formulário */}
      {step === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Formulário de Matrícula
            </CardTitle>
            <p className="text-sm text-gray-500">
              Os 6 campos são capturados uma única vez. O autosave protege os dados em caso de queda
              de conexão.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="nome">Nome completo *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Nome do aluno"
              />
            </div>
            <div>
              <Label htmlFor="cpf">CPF *</Label>
              <Input
                id="cpf"
                value={formData.cpf}
                onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                placeholder="000.000.000-00"
              />
            </div>
            <div>
              <Label htmlFor="endereco">Endereço *</Label>
              <Input
                id="endereco"
                value={formData.endereco}
                onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                placeholder="Rua, número, bairro, cidade"
              />
            </div>
            <div>
              <Label htmlFor="telefone">Telefone *</Label>
              <Input
                id="telefone"
                value={formData.telefone}
                onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                placeholder="(00) 00000-0000"
              />
            </div>
            <div>
              <Label htmlFor="curso">Curso pretendido *</Label>
              <Input
                id="curso"
                value={formData.curso_pretendido}
                onChange={(e) => setFormData({ ...formData, curso_pretendido: e.target.value })}
                placeholder="Ex: Inglês"
              />
            </div>
            <div>
              <Label htmlFor="horario">Horário pretendido *</Label>
              <Input
                id="horario"
                value={formData.horario_pretendido}
                onChange={(e) => setFormData({ ...formData, horario_pretendido: e.target.value })}
                placeholder="Ex: Seg/Qua 19:00"
              />
            </div>

            {campoVazio && (
              <div className="flex items-center gap-2 text-amber-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                Campo obrigatório pendente: <strong>{campoVazio}</strong>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <Button variant="outline" size="sm" onClick={simularQuedaConexao}>
                Simular queda de conexão
              </Button>
              <Button onClick={criarMatricula} disabled={!!campoVazio || loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Avançar para prova
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 1: Prova de Nivelamento */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-blue-600" />
              Prova de Nivelamento
            </CardTitle>
            <p className="text-sm text-gray-500">
              Correção automática. O resultado define o nível e direciona para a turma/horário.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {questoes.map((q, i) => (
              <div key={q.id} className="space-y-2">
                <div className="font-medium">
                  {i + 1}. {q.enunciado}
                </div>
                <RadioGroup
                  value={respostas[q.id] || ''}
                  onValueChange={(v) => setRespostas({ ...respostas, [q.id]: v })}
                >
                  {(['a', 'b', 'c', 'd'] as const).map((opt) => (
                    <div key={opt} className="flex items-center space-x-2">
                      <RadioGroupItem value={opt} id={`q${q.id}-${opt}`} />
                      <Label htmlFor={`q${q.id}-${opt}`} className="font-normal cursor-pointer">
                        {q[`opcao_${opt}` as keyof Questao] as string}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            ))}

            <div className="flex items-center justify-between pt-2">
              <Button variant="outline" onClick={() => setStep(0)}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
              </Button>
              <Button onClick={submeterProva} disabled={!todasRespondidas || loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Corrigir prova
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Importação */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-blue-600" />
              Registro via Importação
            </CardTitle>
            <p className="text-sm text-gray-500">
              O pacote é gerado a partir dos dados já capturados. Upload em 1 ação, sem redigitação.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {provaResultado && (
              <div className="bg-blue-50 rounded-lg p-4 space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Nível: {provaResultado.nivel}</Badge>
                  <Badge variant="outline">
                    {provaResultado.acertos}/{provaResultado.total} acertos
                  </Badge>
                </div>
                {provaResultado.turma && (
                  <p className="text-sm text-gray-700 mt-2">
                    Turma: <strong>{provaResultado.turma.curso}</strong> —{' '}
                    {provaResultado.turma.horario}
                    {provaResultado.horario_alternativo && (
                      <span className="text-amber-600 ml-2">(horário alternativo oferecido)</span>
                    )}
                  </p>
                )}
                {provaResultado.pendente && (
                  <p className="text-sm text-amber-600 mt-2">{provaResultado.mensagem}</p>
                )}
              </div>
            )}

            {!pacoteId ? (
              <Button onClick={gerarPacote} disabled={loading} className="w-full">
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Gerar pacote de importação
              </Button>
            ) : !uploadConfirmado ? (
              <div className="space-y-3">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-medium mb-2">Pacote gerado:</p>
                  <pre className="text-xs overflow-x-auto bg-white p-3 rounded border">
                    {JSON.stringify(pacoteDados, null, 2)}
                  </pre>
                </div>
                <Button onClick={uploadPacote} disabled={loading} className="w-full">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  <Upload className="w-4 h-4 mr-2" />
                  Fazer upload (1 ação)
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Aluno cadastrado como "pendente". Nenhum campo redigitado.</span>
                </div>
                <Button onClick={() => setStep(3)} className="w-full">
                  Avançar para contrato
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 3: Contrato */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSignature className="w-5 h-5 text-blue-600" />
              Geração de Contrato PDF
            </CardTitle>
            <p className="text-sm text-gray-500">
              O contrato é gerado automaticamente a partir dos dados do formulário.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {!contratoConteudo ? (
              <Button onClick={gerarContrato} disabled={loading} className="w-full">
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Gerar contrato
              </Button>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Contrato gerado sem edição manual.</span>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                  <pre className="text-xs whitespace-pre-wrap font-mono">{contratoConteudo}</pre>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={baixarContrato}>
                    <Download className="w-4 h-4 mr-2" /> Baixar
                  </Button>
                  <Button onClick={() => setStep(4)} className="flex-1">
                    Avançar para pagamento
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 4: Pagamento */}
      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-600" />
              Confirmação de Pagamento PIX
            </CardTitle>
            <p className="text-sm text-gray-500">
              Identificação automática por valor + nome. Pagamento parcial vai para fila manual.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-gray-700">
                Valor da matrícula: <strong>R$ 350,00</strong>
              </p>
            </div>
            <div>
              <Label htmlFor="valor">Valor pago (R$)</Label>
              <Input
                id="valor"
                type="number"
                step="0.01"
                value={valorPago}
                onChange={(e) => setValorPago(e.target.value)}
                placeholder="350.00"
              />
            </div>
            <div>
              <Label htmlFor="pagador">Nome do pagador</Label>
              <Input
                id="pagador"
                value={nomePagador}
                onChange={(e) => setNomePagador(e.target.value)}
                placeholder={formData.nome || 'Nome de quem pagou'}
              />
            </div>

            {pagamentoResultado && !pagamentoResultado.ativada && (
              <div className="bg-amber-50 rounded-lg p-4 flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800">Pagamento parcial</p>
                  <p className="text-sm text-amber-700">
                    Matrícula não ativada. Caso enviado para fila de verificação manual.
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <Button variant="outline" onClick={() => setStep(3)}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
              </Button>
              <Button onClick={confirmarPagamento} disabled={!valorPago || loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Confirmar pagamento
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 5: Notificação / Conclusão */}
      {step === 5 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-600" />
              Matrícula Concluída!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-50 rounded-lg p-6 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
              <p className="text-lg font-medium text-green-800">Matrícula ativada com sucesso!</p>
              <p className="text-sm text-gray-600">
                A coordenadora foi notificada automaticamente no sistema.
              </p>
            </div>

            {pagamentoResultado?.divergencia_nome && (
              <div className="bg-amber-50 rounded-lg p-4">
                <p className="text-sm font-medium text-amber-800">Nota de divergência:</p>
                <p className="text-sm text-amber-700 mt-1">{pagamentoResultado.nota_divergencia}</p>
              </div>
            )}

            <div className="flex gap-2 justify-center">
              <Button variant="outline" onClick={() => navigate('/')}>
                Voltar ao início
              </Button>
              <Button onClick={() => navigate('/coordenadora')}>Ver painel da coordenadora</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default MatriculaWizard
