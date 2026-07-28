// Fase 2 — Conciliação bancária: match de extrato com mensalidades
// POST /backend/v1/conciliacao/processar
routerAdd(
  'POST',
  '/backend/v1/conciliacao/processar',
  (e) => {
    const body = e.requestInfo().body
    const lancamentos = body.lancamentos || []

    if (!lancamentos || lancamentos.length === 0) {
      return e.json(400, { erro: 'Lista de lançamentos do extrato é obrigatória' })
    }

    // Busca mensalidades pendentes ou atrasadas
    const pendentes = $app.findRecordsByFilter(
      'mensalidades',
      "status = 'pendente' || status = 'atrasado'",
      'vencimento',
      500,
      0,
    )

    const conciliados = []
    const divergentes = []
    const naoIdentificados = []
    const concCol = $app.findCollectionByNameOrId('conciliacao_bancaria')

    lancamentos.forEach(function (lan) {
      let match = null
      for (let i = 0; i < pendentes.length; i++) {
        const mens = pendentes[i]
        const valorMens = mens.get('valor')
        if (Math.abs(lan.valor - valorMens) < 0.01) {
          match = mens
          break
        }
      }

      if (match) {
        // Marca mensalidade como paga
        match.set('status', 'pago')
        match.set('data_pagamento', lan.data)
        match.set('valor_pago', lan.valor)
        $app.save(match)

        // Registra conciliação
        const rec = new Record(concCol)
        rec.set('mensalidade_id', match.id)
        rec.set('valor_extrato', lan.valor)
        rec.set('data_extrato', lan.data)
        rec.set('descricao_extrato', lan.descricao || '')
        rec.set('status', 'conciliado')
        $app.save(rec)

        conciliados.push({
          mensalidade_id: match.id,
          parcela: match.get('numero_parcela'),
          valor: lan.valor,
          data: lan.data,
        })
      } else {
        // Tenta match aproximado (valor divergente)
        let aprox = null
        for (let i = 0; i < pendentes.length; i++) {
          const mens = pendentes[i]
          if (Math.abs(lan.valor - mens.get('valor')) < mens.get('valor') * 0.1) {
            aprox = mens
            break
          }
        }

        if (aprox) {
          const rec = new Record(concCol)
          rec.set('mensalidade_id', aprox.id)
          rec.set('valor_extrato', lan.valor)
          rec.set('data_extrato', lan.data)
          rec.set('descricao_extrato', lan.descricao || '')
          rec.set('status', 'divergente')
          rec.set(
            'observacao',
            'Valor divergente. Esperado: ' + aprox.get('valor') + ' / Pago: ' + lan.valor,
          )
          $app.save(rec)

          divergentes.push({
            mensalidade_id: aprox.id,
            valor_esperado: aprox.get('valor'),
            valor_pago: lan.valor,
            data: lan.data,
          })
        } else {
          const rec = new Record(concCol)
          rec.set('valor_extrato', lan.valor)
          rec.set('data_extrato', lan.data)
          rec.set('descricao_extrato', lan.descricao || '')
          rec.set('status', 'nao_identificado')
          $app.save(rec)

          naoIdentificados.push({
            valor: lan.valor,
            data: lan.data,
            descricao: lan.descricao || '',
          })
        }
      }
    })

    return e.json(200, {
      total_processado: lancamentos.length,
      conciliados: conciliados.length,
      divergentes: divergentes.length,
      nao_identificados: naoIdentificados.length,
      detalhes: {
        conciliados: conciliados,
        divergentes: divergentes,
        nao_identificados: naoIdentificados,
      },
    })
  },
  $apis.requireAuth(),
)
