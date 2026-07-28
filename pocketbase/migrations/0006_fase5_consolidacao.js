// Fase 5 — Consolidação: capacitação, reset IA, métricas finais e handoff
migrate(
  (app) => {
    // --- treinamentos: trilhas de capacitação por papel (SPEC-5-001) ---
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
        { name: 'trilha_indicada', type: 'text' },
        { name: 'data_treinamento', type: 'date', required: true },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['agendado', 'concluido', 'cancelado'],
          maxSelect: 1,
        },
        { name: 'progresso_pct', type: 'number', min: 0, max: 100, onlyInt: true },
        {
          name: 'avaliacao',
          type: 'select',
          values: ['otimo', 'bom', 'regular', 'precisa_melhorar'],
          maxSelect: 1,
        },
        { name: 'autonomia_demonstrada', type: 'bool' },
        { name: 'lacunas_identificadas', type: 'text' },
        { name: 'observacao', type: 'text' },
        { name: 'created', type: 'autodate', required: false, autodateTriggers: ['onCreate'] },
        {
          name: 'updated',
          type: 'autodate',
          required: false,
          autodateTriggers: ['onCreate', 'onUpdate'],
        },
      ],
      indexes: ['CREATE INDEX idx_trein_status ON treinamentos (status)'],
    })
    app.save(treinamentos)

    // --- reset_ia: comunicação formal sobre ausência de IA (SPEC-5-002) ---
    var resetIa = new Collection({
      name: 'reset_ia',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'destinatario', type: 'text', required: true },
        { name: 'canal', type: 'text', required: true },
        { name: 'data_envio', type: 'date', required: true },
        { name: 'escopo_entregue', type: 'text', required: true },
        { name: 'limites_declarados', type: 'text', required: true },
        { name: 'evolucoes_futuras_ia', type: 'text' },
        { name: 'confirmacao_recebida', type: 'bool' },
        { name: 'data_confirmacao', type: 'date' },
        { name: 'duvidas_registradas', type: 'text' },
        { name: 'observacao', type: 'text' },
        { name: 'created', type: 'autodate', required: false, autodateTriggers: ['onCreate'] },
        {
          name: 'updated',
          type: 'autodate',
          required: false,
          autodateTriggers: ['onCreate', 'onUpdate'],
        },
      ],
      indexes: ['CREATE INDEX idx_reset_ia ON reset_ia (confirmacao_recebida)'],
    })
    app.save(resetIa)

    // --- metricas_finais: medições antes/depois (SPEC-5-003) ---
    var metricas = new Collection({
      name: 'metricas_finais',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'nome', type: 'text', required: true },
        {
          name: 'categoria',
          type: 'select',
          required: true,
          values: ['matricula', 'grade', 'inadimplencia'],
          maxSelect: 1,
        },
        { name: 'baseline', type: 'text' },
        { name: 'valor_real', type: 'text' },
        { name: 'unidade', type: 'text' },
        { name: 'metodo_medicao', type: 'text' },
        { name: 'janela_medicao', type: 'text' },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['medido', 'nao_medido', 'parcial'],
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
      indexes: ['CREATE INDEX idx_metricas_cat ON metricas_finais (categoria)'],
    })
    app.save(metricas)

    // --- handoff: recibo de handoff do projeto (SPEC-5-003) ---
    var handoff = new Collection({
      name: 'handoff',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'responsavel', type: 'text', required: true },
        { name: 'data_handoff', type: 'date', required: true },
        { name: 'documentacao_entregue', type: 'text' },
        { name: 'proximos_passos', type: 'text' },
        { name: 'confirmacao_escrita', type: 'bool' },
        { name: 'data_confirmacao', type: 'date' },
        { name: 'observacao', type: 'text' },
        { name: 'created', type: 'autodate', required: false, autodateTriggers: ['onCreate'] },
        {
          name: 'updated',
          type: 'autodate',
          required: false,
          autodateTriggers: ['onCreate', 'onUpdate'],
        },
      ],
      indexes: ['CREATE INDEX idx_handoff ON handoff (data_handoff)'],
    })
    app.save(handoff)
  },
  (app) => {
    var names = ['handoff', 'metricas_finais', 'reset_ia', 'treinamentos']
    for (var i = 0; i < names.length; i++) {
      try {
        app.delete(app.findCollectionByNameOrId(names[i]))
      } catch (e) {
        /* ignore */
      }
    }
  },
)
