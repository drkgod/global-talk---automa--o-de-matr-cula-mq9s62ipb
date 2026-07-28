// Fase 2 — Grade de horários: processo documentado, importação de turmas, conflitos, Calendar
migrate(
  (app) => {
    const turmasId = app.findCollectionByNameOrId('turmas').id

    // --- professores ---
    const professores = new Collection({
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
    const professoresId = professores.id

    // --- processo_grade: documento versionado do processo de montagem (SPEC-2-001) ---
    const processoGrade = new Collection({
      name: 'processo_grade',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'versao', type: 'number', required: true, min: 1, onlyInt: true },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['rascunho', 'revisao', 'publicado'],
          maxSelect: 1,
        },
        { name: 'regras_normais', type: 'text', required: true },
        { name: 'excecoes', type: 'text' },
        { name: 'responsaveis', type: 'text', required: true },
        { name: 'revisado_por', type: 'text' },
        { name: 'data_revisao', type: 'date' },
        { name: 'created', type: 'autodate', required: false, autodateTriggers: ['onCreate'] },
        {
          name: 'updated',
          type: 'autodate',
          required: false,
          autodateTriggers: ['onCreate', 'onUpdate'],
        },
      ],
      indexes: ['CREATE INDEX idx_proc_grade_versao ON processo_grade (versao)'],
    })
    app.save(processoGrade)

    // --- grade_horarios: grade semanal versionada (SPEC-2-002) ---
    const grade = new Collection({
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
        { name: 'conflitos_detectados', type: 'bool' },
        { name: 'importacao_id', type: 'text' },
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
    const gradeId = grade.id

    // --- alocacao_professores: alocação professor→turma→horário com detecção de conflitos (SPEC-2-002) ---
    const alocacao = new Collection({
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
          collectionId: gradeId,
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
          collectionId: professoresId,
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
        { name: 'sala', type: 'text' },
        {
          name: 'modalidade',
          type: 'select',
          required: true,
          values: ['presencial', 'online'],
          maxSelect: 1,
        },
        { name: 'conflito_detectado', type: 'bool' },
        {
          name: 'tipo_conflito',
          type: 'select',
          values: ['sala', 'professor_horario', 'online_professor'],
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
        'CREATE INDEX idx_aloc_grade ON alocacao_professores (grade_id)',
        'CREATE INDEX idx_aloc_professor ON alocacao_professores (professor_id)',
        'CREATE INDEX idx_aloc_turma ON alocacao_professores (turma_id)',
      ],
    })
    app.save(alocacao)

    // --- confirmacao_professores: confirmação explícita no Calendar (SPEC-2-003) ---
    const confirmacao = new Collection({
      name: 'confirmacao_professores',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'alocacao_id',
          type: 'relation',
          required: true,
          collectionId: app.findCollectionByNameOrId('alocacao_professores').id,
          maxSelect: 1,
          cascadeDelete: true,
        },
        {
          name: 'professor_id',
          type: 'relation',
          required: true,
          collectionId: professoresId,
          maxSelect: 1,
          cascadeDelete: false,
        },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['pendente', 'confirmado', 'recusado'],
          maxSelect: 1,
        },
        { name: 'evento_calendar_id', type: 'text' },
        { name: 'data_resposta', type: 'date' },
        {
          name: 'sincronizacao_status',
          type: 'select',
          values: ['sincronizado', 'falha', 'pendente'],
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
        'CREATE INDEX idx_conf_professor ON confirmacao_professores (professor_id)',
        'CREATE INDEX idx_conf_status ON confirmacao_professores (status)',
      ],
    })
    app.save(confirmacao)
  },
  (app) => {
    var names = [
      'confirmacao_professores',
      'alocacao_professores',
      'grade_horarios',
      'processo_grade',
      'professores',
    ]
    for (var i = 0; i < names.length; i++) {
      try {
        app.delete(app.findCollectionByNameOrId(names[i]))
      } catch (e) {
        /* ignore */
      }
    }
  },
)
