// Fase 5 — Consolidação
migrate(
  (app) => {
    var metricas = new Collection({
      name: 'metricas',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'nome', type: 'text', required: true },
        { name: 'valor', type: 'number', required: true },
        { name: 'unidade', type: 'text' },
        { name: 'meta', type: 'text' },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['atingido', 'parcial', 'nao_atingido', 'em_andamento'],
          maxSelect: 1,
        },
        { name: 'observacao', type: 'text' },
        { name: 'fase', type: 'select', values: ['1', '2', '3', '4', '5'], maxSelect: 1 },
        { name: 'created', type: 'autodate', onCreate: true },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_metricas_fase ON metricas (fase)'],
    })
    app.save(metricas)

    var treinamentos = new Collection({
      name: 'treinamentos',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'funcionario', type: 'text', required: true },
        {
          name: 'papel',
          type: 'select',
          required: true,
          values: ['atendente', 'coordenadora', 'financeiro', 'diretoria'],
          maxSelect: 1,
        },
        { name: 'topico', type: 'text', required: true },
        { name: 'data_treinamento', type: 'date', required: true },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['agendado', 'concluido', 'cancelado'],
          maxSelect: 1,
        },
        {
          name: 'avaliacao',
          type: 'select',
          values: ['otimo', 'bom', 'regular', 'precisa_melhorar'],
          maxSelect: 1,
        },
        { name: 'observacao', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_trein_status ON treinamentos (status)'],
    })
    app.save(treinamentos)
  },
  (app) => {
    var names = ['treinamentos', 'metricas']
    for (var i = 0; i < names.length; i++) {
      try {
        app.delete(app.findCollectionByNameOrId(names[i]))
      } catch (e) {
        /* ignore */
      }
    }
  },
)
