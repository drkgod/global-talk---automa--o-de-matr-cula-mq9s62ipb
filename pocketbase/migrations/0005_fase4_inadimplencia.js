// Fase 4 — Inadimplência
migrate(
  (app) => {
    var matriculasId = app.findCollectionByNameOrId('matriculas').id
    var mensalidadesId = app.findCollectionByNameOrId('mensalidades').id

    var inadimplencia = new Collection({
      name: 'inadimplencia',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'matricula_id',
          type: 'relation',
          required: true,
          collectionId: matriculasId,
          maxSelect: 1,
          cascadeDelete: true,
        },
        {
          name: 'mensalidade_id',
          type: 'relation',
          required: true,
          collectionId: mensalidadesId,
          maxSelect: 1,
          cascadeDelete: false,
        },
        { name: 'dias_atraso', type: 'number', required: true, min: 0, onlyInt: true },
        { name: 'valor_devido', type: 'number', required: true, min: 0 },
        {
          name: 'nivel_escalonamento',
          type: 'select',
          required: true,
          values: ['lembrete', 'notificacao', 'bloqueio', 'renegociacao'],
          maxSelect: 1,
        },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['ativo', 'resolvido', 'renegociado', 'encaminhado_diretoria'],
          maxSelect: 1,
        },
        { name: 'data_resolucao', type: 'date' },
        { name: 'observacao', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_inadimp_matricula ON inadimplencia (matricula_id)',
        'CREATE INDEX idx_inadimp_status ON inadimplencia (status)',
        'CREATE INDEX idx_inadimp_nivel ON inadimplencia (nivel_escalonamento)',
      ],
    })
    app.save(inadimplencia)

    var acoes = new Collection({
      name: 'acoes_cobranca',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'inadimplencia_id',
          type: 'relation',
          required: true,
          collectionId: inadimplencia.id,
          maxSelect: 1,
          cascadeDelete: true,
        },
        {
          name: 'tipo_acao',
          type: 'select',
          required: true,
          values: [
            'lembrete_email',
            'lembrete_sms',
            'notificacao_sistema',
            'bloqueio_acesso',
            'convocacao_diretoria',
            'proposta_renegociacao',
          ],
          maxSelect: 1,
        },
        { name: 'descricao', type: 'text', required: true },
        { name: 'executada', type: 'bool' },
        { name: 'resultado', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_acoes_inadimp ON acoes_cobranca (inadimplencia_id)',
        'CREATE INDEX idx_acoes_tipo ON acoes_cobranca (tipo_acao)',
      ],
    })
    app.save(acoes)
  },
  (app) => {
    var names = ['acoes_cobranca', 'inadimplencia']
    for (var i = 0; i < names.length; i++) {
      try {
        app.delete(app.findCollectionByNameOrId(names[i]))
      } catch (e) {
        /* ignore */
      }
    }
  },
)
