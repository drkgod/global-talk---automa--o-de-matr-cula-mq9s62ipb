// SPEC-4-002: Renegociação com aprovação humana obrigatória
// Rota: POST /backend/v1/renegociacao/aprovar
routerAdd(
  'POST',
  '/backend/v1/renegociacao/aprovar',
  (e) => {
    var body = e.requestInfo().body
    var renegociacaoId = body.renegociacao_id
    var aprovador = body.aprovador
    var decisao = body.decisao // 'aprovada' ou 'recusada'

    if (!renegociacaoId || !aprovador || !decisao) {
      return e.json(400, { erro: 'renegociacao_id, aprovador e decisao são obrigatórios' })
    }

    var reneg = $app.findRecordById('renegociacoes', renegociacaoId)

    // Campos obrigatórios devem estar preenchidos
    var campos = ['motivo', 'valor_original', 'valor_negociado', 'novo_prazo']
    for (var i = 0; i < campos.length; i++) {
      if (!reneg.get(campos[i]) && reneg.get(campos[i]) !== 0) {
        return e.json(400, { erro: 'Campo obrigatório ausente: ' + campos[i] })
      }
    }

    // Somente resposta explícita altera o status
    if (decisao !== 'aprovada' && decisao !== 'recusada') {
      return e.json(400, { erro: 'Decisão inválida. Use "aprovada" ou "recusada".' })
    }

    reneg.set('status', decisao)
    reneg.set('aprovador', aprovador)
    reneg.set('data_aprovacao', new Date().toISOString().split('T')[0])
    $app.save(reneg)

    if (decisao === 'aprovada') {
      // Atualiza inadimplência para renegociado
      var inadimp = $app.findRecordById('inadimplencia', reneg.get('inadimplencia_id'))
      inadimp.set('status', 'renegociado')
      inadimp.set('data_resolucao', new Date().toISOString().split('T')[0])
      $app.save(inadimp)
    }

    return e.json(200, {
      renegociacao_id: renegociacaoId,
      status: decisao,
      aprovador: aprovador,
      mensagem:
        decisao === 'aprovada'
          ? 'Renegociação aprovada por ' + aprovador + '. Caso atualizado.'
          : 'Renegociação recusada por ' + aprovador + '. Caso permanece inadimplente.',
    })
  },
  $apis.requireAuth(),
)
