// Fase 2 — Gerar mensalidades recorrentes para uma matrícula ativa
// POST /backend/v1/mensalidades/gerar
routerAdd(
  'POST',
  '/backend/v1/mensalidades/gerar',
  (e) => {
    const body = e.requestInfo().body
    const matriculaId = body.matricula_id
    const valorMensal = body.valor || 290.0
    const numParcelas = body.parcelas || 12
    const diaVencimento = body.dia_vencimento || 5

    if (!matriculaId) {
      return e.json(400, { erro: 'matricula_id é obrigatório' })
    }

    const matricula = $app.findRecordById('matriculas', matriculaId)
    if (matricula.get('status') !== 'ativo') {
      return e.json(400, { erro: 'Matrícula não está ativa' })
    }

    // Verifica se já existem mensalidades geradas
    const existentes = $app.findRecordsByFilter(
      'mensalidades',
      'matricula_id = {:id}',
      'numero_parcela',
      100,
      0,
      { id: matriculaId },
    )
    if (existentes.length > 0) {
      return e.json(409, {
        erro: 'Já existem mensalidades geradas para esta matrícula',
        total: existentes.length,
      })
    }

    const mensCol = $app.findCollectionByNameOrId('mensalidades')
    const hoje = new Date()
    const geradas = []

    for (let i = 0; i < numParcelas; i++) {
      const venc = new Date(hoje.getFullYear(), hoje.getMonth() + i, diaVencimento)
      const rec = new Record(mensCol)
      rec.set('matricula_id', matriculaId)
      rec.set('numero_parcela', i + 1)
      rec.set('valor', valorMensal)
      rec.set('vencimento', venc.toISOString().split('T')[0])
      rec.set('status', 'pendente')
      rec.set('lembrete_enviado', false)
      // Linha de boleto simulada
      rec.set(
        'boleto_linha',
        '0009' +
          String(i + 1).padStart(3, '0') +
          matriculaId.substring(0, 5) +
          String(valorMensal).replace('.', ''),
      )
      $app.save(rec)
      geradas.push({
        id: rec.id,
        parcela: i + 1,
        vencimento: venc.toISOString().split('T')[0],
        valor: valorMensal,
      })
    }

    return e.json(200, {
      matricula_id: matriculaId,
      total_parcelas: geradas.length,
      mensalidades: geradas,
      mensagem: 'Mensalidades geradas e boletos disponíveis.',
    })
  },
  $apis.requireAuth(),
)
