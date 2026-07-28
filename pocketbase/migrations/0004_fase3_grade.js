// Fase 3 — Grade de horários
migrate(
  (app) => {
    var turmasId = app.findCollectionByNameOrId('turmas').id

    var professores = new Collection({
      name: 'professores',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'nome', type: 'text', required: true },
        { name: 'email', type: 'email' },
        { name: 'telefone', type: 'text' },
        { name: 'idiomas', type: 'text', required: true },
        { name: 'disponibilidade', type: 'json' },
        { name: 'ativo', type: 'bool' },
        { name: 'created', type: 'autodate', required: false, autodateTriggers: ['onCreate'] },
        {
          name: 'updated',
          type: 'autodate',
          required: false,
          autodateTriggers: ['onCreate', 'onUpdate'],
        },
      ],
      indexes: ['CREATE INDEX idx_prof_ativo ON professores (ativo)'],
    })
    app.save(professores)

    var grade = new Collection({
      name: 'grade_horarios',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'semana_inicio', type: 'date', required: true },
        { name: 'semana_fim', type: 'date', required: true },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['rascunho', 'publicada', 'arquivada'],
          maxSelect: 1,
        },
        { name: 'versao', type: 'number', required: true, min: 1, onlyInt: true },
        { name: 'criada_por', type: 'text' },
        { name: 'created', type: 'autodate', required: false, autodateTriggers: ['onCreate'] },
        {
          name: 'updated',
          type: 'autodate',
          required: false,
          autodateTriggers: ['onCreate', 'onUpdate'],
        },
      ],
      indexes: [
        'CREATE INDEX idx_grade_semana ON grade_horarios (semana_inicio)',
        'CREATE INDEX idx_grade_status ON grade_horarios (status)',
      ],
    })
    app.save(grade)

    var alocacao = new Collection({
      name: 'alocacao_professores',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'grade_id',
          type: 'relation',
          required: true,
          collectionId: grade.id,
          maxSelect: 1,
          cascadeDelete: true,
        },
        {
          name: 'turma_id',
          type: 'relation',
          required: true,
          collectionId: turmasId,
          maxSelect: 1,
          cascadeDelete: false,
        },
        {
          name: 'professor_id',
          type: 'relation',
          required: true,
          collectionId: professores.id,
          maxSelect: 1,
          cascadeDelete: false,
        },
        {
          name: 'dia_semana',
          type: 'select',
          required: true,
          values: ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'],
          maxSelect: 1,
        },
        { name: 'horario_inicio', type: 'text', required: true },
        { name: 'horario_fim', type: 'text', required: true },
        { name: 'conflito_detectado', type: 'bool' },
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
        'CREATE INDEX idx_aloc_grade ON alocacao_professores (grade_id)',
        'CREATE INDEX idx_aloc_professor ON alocacao_professores (professor_id)',
        'CREATE INDEX idx_aloc_turma ON alocacao_professores (turma_id)',
      ],
    })
    app.save(alocacao)
  },
  (app) => {
    var names = ['alocacao_professores', 'grade_horarios', 'professores']
    for (var i = 0; i < names.length; i++) {
      try {
        app.delete(app.findCollectionByNameOrId(names[i]))
      } catch (e) {
        /* ignore */
      }
    }
  },
)
