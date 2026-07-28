// Fase 2 — Cobrança e conciliação
migrate(
  (app) => {
    var matriculasId = app.findCollectionByNameOrId('matriculas').id

    var mensalidades = new Collection({
      name: 'mensalidades',
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
        { name: 'numero_parcela', type: 'number', required: true, min: 1, onlyInt: true },
        { name: 'valor', type: 'number', required: true, min: 0 },
        { name: 'vencimento', type: 'date', required: true },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['pendente', 'pago', 'atrasado', 'cancelado'],
          maxSelect: 1,
        },
        { name: 'data_pagamento', type: 'date' },
        { name: 'valor_pago', type: 'number', min: 0 },
        { name: 'boleto_linha', type: 'text' },
        { name: 'lembrete_enviado', type: 'bool' },
        { name: 'created', type: 'autodate', required: false, autodateTriggers: ['onCreate'] },
        {
          name: 'updated',
          type: 'autodate',
          required: false,
          autodateTriggers: ['onCreate', 'onUpdate'],
        },
      ],
      indexes: [
        'CREATE INDEX idx_mens_matricula ON mensalidades (matricula_id)',
        'CREATE INDEX idx_mens_status ON mensalidades (status)',
        'CREATE INDEX idx_mens_vencimento ON mensalidades (vencimento)',
      ],
    })
    app.save(mensalidades)

    var conciliacao = new Collection({
      name: 'conciliacao_bancaria',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'mensalidade_id',
          type: 'relation',
          collectionId: mensalidades.id,
          maxSelect: 1,
          cascadeDelete: true,
        },
        { name: 'valor_extrato', type: 'number', required: true, min: 0 },
        { name: 'data_extrato', type: 'date', required: true },
        { name: 'descricao_extrato', type: 'text' },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['conciliado', 'divergente', 'nao_identificado'],
          maxSelect: 1,
        },
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
        'CREATE INDEX idx_conc_status ON conciliacao_bancaria (status)',
        'CREATE INDEX idx_conc_mensalidade ON conciliacao_bancaria (mensalidade_id)',
      ],
    })
    app.save(conciliacao)
  },
  (app) => {
    var names = ['conciliacao_bancaria', 'mensalidades']
    for (var i = 0; i < names.length; i++) {
      try {
        app.delete(app.findCollectionByNameOrId(names[i]))
      } catch (e) {
        /* ignore */
      }
    }
  },
)
