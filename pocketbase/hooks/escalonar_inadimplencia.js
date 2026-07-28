// Fase 4 — Escalonar inadimplencia (cron diario)
cronAdd('escalonar_inadimplencia', '0 8 * * *', function () {
  var hoje = new Date()
  var processadas = 0
  var vencidas = $app.findRecordsByFilter(
    'mensalidades',
    "status = 'pendente'",
    'vencimento',
    500,
    0,
  )
  for (var i = 0; i < vencidas.length; i++) {
    var mens = vencidas[i]
    var venc = new Date(mens.get('vencimento'))
    if (venc >= hoje) {
      continue
    }
    var dias = Math.floor((hoje - venc) / 86400000)
    if (dias <= 0) {
      continue
    }
    mens.set('status', 'atrasado')
    $app.save(mens)
    var inadimp
    try {
      inadimp = $app.findFirstRecordByData('inadimplencia', 'mensalidade_id', mens.id)
    } catch (_) {
      var inadCol = $app.findCollectionByNameOrId('inadimplencia')
      inadimp = new Record(inadCol)
      inadimp.set('matricula_id', mens.get('matricula_id'))
      inadimp.set('mensalidade_id', mens.id)
      inadimp.set('valor_devido', mens.get('valor'))
      inadimp.set('status', 'ativo')
    }
    inadimp.set('dias_atraso', dias)
    var nivel = 'lembrete'
    if (dias > 30) {
      nivel = 'renegociacao'
    } else if (dias > 15) {
      nivel = 'bloqueio'
    } else if (dias > 7) {
      nivel = 'notificacao'
    }
    inadimp.set('nivel_escalonamento', nivel)
    $app.save(inadimp)
    var acoesCol = $app.findCollectionByNameOrId('acoes_cobranca')
    var acao = new Record(acoesCol)
    acao.set('inadimplencia_id', inadimp.id)
    acao.set('executada', true)
    if (nivel === 'lembrete') {
      acao.set('tipo_acao', 'lembrete_email')
      acao.set('descricao', 'Lembrete. Dias: ' + dias)
    } else if (nivel === 'notificacao') {
      acao.set('tipo_acao', 'notificacao_sistema')
      acao.set('descricao', 'Notificacao. Dias: ' + dias)
    } else if (nivel === 'bloqueio') {
      acao.set('tipo_acao', 'bloqueio_acesso')
      acao.set('descricao', 'Bloqueio. Dias: ' + dias)
    } else {
      acao.set('tipo_acao', 'convocacao_diretoria')
      acao.set('descricao', 'Diretoria. Dias: ' + dias)
      inadimp.set('status', 'encaminhado_diretoria')
      $app.save(inadimp)
    }
    $app.save(acao)
    processadas++
  }
  console.log('Inadimplencia processada: ' + processadas)
})
