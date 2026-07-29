// Fase 2 — Gerar mensalidades recorrentes
routerAdd('POST', '/backend/v1/mensalidades/gerar', (e) => {
  var body = e.requestInfo().body
  var matriculaId = body.matricula_id
  if (!matriculaId) {
    return e.json(400, { erro: 'matricula_id obrigatorio' })
  }
  var matricula = $app.findRecordById('matriculas', matriculaId)
  if (matricula.get('status') !== 'ativo') {
    return e.json(400, { erro: 'Matricula nao ativa' })
  }
  var existentes = $app.findRecordsByFilter(
    'mensalidades',
    'matricula_id = {:id}',
    'numero_parcela',
    100,
    0,
    { id: matriculaId },
  )
  if (existentes.length > 0) {
    return e.json(409, { erro: 'Ja existem mensalidades', total: existentes.length })
  }
  var col = $app.findCollectionByNameOrId('mensalidades')
  var hoje = new Date()
  var geradas = []
  for (var i = 0; i < 12; i++) {
    var venc = new Date(hoje.getFullYear(), hoje.getMonth() + i, 5)
    var rec = new Record(col)
    rec.set('matricula_id', matriculaId)
    rec.set('numero_parcela', i + 1)
    rec.set('valor', 290.0)
    rec.set('vencimento', venc.toISOString().split('T')[0])
    rec.set('status', 'pendente')
    rec.set('lembrete_enviado', false)
    $app.save(rec)
    geradas.push({ parcela: i + 1, vencimento: venc.toISOString().split('T')[0] })
  }
  return e.json(200, {
    matricula_id: matriculaId,
    total_parcelas: geradas.length,
    mensalidades: geradas,
  })
})
