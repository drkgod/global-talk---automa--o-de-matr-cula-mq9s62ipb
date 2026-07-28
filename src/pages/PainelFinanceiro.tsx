import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { Receipt, AlertTriangle, CheckCircle2, Loader2, FileText } from 'lucide-react'
import pb from '@/lib/pocketbase/client'

interface Mensalidade {
  id: string
  matricula_id: string
  numero_parcela: number
  valor: number
  vencimento: string
  status: string
  data_pagamento: string
  boleto_linha: string
  lembrete_enviado: boolean
}

interface Conciliacao {
  id: string
  mensalidade_id: string
  valor_extrato: number
  data_extrato: string
  descricao_extrato: string
  status: string
  observacao: string
}

const PainelFinanceiro = () => {
  const [mensalidades, setMensalidades] = useState<Mensalidade[]>([])
  const [conciliacoes, setConciliacoes] = useState<Conciliacao[]>([])
  const [loading, setLoading] = useState(true)
  const [gerando, setGerando] = useState(false)
  const [matriculaId, setMatriculaId] = useState('')

  const carregar = useCallback(async () => {
    try {
      const mens = await pb.collection('mensalidades').getFullList({ sort: '-vencimento' })
      setMensalidades(mens as unknown as Mensalidade[])
      const conc = await pb.collection('conciliacao_bancaria').getFullList({ sort: '-created' })
      setConciliacoes(conc as unknown as Conciliacao[])
    } catch (err) {
      /* dados ainda não existem */
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    carregar()
  }, [carregar])

  const gerarMensalidades = async () => {
    if (!matriculaId) {
      toast.error('Informe o ID da matrícula')
      return
    }
    setGerando(true)
    try {
      const res = await pb.send('/backend/v1/mensalidades/gerar', {
        method: 'POST',
        body: { matricula_id: matriculaId, valor: 290.0, parcelas: 12, dia_vencimento: 5 },
      })
      toast.success(`${res.total_parcelas} mensalidades geradas!`)
      carregar()
    } catch (err: any) {
      toast.error(err.response?.erro || err.message || 'Erro')
    } finally {
      setGerando(false)
    }
  }

  const simularConciliacao = async () => {
    setGerando(true)
    try {
      // Simula lançamentos de extrato
      const lancamentos = mensalidades
        .filter((m) => m.status === 'pendente' || m.status === 'atrasado')
        .slice(0, 3)
        .map((m) => ({
          valor: m.valor,
          data: new Date().toISOString().split('T')[0],
          descricao: 'PIX recebido',
        }))

      if (lancamentos.length === 0) {
        toast.info('Nenhuma mensalidade pendente para conciliar')
        return
      }

      const res = await pb.send('/backend/v1/conciliacao/processar', {
        method: 'POST',
        body: { lancamentos },
      })
      toast.success(
        `${res.conciliados} conciliado(s), ${res.divergentes} divergente(s), ${res.nao_identificados} não identificado(s)`,
      )
      carregar()
    } catch (err: any) {
      toast.error(err.message || 'Erro na conciliação')
    } finally {
      setGerando(false)
    }
  }

  const statusBadge = (s: string) => {
    const map: Record<string, string> = {
      pendente: 'bg-yellow-100 text-yellow-800',
      pago: 'bg-green-100 text-green-800',
      atrasado: 'bg-red-100 text-red-800',
      cancelado: 'bg-gray-100 text-gray-800',
    }
    return map[s] || 'bg-gray-100'
  }

  const totalReceber = mensalidades
    .filter((m) => m.status === 'pendente' || m.status === 'atrasado')
    .reduce((s, m) => s + m.valor, 0)
  const totalRecebido = mensalidades
    .filter((m) => m.status === 'pago')
    .reduce((s, m) => s + (m.valor_pago || m.valor), 0)

  return (
    <div className="container mx-auto py-6 px-4 max-w-5xl">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Receipt className="w-6 h-6 text-blue-600" />
        Painel Financeiro — Cobrança e Conciliação
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-500">Total a receber</p>
            <p className="text-2xl font-bold text-amber-600">R$ {totalReceber.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-500">Total recebido</p>
            <p className="text-2xl font-bold text-green-600">R$ {totalRecebido.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-500">Mensalidades</p>
            <p className="text-2xl font-bold text-blue-600">{mensalidades.length}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="mensalidades">
        <TabsList className="mb-4">
          <TabsTrigger value="mensalidades">Mensalidades</TabsTrigger>
          <TabsTrigger value="conciliacao">Conciliação Bancária</TabsTrigger>
          <TabsTrigger value="gerar">Gerar Boletos</TabsTrigger>
        </TabsList>

        <TabsContent value="mensalidades">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Mensalidades Recorrentes</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-gray-500 text-center py-4">Carregando...</p>
              ) : mensalidades.length === 0 ? (
                <p className="text-gray-400 text-center py-4">Nenhuma mensalidade gerada ainda.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Parcela</TableHead>
                      <TableHead>Vencimento</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Lembrete</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mensalidades.map((m) => (
                      <TableRow key={m.id}>
                        <TableCell>{m.numero_parcela}/12</TableCell>
                        <TableCell>{new Date(m.vencimento).toLocaleDateString('pt-BR')}</TableCell>
                        <TableCell>R$ {m.valor.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge className={statusBadge(m.status)}>{m.status}</Badge>
                        </TableCell>
                        <TableCell>
                          {m.lembrete_enviado ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          ) : (
                            '—'
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conciliacao">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Conciliação Bancária</CardTitle>
              <Button size="sm" onClick={simularConciliacao} disabled={gerando}>
                {gerando ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Simular conciliação
              </Button>
            </CardHeader>
            <CardContent>
              {conciliacoes.length === 0 ? (
                <p className="text-gray-400 text-center py-4">Nenhuma conciliação registrada.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {conciliacoes.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell>
                          {c.data_extrato
                            ? new Date(c.data_extrato).toLocaleDateString('pt-BR')
                            : '—'}
                        </TableCell>
                        <TableCell>R$ {c.valor_extrato.toFixed(2)}</TableCell>
                        <TableCell className="text-sm">{c.descricao_extrato}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              c.status === 'conciliado'
                                ? 'bg-green-100 text-green-800'
                                : c.status === 'divergente'
                                  ? 'bg-orange-100 text-orange-800'
                                  : 'bg-gray-100'
                            }
                          >
                            {c.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gerar">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Gerar Mensalidades</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="mat">ID da Matrícula</Label>
                <Input
                  id="mat"
                  value={matriculaId}
                  onChange={(e) => setMatriculaId(e.target.value)}
                  placeholder="ID da matrícula ativa"
                />
              </div>
              <div className="bg-blue-50 rounded-lg p-4 text-sm text-gray-600">
                <p className="font-medium mb-1">Como funciona:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>12 parcelas mensais geradas automaticamente</li>
                  <li>Vencimento no dia 5 de cada mês</li>
                  <li>Valor: R$ 290,00 por parcela</li>
                  <li>Linha de boleto gerada para cada parcela</li>
                  <li>Lembrete automático 3 dias antes do vencimento</li>
                </ul>
              </div>
              <Button onClick={gerarMensalidades} disabled={gerando} className="w-full">
                {gerando ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Gerar 12 mensalidades
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default PainelFinanceiro
