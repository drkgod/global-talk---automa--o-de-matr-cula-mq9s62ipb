// SPEC-3-003: Conciliação bancária — importação de extrato + match por identificador/valor
// Rota: POST /backend/v1/conciliacao/importar
routerAdd(
  'POST',
  '/backend/v1/conciliacao/importar',
  (e) => {
    var body = e.requestInfo().body
    var extrato = body.extrato || []
    if (extrato.length === 0) {
      return e.json(400, { erro: 'Extrato vazio' })
    }

    var conciliacaoCol = $app.findCollectionByNameOrId('conciliacao_bancaria')
    var loteId = 'conc_' + Date.now()
    var conciliados = 0
    var divergentes = 0
    var parciais = 0
    var ambiguos = 0
    var naoIdentificados = 0

    for (var i = 0; i < extrato.length; i++) {
      var linha = extrato[i]
      var status = 'nao_identificado'
      var metodo = ''
      var mensalidadeId = ''
      var matriculaId = ''
      var observacao = ''

      // 1. Tenta match por identificador (boleto_id na descrição)
      if (linha.descricao) {
        var mensalidades = $app.findRecordsByFilter(
          'mensalidades',
          'status = {:st}',
          'vencimento',
          500,
          0,
          { st: 'pendente' },
        )
        for (var j = 0; j < mensalidades.length; j++) {
          var mens = mensalidades[j]
          var bolId = mens.get('boleto_id') || ''
          if (bolId && linha.descricao.indexOf(bolId) >= 0) {
            mensalidadeId = mens.id
            matriculaId = mens.get('matricula_id')
            status = 'conciliado'
            metodo = 'identificador'
            mens.set('status', 'pago')
            mens.set('data_pagamento', linha.data)
            mens.set('valor_pago', linha.valor)
            $app.save(mens)
            break
          }
        }
      }

      // 2. Tenta match por valor + janela de tempo
      if (status === 'nao_identificado') {
        var dataExtrato = new Date(linha.data)
        var mensalidades2 = $app.findRecordsByFilter(
          'mensalidades',
          'status = {:st}',
          'vencimento',
          500,
          0,
          { st: 'pendente' },
        )
        var matches = []
        for (var k = 0; k < mensalidades2.length; k++) {
          var mens2 = mensalidades2[k]
          var valorEsp = mens2.get('valor')
          var venc = new Date(mens2.get('vencimento'))
          var diff = Math.abs((dataExtrato - venc) / (1000 * 60 * 60 * 24))
          if (Math.abs(valorEsp - linha.valor) < 0.01 && diff <= 10) {
            matches.push(mens2)
          }
        }
        if (matches.length === 1) {
          mensalidadeId = matches[0].id
          matriculaId = matches[0].get('matricula_id')
          metodo = 'valor_janela'
          if (linha.nome_pagador && matches[0].get('matricula_id')) {
            var mat = $app.findRecordById('matriculas', matches[0].get('matricula_id'))
            var nomeAluno = (mat.get('nome') || '').toLowerCase()
            var nomePag = (linha.nome_pagador || '').toLowerCase()
            if (nomeAluno && nomePag && nomeAluno !== nomePag) {
              status = 'divergente'
              observacao =
                'Nome divergente: extrato="' +
                linha.nome_pagador +
                '" / aluno="' +
                mat.get('nome') +
                '"'
            } else {
              status = 'conciliado'
            }
          } else {
            status = 'conciliado'
          }
          if (status === 'conciliado' || status === 'divergente') {
            matches[0].set('status', 'pago')
            matches[0].set('data_pagamento', linha.data)
            matches[0].set('valor_pago', linha.valor)
            $app.save(matches[0])
          }
        } else if (matches.length > 1) {
          status = 'ambiguo'
          metodo = 'valor_janela'
          observacao = 'Múltiplos matches encontrados (' + matches.length + '). Fila manual.'
        }
      }

      // 3. Pagamento parcial
      if (status === 'nao_identificado' && linha.valor > 0) {
        var mensalidades3 = $app.findRecordsByFilter(
          'mensalidades',
          'status = {:st}',
          'vencimento',
          500,
          0,
          { st: 'pendente' },
        )
        for (var n = 0; n < mensalidades3.length; n++) {
          if (linha.valor < mensalidades3[n].get('valor') * 0.95) {
            status = 'parcial'
            observacao =
              'Pagamento parcial: R$ ' + linha.valor + ' de R$ ' + mensalidades3[n].get('valor')
            break
          }
        }
      }

      if (status === 'conciliado') conciliados++
      else if (status === 'divergente') divergentes++
      else if (status === 'parcial') parciais++
      else if (status === 'ambiguo') ambiguos++
      else naoIdentificados++

      var rec = new Record(conciliacaoCol)
      rec.set('mensalidade_id', mensalidadeId)
      rec.set('matricula_id', matriculaId)
      rec.set('valor_extrato', linha.valor)
      rec.set('data_extrato', linha.data)
      rec.set('descricao_extrato', linha.descricao || '')
      rec.set('nome_pagador_extrato', linha.nome_pagador || '')
      rec.set('status', status)
      rec.set('metodo_match', metodo)
      rec.set('observacao', observacao)
      rec.set('lote_importacao', loteId)
      $app.save(rec)
    }

    return e.json(200, {
      lote_id: loteId,
      total: extrato.length,
      conciliados: conciliados,
      divergentes: divergentes,
      parciais: parciais,
      ambiguos: ambiguos,
      nao_identificados: naoIdentificados,
      mensagem:
        'Conciliação concluída. ' +
        conciliados +
        ' conciliados, ' +
        ambiguos +
        ' ambíguos na fila manual.',
    })
  },
  $apis.requireAuth(),
)
