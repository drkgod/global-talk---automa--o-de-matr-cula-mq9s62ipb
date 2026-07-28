import { Link } from 'react-router-dom'
import { Layout } from './Layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  FileText,
  ClipboardCheck,
  Upload,
  FileSignature,
  CreditCard,
  Bell,
  Calendar,
  Users,
  Receipt,
  AlertTriangle,
  GraduationCap,
  BarChart3,
  ArrowRight,
} from 'lucide-react'

const fases = [
  {
    num: 1,
    titulo: 'Matrícula sem redigitação',
    status: 'implementada',
    cor: 'bg-green-100 text-green-700',
    specs: [
      { id: 'SPEC-1-001', nome: 'Formulário único com autosave', status: '✅' },
      { id: 'SPEC-1-002', nome: 'Prova de nivelamento digital', status: '✅' },
      { id: 'SPEC-1-003', nome: 'Registro via importação em lote', status: '✅' },
      { id: 'SPEC-1-004', nome: 'Geração automática de contrato PDF', status: '✅' },
      { id: 'SPEC-1-005', nome: 'Confirmação automática de pagamento PIX', status: '✅' },
      { id: 'SPEC-1-006', nome: 'Notificação estruturada à coordenadora', status: '✅' },
      { id: 'SPEC-1-007', nome: 'Spike técnico (API SchoolManager)', status: '📋' },
    ],
  },
  {
    num: 2,
    titulo: 'Grade de horários e redução de risco',
    status: 'implementada',
    cor: 'bg-blue-100 text-blue-700',
    specs: [
      { id: 'SPEC-2-001', nome: 'Processo da grade documentado', status: '✅' },
      { id: 'SPEC-2-002', nome: 'Importação de turmas e conflitos', status: '✅' },
      { id: 'SPEC-2-003', nome: 'Calendar e confirmação explícita', status: '✅' },
    ],
  },
  {
    num: 3,
    titulo: 'Cobrança e conciliação',
    status: 'implementada',
    cor: 'bg-blue-100 text-blue-700',
    specs: [
      { id: 'SPEC-3-001', nome: 'Boletos recorrentes', status: '✅' },
      { id: 'SPEC-3-002', nome: 'Envio e lembretes de cobrança', status: '✅' },
      { id: 'SPEC-3-003', nome: 'Conciliação bancária e pagamento parcial', status: '✅' },
    ],
  },
  {
    num: 4,
    titulo: 'Escalonamento de inadimplência',
    status: 'implementada',
    cor: 'bg-blue-100 text-blue-700',
    specs: [
      { id: 'SPEC-4-001', nome: 'Escalonamento de inadimplência', status: '✅' },
      { id: 'SPEC-4-002', nome: 'Renegociação com aprovação humana', status: '✅' },
      { id: 'SPEC-4-003', nome: 'Decisão de integração do SchoolManager', status: '✅' },
    ],
  },
  {
    num: 5,
    titulo: 'Consolidação e encerramento',
    status: 'implementada',
    cor: 'bg-blue-100 text-blue-700',
    specs: [
      { id: 'SPEC-5-001', nome: 'Capacitação operacional', status: '✅' },
      { id: 'SPEC-5-002', nome: 'Reset de expectativa sobre IA', status: '✅' },
      { id: 'SPEC-5-003', nome: 'Métricas finais e handoff', status: '✅' },
    ],
  },
]

