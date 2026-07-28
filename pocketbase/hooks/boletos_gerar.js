// SPEC-3-001: Geração de boletos recorrentes em lote idempotente
// Rota: POST /backend/v1/boletos/gerar
routerAdd(
  'POST',
  '/backend/v1/boletos/gerar',
  (e) => {
    var body = e.requestInfo().body
    var mes = body.mes
    var ano = body.ano
    if (!mes || !ano) {
      return e.json(400, { erro: 'mes e ano são obrigatórios' })
    }

    var loteId = 'lote_' + ano + '_' + mes + '_' + Date.now()
    var mensalidadesCol = $app.findCollectionByNameOrId('mensalidades')

    // Seleciona alunos ativos
    var matriculasAtivas = $app.findRecordsByFilter(
      'matriculas',
      'status = {:status}',
      'created',
      500,
      0,
      { status: 'ativo' },
    )

    var gerados = 0
    var pendentes = 0
    var duplicatasEvitadas = 0

    for (var i = 0; i < matriculasAtivas.length; i++) {
      var mat = matriculasAtivas[i]

      // Idempotência: verifica se já existe mensalidade para este mês/ano
      var existentes = $app.findRecordsByFilter(
        'mensalidades',
        'matricula_id = {:matId}',
        'created',
        50,
        0,
        { matId: mat.id },
      )

      var jaExiste = false
      for (var j = 0; j < existentes.length; j++) {
        var venc = existentes[j].get('vencimento')
        if (venc) {
          var d = new Date(venc)
          if (d.getMonth() + 1 === parseInt(mes) && d.getFullYear() === parseInt(ano)) {
            jaExiste = true
            duplicatasEvitadas++
            break
          }
        }
      }
      if (jaExiste) continue

      // Gera boleto: vencimento no dia 25 do mês
      var vencimento = ano + '-' + (mes.length === 1 ? '0' + mes : mes) + '-25'
      var valor = 290.0

      var rec = new Record(mensalidadesCol)
      rec.set('matricula_id', mat.id)
      rec.set('numero_parcela', 1)
      rec.set('valor', valor)
      rec.set('vencimento', vencimento)
      rec.set('status', 'pendente')
      rec.set('boleto_id', 'bol_' + mat.id + '_' + ano + mes)
      rec.set('lote_id', loteId)
      rec.set('lembrete_enviado', false)
      rec.set('pre_aviso_enviado', false)
      $app.save(rec)
      gerados++
    }

    return e.json(200, {
      lote_id: loteId,
      gerados: gerados,
      pendentes: pendentes,
      duplicatas_evitadas: duplicatasEvitadas,
      total_ativos: matriculasAtivas.length,
      mensagem:
        'Lote gerado. ' +
        gerados +
        ' boletos criados, ' +
        duplicatasEvitadas +
        ' duplicatas evitadas.',
    })
  },
  $apis.requireAuth(),
)
