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
import { Receipt, Loader2, CheckCircle2 } from 'lucide-react'
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
    } catch (_) {
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
      pendente: 'bg-yellow-100 text-yellow-800',
      pago: 'bg-green-100 text-green-800',
      atrasado: 'bg-red-100 text-red-800',
      cancelado: 'bg-gray-100',
    })[s] || 'bg-gray-100'
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
        Painel Financeiro
      </h1>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-500">A receber</p>
            <p className="text-2xl font-bold text-amber-600">R$ {totalReceber.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-500">Recebido</p>
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
          <TabsTrigger value="conciliacao">Conciliação</TabsTrigger>
          <TabsTrigger value="gerar">Gerar</TabsTrigger>
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
                <p className="text-gray-400 text-center py-4">Nenhuma mensalidade gerada.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Parcela</TableHead>
                      <TableHead>Vencimento</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Status</TableHead>
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
                {gerando && <Loader2 className="w-4 h-4 animate-spin mr-2" />}Simular
              </Button>
            </CardHeader>
            <CardContent>
              {conciliacoes.length === 0 ? (
                <p className="text-gray-400 text-center py-4">Nenhuma conciliação.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Valor</TableHead>
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
                        <TableCell>
                          <Badge
                            className={
                              c.status === 'conciliado'
                                ? 'bg-green-100 text-green-800'
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
                  <li>12 parcelas mensais geradas</li>
                  <li>Vencimento no dia 5</li>
                  <li>Valor: R$ 290,00/parcela</li>
                </ul>
              </div>
              <Button onClick={gerarMensalidades} disabled={gerando} className="w-full">
                {gerando && <Loader2 className="w-4 h-4 animate-spin mr-2" />}Gerar 12 mensalidades
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
export default PainelFinanceiro
