// Fase 3 — Cobrança e conciliação: boletos recorrentes, lembretes, conciliação bancária
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
        { name: 'boleto_id', type: 'text' },
        { name: 'lote_id', type: 'text' },
        { name: 'lembrete_enviado', type: 'bool' },
        { name: 'pre_aviso_enviado', type: 'bool' },
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
        'CREATE INDEX idx_mens_lote ON mensalidades (lote_id)',
      ],
    })
    app.save(mensalidades)
    var mensalidadesId = mensalidades.id

    var lembretes = new Collection({
      name: 'lembretes_cobranca',
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
          required: true,
          collectionId: mensalidadesId,
          maxSelect: 1,
          cascadeDelete: true,
        },
        {
          name: 'tipo',
          type: 'select',
          required: true,
          values: ['pre_aviso', 'lembrete_vencimento'],
          maxSelect: 1,
        },
        { name: 'data_agendada', type: 'date', required: true },
        { name: 'data_envio', type: 'date' },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['agendado', 'enviado', 'falhou'],
          maxSelect: 1,
        },
        { name: 'canal', type: 'select', values: ['email', 'sms', 'whatsapp'], maxSelect: 1 },
        { name: 'template_usado', type: 'text' },
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
        'CREATE INDEX idx_lembr_status ON lembretes_cobranca (status)',
        'CREATE INDEX idx_lembr_mensalidade ON lembretes_cobranca (mensalidade_id)',
        'CREATE INDEX idx_lembr_agendada ON lembretes_cobranca (data_agendada)',
      ],
    })
    app.save(lembretes)

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
          collectionId: mensalidadesId,
          maxSelect: 1,
          cascadeDelete: false,
        },
        {
          name: 'matricula_id',
          type: 'relation',
          collectionId: matriculasId,
          maxSelect: 1,
          cascadeDelete: false,
        },
        { name: 'valor_extrato', type: 'number', required: true, min: 0 },
        { name: 'data_extrato', type: 'date', required: true },
        { name: 'descricao_extrato', type: 'text' },
        { name: 'nome_pagador_extrato', type: 'text' },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['conciliado', 'divergente', 'parcial', 'ambiguo', 'nao_identificado'],
          maxSelect: 1,
        },
        {
          name: 'metodo_match',
          type: 'select',
          values: ['identificador', 'valor_nome', 'valor_janela', 'manual'],
          maxSelect: 1,
        },
        { name: 'observacao', type: 'text' },
        { name: 'lote_importacao', type: 'text' },
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
        'CREATE INDEX idx_conc_lote ON conciliacao_bancaria (lote_importacao)',
      ],
    })
    app.save(conciliacao)
  },
  (app) => {
    var names = ['conciliacao_bancaria', 'lembretes_cobranca', 'mensalidades']
    for (var i = 0; i < names.length; i++) {
      try {
        app.delete(app.findCollectionByNameOrId(names[i]))
      } catch (e) {
        /* ignore */
      }
    }
  },
)
