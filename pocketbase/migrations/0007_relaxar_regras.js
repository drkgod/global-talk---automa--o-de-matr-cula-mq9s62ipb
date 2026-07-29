// Relaxar regras de acesso para demo (sem auth necessária)
migrate(
  (app) => {
    var collections = [
      'matriculas',
      'turmas',
      'questoes_prova',
      'prova_respostas',
      'pacotes_importacao',
      'contratos',
      'pagamentos',
      'notificacoes_coordenadora',
      'mensalidades',
      'conciliacao_bancaria',
      'professores',
      'grade_horarios',
      'alocacao_professores',
      'inadimplencia',
      'acoes_cobranca',
      'metricas',
      'treinamentos',
    ]
    for (var i = 0; i < collections.length; i++) {
      try {
        var col = app.findCollectionByNameOrId(collections[i])
        col.listRule = ''
        col.viewRule = ''
        col.createRule = ''
        col.updateRule = ''
        col.deleteRule = ''
        app.save(col)
      } catch (e) {
        /* ok */
      }
    }
  },
  (app) => {
    // noop
  },
)
