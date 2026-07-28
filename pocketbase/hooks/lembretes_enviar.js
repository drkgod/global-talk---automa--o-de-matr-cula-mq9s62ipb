// SPEC-3-002: Envio de lembretes de cobrança (pré-aviso 5 dias antes, lembrete no vencimento)
// Rota: POST /backend/v1/lembretes/enviar
routerAdd(
  'POST',
  '/backend/v1/lembretes/enviar',
  (e) => {
    var hoje = new Date()
    var lembretesCol = $app.findCollectionByNameOrId('lembretes_cobranca')
    var enviados = 0
    var agendados = 0
    var falhas = 0

    // Busca mensalidades pendentes
    var mensalidades = $app.findRecordsByFilter(
      'mensalidades',
      'status = {:status}',
      'vencimento',
      500,
      0,
      { status: 'pendente' },
    )

    for (var i = 0; i < mensalidades.length; i++) {
      var mens = mensalidades[i]
      var venc = new Date(mens.get('vencimento'))
      var diffDias = Math.ceil((venc - hoje) / (1000 * 60 * 60 * 24))

      // Pré-aviso: 5 dias antes do vencimento
      if (diffDias === 5 && !mens.get('pre_aviso_enviado')) {
        var lembrete = new Record(lembretesCol)
        lembrete.set('mensalidade_id', mens.id)
        lembrete.set('tipo', 'pre_aviso')
        lembrete.set('data_agendada', hoje.toISOString().split('T')[0])
        lembrete.set('status', 'enviado')
        lembrete.set('canal', 'email')
        lembrete.set('data_envio', hoje.toISOString().split('T')[0])
        lembrete.set('template_usado', 'pre_aviso_vencimento')
        $app.save(lembrete)
        mens.set('pre_aviso_enviado', true)
        $app.save(mens)
        enviados++
      }

      // Lembrete no vencimento
      if (diffDias === 0 && !mens.get('lembrete_enviado')) {
        var lembrete2 = new Record(lembretesCol)
        lembrete2.set('mensalidade_id', mens.id)
        lembrete2.set('tipo', 'lembrete_vencimento')
        lembrete2.set('data_agendada', hoje.toISOString().split('T')[0])
        lembrete2.set('status', 'enviado')
        lembrete2.set('canal', 'email')
        lembrete2.set('data_envio', hoje.toISOString().split('T')[0])
        lembrete2.set('template_usado', 'lembrete_vencimento')
        $app.save(lembrete2)
        mens.set('lembrete_enviado', true)
        $app.save(mens)
        enviados++
      }

      // Marca como atrasado se passou do vencimento
      if (diffDias < 0 && mens.get('status') === 'pendente') {
        mens.set('status', 'atrasado')
        $app.save(mens)
      }
    }

    return e.json(200, {
      enviados: enviados,
      agendados: agendados,
      falhas: falhas,
      mensagem: 'Lembretes processados. ' + enviados + ' enviados.',
    })
  },
  $apis.requireAuth(),
)
