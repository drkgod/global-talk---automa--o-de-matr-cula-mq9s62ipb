// Fase 2 — Conciliação bancária
routerAdd('POST', '/backend/v1/conciliacao/processar', (e) => {
  var body = e.requestInfo().body
  var lancamentos = body.lancamentos || []
  if (!lancamentos || lancamentos.length === 0) {
    return e.json(400, { erro: 'Lista vazia' })
  }
  var pendentes = $app.findRecordsByFilter(
    'mensalidades',
    "status = 'pendente' || status = 'atrasado'",
    'vencimento',
    500,
    0,
  )
  var concCol = $app.findCollectionByNameOrId('conciliacao_bancaria')
  var conciliados = 0,
    divergentes = 0,
    naoId = 0
  for (var li = 0; li < lancamentos.length; li++) {
    var lan = lancamentos[li]
    var match = null
    for (var pi = 0; pi < pendentes.length; pi++) {
      if (Math.abs(lan.valor - pendentes[pi].get('valor')) < 0.01) {
        match = pendentes[pi]
        break
      }
    }
    if (match) {
      match.set('status', 'pago')
      match.set('data_pagamento', lan.data)
      match.set('valor_pago', lan.valor)
      $app.save(match)
      var r = new Record(concCol)
      r.set('mensalidade_id', match.id)
      r.set('valor_extrato', lan.valor)
      r.set('data_extrato', lan.data)
      r.set('descricao_extrato', lan.descricao || '')
      r.set('status', 'conciliado')
      $app.save(r)
      conciliados++
    } else {
      var r2 = new Record(concCol)
      r2.set('valor_extrato', lan.valor)
      r2.set('data_extrato', lan.data)
      r2.set('descricao_extrato', lan.descricao || '')
      r2.set('status', 'nao_identificado')
      $app.save(r2)
      naoId++
    }
  }
  return e.json(200, {
    total: lancamentos.length,
    conciliados: conciliados,
    divergentes: divergentes,
    nao_identificados: naoId,
  })
})
