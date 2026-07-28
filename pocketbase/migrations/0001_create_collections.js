migrate(
  (app) => {
    // ─── TURMAS ───
    const turmas = new Collection({
      name: 'turmas',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'nivel',
          type: 'select',
          required: true,
          values: ['basico', 'intermediario', 'avancado'],
          maxSelect: 1,
        },
        { name: 'curso', type: 'text', required: true },
        { name: 'horario', type: 'text', required: true },
        { name: 'vagas_total', type: 'number', required: true, min: 0, onlyInt: true },
        { name: 'vagas_disponiveis', type: 'number', required: true, min: 0, onlyInt: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_turmas_nivel ON turmas (nivel)',
        'CREATE INDEX idx_turmas_curso_horario ON turmas (curso, horario)',
      ],
    })
    app.save(turmas)

    // ─── MATRÍCULAS ───
    const turmasId = app.findCollectionByNameOrId('turmas').id
    const matriculas = new Collection({
      name: 'matriculas',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: '',
      updateRule: '',
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'sessao_id', type: 'text' },
        { name: 'nome', type: 'text' },
        { name: 'cpf', type: 'text' },
        { name: 'endereco', type: 'text' },
        { name: 'telefone', type: 'text' },
        { name: 'curso_pretendido', type: 'text' },
        { name: 'horario_pretendido', type: 'text' },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['rascunho', 'formulario_concluido', 'prova_concluida', 'pendente', 'ativo'],
          maxSelect: 1,
        },
        {
          name: 'nivel',
          type: 'select',
          values: ['basico', 'intermediario', 'avancado'],
          maxSelect: 1,
        },
        {
          name: 'turma_id',
          type: 'relation',
          collectionId: turmasId,
          maxSelect: 1,
          cascadeDelete: false,
        },
        { name: 'horario_alternativo_oferecido', type: 'bool' },
        { name: 'valor_matricula', type: 'number', min: 0 },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        "CREATE UNIQUE INDEX idx_matriculas_cpf ON matriculas (cpf) WHERE cpf IS NOT NULL AND cpf != ''",
        'CREATE INDEX idx_matriculas_sessao ON matriculas (sessao_id)',
        'CREATE INDEX idx_matriculas_status ON matriculas (status)',
      ],
    })
    app.save(matriculas)

    // ─── QUESTÕES DA PROVA ───
    const questoes = new Collection({
      name: 'questoes_prova',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'ordem', type: 'number', required: true, min: 1, onlyInt: true },
        { name: 'enunciado', type: 'text', required: true },
        { name: 'opcao_a', type: 'text', required: true },
        { name: 'opcao_b', type: 'text', required: true },
        { name: 'opcao_c', type: 'text', required: true },
        { name: 'opcao_d', type: 'text', required: true },
        {
          name: 'resposta_correta',
          type: 'select',
          required: true,
          values: ['a', 'b', 'c', 'd'],
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_questoes_ordem ON questoes_prova (ordem)'],
    })
    app.save(questoes)

    // ─── RESPOSTAS DA PROVA ───
    const matriculasId = app.findCollectionByNameOrId('matriculas').id
    const questoesId = app.findCollectionByNameOrId('questoes_prova').id
    const provaRespostas = new Collection({
      name: 'prova_respostas',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: '',
      updateRule: '',
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
          name: 'questao_id',
          type: 'relation',
          required: true,
          collectionId: questoesId,
          maxSelect: 1,
          cascadeDelete: false,
        },
        { name: 'resposta', type: 'select', values: ['a', 'b', 'c', 'd'], maxSelect: 1 },
        { name: 'acertou', type: 'bool' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_prova_respostas_matricula ON prova_respostas (matricula_id)'],
    })
    app.save(provaRespostas)

    // ─── PACOTES DE IMPORTAÇÃO ───
    const pacotesImportacao = new Collection({
      name: 'pacotes_importacao',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: '',
      updateRule: '',
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
        { name: 'dados_json', type: 'text', required: true },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['gerado', 'enviado', 'confirmado', 'falha', 'retido'],
          maxSelect: 1,
        },
        { name: 'erro_mensagem', type: 'text' },
        { name: 'tentativas', type: 'number', min: 0, onlyInt: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_pacotes_matricula ON pacotes_importacao (matricula_id)',
        'CREATE INDEX idx_pacotes_status ON pacotes_importacao (status)',
      ],
    })
    app.save(pacotesImportacao)

    // ─── CONTRATOS ───
    const contratos = new Collection({
      name: 'contratos',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: '',
      updateRule: '',
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
        { name: 'pdf_conteudo', type: 'text' },
        { name: 'gerado', type: 'bool' },
        { name: 'erro_mensagem', type: 'text' },
        { name: 'excecao_template', type: 'bool' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_contratos_matricula ON contratos (matricula_id)'],
    })
    app.save(contratos)

    // ─── PAGAMENTOS ───
    const pagamentos = new Collection({
      name: 'pagamentos',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'matricula_id',
          type: 'relation',
          collectionId: matriculasId,
          maxSelect: 1,
          cascadeDelete: true,
        },
        { name: 'valor_esperado', type: 'number', required: true, min: 0 },
        { name: 'valor_pago', type: 'number', required: true, min: 0 },
        { name: 'nome_pagador', type: 'text' },
        { name: 'data_pagamento', type: 'date' },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['identificado', 'divergente', 'parcial', 'manual'],
          maxSelect: 1,
        },
        { name: 'divergencia_nome', type: 'bool' },
        { name: 'nota_divergencia', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_pagamentos_matricula ON pagamentos (matricula_id)',
        'CREATE INDEX idx_pagamentos_status ON pagamentos (status)',
      ],
    })
    app.save(pagamentos)

    // ─── NOTIFICAÇÕES DA COORDENADORA ───
    const notificacoes = new Collection({
      name: 'notificacoes_coordenadora',
      type: 'base',
      listRule: '',
      viewRule: '',
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
        { name: 'nome_aluno', type: 'text', required: true },
        {
          name: 'nivel',
          type: 'select',
          values: ['basico', 'intermediario', 'avancado'],
          maxSelect: 1,
        },
        { name: 'curso', type: 'text' },
        { name: 'horario_pretendido', type: 'text' },
        { name: 'lida', type: 'bool' },
        { name: 'erro_criacao', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_notificacoes_lida ON notificacoes_coordenadora (lida)',
        'CREATE INDEX idx_notificacoes_created ON notificacoes_coordenadora (created DESC)',
      ],
    })
    app.save(notificacoes)
  },
  (app) => {
    const names = [
      'notificacoes_coordenadora',
      'pagamentos',
      'contratos',
      'pacotes_importacao',
      'prova_respostas',
      'questoes_prova',
      'matriculas',
      'turmas',
    ]
    names.forEach((n) => {
      try {
        app.delete(app.findCollectionByNameOrId(n))
      } catch (e) {}
    })
  },
)
