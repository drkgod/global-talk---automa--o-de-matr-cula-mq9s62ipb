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
import { Receipt, Loader2, DollarSign, TrendingUp, CreditCard } from 'lucide-react'
import pb from '@/lib/pocketbase/client'

const PainelFinanceiro = () => {
  const [mensalidades, setMensalidades] = useState<any[]>([])
  const [conciliacoes, setConciliacoes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [gerando, setGerando] = useState(false)
  const [matriculaId, setMatriculaId] = useState('')

  const carregar = useCallback(async () => {
    try {
      const m = await pb.collection('mensalidades').getFullList({ sort: '-vencimento' })
      setMensalidades(m)
      const c = await pb.collection('conciliacao_bancaria').getFullList({ sort: '-created' })
      setConciliacoes(c)
    } catch {
      // ok
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
        body: { matricula_id: matriculaId },
      })
      toast.success(`${res.total_parcelas} mensalidades geradas!`)
      carregar()
    } catch (err: any) {
      toast.error(err.response?.erro || err.message)
    } finally {
      setGerando(false)
    }
  }

  const simularConciliacao = async () => {
    setGerando(true)
    try {
      const pendentes = mensalidades.filter((m) => m.status === 'pendente').slice(0, 3)
      if (pendentes.length === 0) {
        toast.info('Nenhuma pendente')
        return
      }
      const lancamentos = pendentes.map((m) => ({
        valor: m.valor,
        data: new Date().toISOString().split('T')[0],
        descricao: 'PIX',
      }))
      const res = await pb.send('/backend/v1/conciliacao/processar', {
        method: 'POST',
        body: { lancamentos },
      })
      toast.success(`${res.conciliados} conciliado(s)`)
      carregar()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setGerando(false)
    }
  }

  const statusBadge = (s: string) =>
    ({
      pendente: 'gt-badge-amber',
      pago: 'gt-badge-green',
      atrasado: 'gt-badge-red',
      cancelado: 'bg-gray-100 text-gray-700',
    })[s] || 'bg-gray-100 text-gray-700'

  const totalReceber = mensalidades
    .filter((m) => m.status === 'pendente' || m.status === 'atrasado')
    .reduce((s, m) => s + m.valor, 0)
  const totalRecebido = mensalidades
    .filter((m) => m.status === 'pago')
    .reduce((s, m) => s + (m.valor_pago || m.valor), 0)

  return (
    <div className="container mx-auto py-8 px-6 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gt-on-surface flex items-center gap-3">
          <Receipt className="w-8 h-8 text-gt-primary-container" />
          Painel Financeiro
        </h1>
        <p className="text-gt-on-surface-variant mt-1">
          Gerencie mensalidades e conciliação bancária
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="gt-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gt-outline">A receber</p>
                <p className="text-3xl font-bold text-amber-600">R$ {totalReceber.toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="gt-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gt-outline">Recebido</p>
                <p className="text-3xl font-bold text-green-600">R$ {totalRecebido.toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="gt-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gt-outline">Mensalidades</p>
                <p className="text-3xl font-bold text-gt-primary-container">
                  {mensalidades.length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-gt-primary-container" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="mensalidades">
        <TabsList className="mb-6 bg-gt-surface-container">
          <TabsTrigger
            value="mensalidades"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            Mensalidades
          </TabsTrigger>
          <TabsTrigger
            value="conciliacao"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            Conciliação
          </TabsTrigger>
          <TabsTrigger
            value="gerar"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            Gerar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="mensalidades">
          <Card className="gt-card">
            <CardHeader className="border-b border-gt-outline-variant">
              <CardTitle className="text-lg font-bold text-gt-on-surface">
                Mensalidades Recorrentes
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-8 text-center text-gt-outline">Carregando...</div>
              ) : mensalidades.length === 0 ? (
                <div className="p-8 text-center text-gt-outline">Nenhuma mensalidade gerada.</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-gt-outline-variant">
                      <TableHead className="font-semibold text-gt-on-surface">Parcela</TableHead>
                      <TableHead className="font-semibold text-gt-on-surface">Vencimento</TableHead>
                      <TableHead className="font-semibold text-gt-on-surface">Valor</TableHead>
                      <TableHead className="font-semibold text-gt-on-surface">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mensalidades.map((m) => (
                      <TableRow
                        key={m.id}
                        className="border-b border-gt-outline-variant hover:bg-gt-surface-container"
                      >
                        <TableCell className="font-medium text-gt-on-surface">
                          {m.numero_parcela}/12
                        </TableCell>
                        <TableCell className="text-gt-on-surface-variant">
                          {new Date(m.vencimento).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell className="font-medium text-gt-on-surface">
                          R$ {m.valor.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Badge className={statusBadge(m.status)}>{m.status}</Badge>
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
          <Card className="gt-card">
            <CardHeader className="flex flex-row items-center justify-between border-b border-gt-outline-variant">
              <CardTitle className="text-lg font-bold text-gt-on-surface">
                Conciliação Bancária
              </CardTitle>
              <Button
                size="sm"
                onClick={simularConciliacao}
                disabled={gerando}
                className="bg-gt-primary-container hover:bg-gt-primary text-white"
              >
                {gerando && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Simular
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {conciliacoes.length === 0 ? (
                <div className="p-8 text-center text-gt-outline">Nenhuma conciliação.</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-gt-outline-variant">
                      <TableHead className="font-semibold text-gt-on-surface">Data</TableHead>
                      <TableHead className="font-semibold text-gt-on-surface">Valor</TableHead>
                      <TableHead className="font-semibold text-gt-on-surface">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {conciliacoes.map((c) => (
                      <TableRow
                        key={c.id}
                        className="border-b border-gt-outline-variant hover:bg-gt-surface-container"
                      >
                        <TableCell className="text-gt-on-surface-variant">
                          {c.data_extrato
                            ? new Date(c.data_extrato).toLocaleDateString('pt-BR')
                            : '—'}
                        </TableCell>
                        <TableCell className="font-medium text-gt-on-surface">
                          R$ {c.valor_extrato.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              c.status === 'conciliado' ? 'gt-badge-green' : 'gt-badge-amber'
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
          <Card className="gt-card">
            <CardHeader className="border-b border-gt-outline-variant">
              <CardTitle className="text-lg font-bold text-gt-on-surface">
                Gerar Mensalidades
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div>
                <Label htmlFor="mat" className="text-sm font-medium text-gt-on-surface">
                  ID da Matrícula
                </Label>
                <Input
                  id="mat"
                  value={matriculaId}
                  onChange={(e) => setMatriculaId(e.target.value)}
                  placeholder="ID da matrícula ativa"
                  className="mt-1.5 border-gt-outline-variant focus:ring-gt-primary-container"
                />
              </div>
              <div className="bg-gt-surface-container rounded-lg p-4 border border-gt-outline-variant">
                <p className="font-medium text-gt-on-surface mb-2">Como funciona:</p>
                <ul className="text-sm text-gt-on-surface-variant space-y-1">
                  <li>• 12 parcelas mensais geradas automaticamente</li>
                  <li>• Vencimento no dia 5 de cada mês</li>
                  <li>• Valor: R$ 290,00 por parcela</li>
                </ul>
              </div>
              <Button
                onClick={gerarMensalidades}
                disabled={gerando}
                className="w-full bg-gt-primary-container hover:bg-gt-primary text-white"
              >
                {gerando && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
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