const criteriosAceite = [
  // Fase 1
  { id: 'CA-1-01', desc: '6 campos capturados uma única vez', fase: 1, ok: true },
  { id: 'CA-1-02', desc: 'Autosave com recuperação após queda', fase: 1, ok: true },
  { id: 'CA-1-03', desc: 'Validação bloqueia campo vazio', fase: 1, ok: true },
  { id: 'CA-1-04', desc: 'Prova corrigida sem intervenção manual', fase: 1, ok: true },
  { id: 'CA-1-05', desc: 'Roteamento automático para turma', fase: 1, ok: true },
  { id: 'CA-1-06', desc: 'Pendente notifica coordenadora', fase: 1, ok: true },
  { id: 'CA-1-07', desc: 'Aluno cadastrado sem redigitação', fase: 1, ok: true },
  { id: 'CA-1-08', desc: 'Upload em 1 ação da atendente', fase: 1, ok: true },
  { id: 'CA-1-09', desc: 'Indisponibilidade não perde dados', fase: 1, ok: true },
  { id: 'CA-1-10', desc: 'Contrato PDF sem edição manual', fase: 1, ok: true },
  { id: 'CA-1-11', desc: 'Bloqueio por dado obrigatório ausente', fase: 1, ok: true },
  { id: 'CA-1-12', desc: 'Pagamento confirmado automaticamente', fase: 1, ok: true },
  { id: 'CA-1-13', desc: 'Nome divergente ativa com nota', fase: 1, ok: true },
  { id: 'CA-1-14', desc: 'Parcial nunca ativa automaticamente', fase: 1, ok: true },
  { id: 'CA-1-15', desc: 'Notificação na fila da coordenadora', fase: 1, ok: true },
  { id: 'CA-1-16', desc: 'Item mostra nome, nível, curso, horário', fase: 1, ok: true },
  { id: 'CA-1-17', desc: 'Resposta documentada sobre integração', fase: 1, ok: false },
  { id: 'CA-1-18', desc: 'Resposta sobre banco/pagamento', fase: 1, ok: false },
  { id: 'CA-1-19', desc: 'Prazo vencido não bloqueia fases', fase: 1, ok: true },
  // Fase 2
  { id: 'CA-2-01', desc: 'Duas pessoas descrevem o fluxo', fase: 2, ok: true },
  { id: 'CA-2-02', desc: 'Exceções com regra e responsável', fase: 2, ok: true },
  { id: 'CA-2-03', desc: 'Turmas carregadas sem redigitação', fase: 2, ok: true },
  { id: 'CA-2-04', desc: '3 tipos de conflito detectados', fase: 2, ok: true },
  { id: 'CA-2-05', desc: 'Importação inválida sem registros parciais', fase: 2, ok: true },
  { id: 'CA-2-06', desc: 'Grade cria eventos sem duplicação', fase: 2, ok: true },
  { id: 'CA-2-07', desc: 'Confirmação/recusa explícitas', fase: 2, ok: true },
  { id: 'CA-2-08', desc: 'Silêncio não confirma a grade', fase: 2, ok: true },
  // Fase 3
  { id: 'CA-3-01', desc: 'Ativos recebem exatamente um título', fase: 3, ok: true },
  { id: 'CA-3-02', desc: 'Repetição não duplica títulos', fase: 3, ok: true },
  { id: 'CA-3-03', desc: 'Pré-aviso 5 dias antes, lembrete no vencimento', fase: 3, ok: true },
  { id: 'CA-3-04', desc: 'Mensagens com status e timestamp', fase: 3, ok: true },
  { id: 'CA-3-05', desc: 'Extrato conciliado sem digitação', fase: 3, ok: true },
  { id: 'CA-3-06', desc: 'Nome divergente sem baixa silenciosa', fase: 3, ok: true },
  { id: 'CA-3-07', desc: 'Parcial e ambiguidade seguem regra', fase: 3, ok: true },
  // Fase 4
  { id: 'CA-4-01', desc: 'Caso percorre cobrança, reenvio e escala', fase: 4, ok: true },
  { id: 'CA-4-02', desc: 'Pagamento interrompe cobranças', fase: 4, ok: true },
  { id: 'CA-4-03', desc: 'Escala contém histórico completo', fase: 4, ok: true },
  {
    id: 'CA-4-04',
    desc: 'Aprovação registra motivo, valor, prazo, pessoa, data',
    fase: 4,
    ok: true,
  },
  { id: 'CA-4-05', desc: 'Recusa/silêncio não cria renegociação', fase: 4, ok: true },
  { id: 'CA-4-06', desc: 'Decisão não pendente, cita evidências', fase: 4, ok: true },
  {
    id: 'CA-4-07',
    desc: 'Caminho escolhido tem impacto, responsável, rollback',
    fase: 4,
    ok: true,
  },
  // Fase 5
  { id: 'CA-5-01', desc: '3 papéis executam rotina sem consultor', fase: 5, ok: true },
  { id: 'CA-5-02', desc: 'Progresso e lacunas documentados', fase: 5, ok: true },
  { id: 'CA-5-03', desc: 'Comunicação declara ausência de IA', fase: 5, ok: true },
  { id: 'CA-5-04', desc: 'Sandra confirma compreensão por escrito', fase: 5, ok: true },
  { id: 'CA-5-05', desc: '3 métricas sem dado inventado', fase: 5, ok: true },
  { id: 'CA-5-06', desc: 'Equipe opera sem consultor', fase: 5, ok: true },
  { id: 'CA-5-07', desc: 'Handoff com confirmação escrita', fase: 5, ok: true },
]

const PainelFases = () => {
  const totalCA = criteriosAceite.length
  const okCA = criteriosAceite.filter((c) => c.ok).length
  const pct = Math.round((okCA / totalCA) * 100)

  return (
    <div className="container mx-auto py-6 px-4 max-w-5xl">
      <h1 className="text-2xl font-bold mb-2">Painel de Fases — Global Talk</h1>
      <p className="text-gray-500 mb-6">
        Visão geral das 5 fases do projeto, specs e critérios de aceite.
      </p>

      {/* Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-blue-600">5</p>
            <p className="text-sm text-gray-500">Fases</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-blue-600">19</p>
            <p className="text-sm text-gray-500">Specs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-green-600">
              {okCA}/{totalCA}
            </p>
            <p className="text-sm text-gray-500">Critérios de aceite</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-green-600">{pct}%</p>
            <p className="text-sm text-gray-500">Conclusão</p>
          </CardContent>
        </Card>
      </div>

      {/* Fases */}
      {fases.map((fase) => (
        <Card key={fase.num} className="mb-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Badge className={fase.cor}>Fase {fase.num}</Badge>
                  {fase.titulo}
                </CardTitle>
              </div>
              <Badge variant="outline">{fase.status}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {fase.specs.map((spec) => (
                <div
                  key={spec.id}
                  className="flex items-center justify-between py-1 border-b last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-mono text-gray-500">{spec.id}</span>
                    <span className="text-sm">{spec.nome}</span>
                  </div>
                  <span className="text-lg">{spec.status}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Critérios de aceite */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Critérios de Aceite — Todas as Fases</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="py-2 pr-3">ID</th>
                  <th className="py-2 pr-3">Fase</th>
                  <th className="py-2 pr-3">Descrição</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {criteriosAceite.map((ca) => (
                  <tr key={ca.id} className="border-b hover:bg-gray-50">
                    <td className="py-2 pr-3 font-mono text-xs">{ca.id}</td>
                    <td className="py-2 pr-3">{ca.fase}</td>
                    <td className="py-2 pr-3">{ca.desc}</td>
                    <td className="py-2">
                      {ca.ok ? (
                        <span className="text-green-600">✅ OK</span>
                      ) : (
                        <span className="text-amber-600">⏳ Pendente</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2 justify-center">
        <Link to="/">
          <Button variant="outline">Voltar ao início</Button>
        </Link>
        <Link to="/matricula">
          <Button>
            Nova matrícula <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  )
}

export default PainelFases
