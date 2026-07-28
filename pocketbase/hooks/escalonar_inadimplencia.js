// Fase 4 — Escalonar inadimplência (cron diário)
// Verifica mensalidades atrasadas e cria/atualiza registros de inadimplência
cronAdd('escalonar_inadimplencia', '0 8 * * *', function () {
  const hoje = new Date()
  let processadas = 0

  // Busca mensalidades vencidas e não pagas
  const vencidas = $app.findRecordsByFilter(
    'mensalidades',
    "status = 'pendente'",
    'vencimento',
    500,
    0,
  )

  vencidas.forEach(function (mens) {
    const venc = new Date(mens.get('vencimento'))
    if (venc >= hoje) return

    const diffMs = hoje - venc
    const diasAtraso = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    if (diasAtraso <= 0) return

    // Marca mensalidade como atrasada
    mens.set('status', 'atrasado')
    $app.save(mens)

    // Verifica se já existe registro de inadimplência
    let inadimp
    try {
      inadimp = $app.findFirstRecordByData('inadimplencia', 'mensalidade_id', mens.id)
    } catch (_) {
      // Cria novo registro
      const inadCol = $app.findCollectionByNameOrId('inadimplencia')
      inadimp = new Record(inadCol)
      inadimp.set('matricula_id', mens.get('matricula_id'))
      inadimp.set('mensalidade_id', mens.id)
      inadimp.set('valor_devido', mens.get('valor'))
      inadimp.set('status', 'ativo')
    }

    inadimp.set('dias_atraso', diasAtraso)

    // Escalonamento automático por dias de atraso
    let nivel = 'lembrete'
    if (diasAtraso > 30) nivel = 'renegociacao'
    else if (diasAtraso > 15) nivel = 'bloqueio'
    else if (diasAtraso > 7) nivel = 'notificacao'

    inadimp.set('nivel_escalonamento', nivel)
    $app.save(inadimp)

    // Registra ação de cobrança
    const acoesCol = $app.findCollectionByNameOrId('acoes_cobranca')
    const acao = new Record(acoesCol)
    acao.set('inadimplencia_id', inadimp.id)
    acao.set('executada', true)

    if (nivel === 'lembrete') {
      acao.set('tipo_acao', 'lembrete_email')
      acao.set('descricao', 'Lembrete automático enviado por e-mail. Dias de atraso: ' + diasAtraso)
    } else if (nivel === 'notificacao') {
      acao.set('tipo_acao', 'notificacao_sistema')
      acao.set('descricao', 'Notificação no sistema. Dias de atraso: ' + diasAtraso)
    } else if (nivel === 'bloqueio') {
      acao.set('tipo_acao', 'bloqueio_acesso')
      acao.set(
        'descricao',
        'Acesso bloqueado. Dias de atraso: ' + diasAtraso + '. Encaminhado para diretoria.',
      )
    } else if (nivel === 'renegociacao') {
      acao.set('tipo_acao', 'convocacao_diretoria')
      acao.set(
        'descricao',
        'Convocação da diretoria para renegociação. Dias de atraso: ' + diasAtraso,
      )
      // Nenhuma renegociação é automática — sempre passa pela diretora
      inadimp.set('status', 'encaminhado_diretoria')
      $app.save(inadimp)
    }

    $app.save(acao)
    processadas++
  })

  console.log('Inadimplência processada: ' + processadas + ' mensalidade(s) atrasada(s)')
})
