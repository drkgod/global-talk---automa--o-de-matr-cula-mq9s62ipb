// Fase 4 — Escalonamento de inadimplência, renegociação, decisão SchoolManager
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
          values: ['cobranca_inicial', 'reenvio_3d', 'escala_15d_diretoria'],
          maxSelect: 1,
        },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['ativo', 'pago_durante_fluxo', 'escalado_diretoria', 'renegociado', 'encerrado'],
          maxSelect: 1,
        },
        { name: 'data_cobranca_inicial', type: 'date' },
        { name: 'data_reenvio', type: 'date' },
        { name: 'data_escala_diretoria', type: 'date' },
        { name: 'data_resolucao', type: 'date' },
        { name: 'observacao', type: 'text' },
        { name: 'created', type: 'autodate', required: false, autodateTriggers: ['onCreate'] },
        {
          name: 'updated',
          type: 'autodate',
          required: false,
          autodateTriggers: ['onCreate', 'onUpdate'],
        },
      ],
      indexes: [
        'CREATE INDEX idx_inadimp_matricula ON inadimplencia (matricula_id)',
        'CREATE INDEX idx_inadimp_status ON inadimplencia (status)',
        'CREATE INDEX idx_inadimp_nivel ON inadimplencia (nivel_escalonamento)',
      ],
    })
    app.save(inadimplencia)
    var inadimplenciaId = inadimplencia.id

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
          collectionId: inadimplenciaId,
          maxSelect: 1,
          cascadeDelete: true,
        },
        {
          name: 'tipo_acao',
          type: 'select',
          required: true,
          values: ['cobranca_inicial', 'reenvio_3d', 'escala_diretoria'],
          maxSelect: 1,
        },
        { name: 'descricao', type: 'text', required: true },
        { name: 'data_execucao', type: 'date', required: true },
        { name: 'executada', type: 'bool' },
        { name: 'resultado', type: 'text' },
        { name: 'erro_mensagem', type: 'text' },
        { name: 'created', type: 'autodate', required: false, autodateTriggers: ['onCreate'] },
        {
          name: 'updated',
          type: 'autodate',
          required: false,
          autodateTriggers: ['onCreate', 'onUpdate'],
        },
      ],
      indexes: [
        'CREATE INDEX idx_acoes_inadimp ON acoes_cobranca (inadimplencia_id)',
        'CREATE INDEX idx_acoes_tipo ON acoes_cobranca (tipo_acao)',
      ],
    })
    app.save(acoes)

    var renegociacoes = new Collection({
      name: 'renegociacoes',
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
          collectionId: inadimplenciaId,
          maxSelect: 1,
          cascadeDelete: true,
        },
        { name: 'motivo', type: 'text', required: true },
        { name: 'valor_original', type: 'number', required: true, min: 0 },
        { name: 'valor_negociado', type: 'number', required: true, min: 0 },
        { name: 'novo_prazo', type: 'date', required: true },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['proposta', 'aprovada', 'recusada', 'cancelada'],
          maxSelect: 1,
        },
        { name: 'aprovador', type: 'text' },
        { name: 'data_aprovacao', type: 'date' },
        { name: 'observacao', type: 'text' },
        { name: 'created', type: 'autodate', required: false, autodateTriggers: ['onCreate'] },
        {
          name: 'updated',
          type: 'autodate',
          required: false,
          autodateTriggers: ['onCreate', 'onUpdate'],
        },
      ],
      indexes: [
        'CREATE INDEX idx_reneg_inadimp ON renegociacoes (inadimplencia_id)',
        'CREATE INDEX idx_reneg_status ON renegociacoes (status)',
      ],
    })
    app.save(renegociacoes)

    var decisao = new Collection({
      name: 'decisao_schoolmanager',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'decisao',
          type: 'select',
          required: true,
          values: ['manter_lote', 'api_direta', 'contingencia_interna', 'pendente'],
          maxSelect: 1,
        },
        { name: 'justificativa', type: 'text', required: true },
        { name: 'evidencia_spike', type: 'text' },
        { name: 'criterios_atendidos', type: 'text' },
        { name: 'impacto', type: 'text' },
        { name: 'responsavel', type: 'text' },
        { name: 'plano_rollback', type: 'text' },
        { name: 'data_decisao', type: 'date' },
        { name: 'created', type: 'autodate', required: false, autodateTriggers: ['onCreate'] },
        {
          name: 'updated',
          type: 'autodate',
          required: false,
          autodateTriggers: ['onCreate', 'onUpdate'],
        },
      ],
      indexes: ['CREATE INDEX idx_decisao_sm ON decisao_schoolmanager (decisao)'],
    })
    app.save(decisao)
  },
  (app) => {
    var names = ['decisao_schoolmanager', 'renegociacoes', 'acoes_cobranca', 'inadimplencia']
    for (var i = 0; i < names.length; i++) {
      try {
        app.delete(app.findCollectionByNameOrId(names[i]))
      } catch (e) {
        /* ignore */
      }
    }
  },
)
