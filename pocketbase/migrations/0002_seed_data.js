migrate(
  (app) => {
    // ─── TURMAS DE EXEMPLO ───
    const turmasCol = app.findCollectionByNameOrId('turmas')
    const turmasData = [
      {
        nivel: 'basico',
        curso: 'Inglês',
        horario: 'Seg/Qua 19:00',
        vagas_total: 10,
        vagas_disponiveis: 5,
      },
      {
        nivel: 'basico',
        curso: 'Inglês',
        horario: 'Ter/Qui 19:00',
        vagas_total: 10,
        vagas_disponiveis: 0,
      },
      {
        nivel: 'intermediario',
        curso: 'Inglês',
        horario: 'Seg/Qua 20:00',
        vagas_total: 10,
        vagas_disponiveis: 3,
      },
      {
        nivel: 'intermediario',
        curso: 'Inglês',
        horario: 'Ter/Qui 20:00',
        vagas_total: 10,
        vagas_disponiveis: 8,
      },
      {
        nivel: 'avancado',
        curso: 'Inglês',
        horario: 'Seg/Qua 21:00',
        vagas_total: 8,
        vagas_disponiveis: 2,
      },
      {
        nivel: 'avancado',
        curso: 'Inglês',
        horario: 'Sab 09:00',
        vagas_total: 8,
        vagas_disponiveis: 0,
      },
    ]
    turmasData.forEach((t) => {
      try {
        app.findFirstRecordByData('turmas', 'curso', t.curso)
        return
      } catch (e) {}
      const rec = new Record(turmasCol)
      rec.set('nivel', t.nivel)
      rec.set('curso', t.curso)
      rec.set('horario', t.horario)
      rec.set('vagas_total', t.vagas_total)
      rec.set('vagas_disponiveis', t.vagas_disponiveis)
      app.save(rec)
    })

    // ─── QUESTÕES DA PROVA DE NIVELAMENTO ───
    const questoesCol = app.findCollectionByNameOrId('questoes_prova')
    const questoesData = [
      {
        ordem: 1,
        enunciado: 'Choose the correct form: "She ___ to school every day."',
        a: 'go',
        b: 'goes',
        c: 'going',
        d: 'gone',
        resposta: 'b',
      },
      {
        ordem: 2,
        enunciado: 'What is the past tense of "buy"?',
        a: 'buyed',
        b: 'bought',
        c: 'buyt',
        d: 'buying',
        resposta: 'b',
      },
      {
        ordem: 3,
        enunciado: 'Complete: "If I ___ rich, I would travel the world."',
        a: 'am',
        b: 'was',
        c: 'were',
        d: 'be',
        resposta: 'c',
      },
      {
        ordem: 4,
        enunciado: 'Which word is a synonym for "happy"?',
        a: 'sad',
        b: 'angry',
        c: 'joyful',
        d: 'tired',
        resposta: 'c',
      },
      {
        ordem: 5,
        enunciado: 'Choose the correct preposition: "I am good ___ math."',
        a: 'in',
        b: 'at',
        c: 'on',
        d: 'for',
        resposta: 'b',
      },
      {
        ordem: 6,
        enunciado: 'What does "abbreviate" mean?',
        a: 'To make longer',
        b: 'To shorten',
        c: 'To repeat',
        d: 'To translate',
        resposta: 'b',
      },
      {
        ordem: 7,
        enunciado: 'Identify the passive voice: "The book ___ by John."',
        a: 'wrote',
        b: 'writes',
        c: 'was written',
        d: 'is writing',
        resposta: 'c',
      },
      {
        ordem: 8,
        enunciado: 'Choose the correct article: "I saw ___ elephant at the zoo."',
        a: 'a',
        b: 'an',
        c: 'the',
        d: 'no article',
        resposta: 'b',
      },
      {
        ordem: 9,
        enunciado: 'What is the plural of "child"?',
        a: 'childs',
        b: 'childes',
        c: 'children',
        d: 'child',
        resposta: 'c',
      },
      {
        ordem: 10,
        enunciado: 'Complete: "She has been living here ___ 2010."',
        a: 'for',
        b: 'since',
        c: 'from',
        d: 'in',
        resposta: 'b',
      },
    ]
    questoesData.forEach((q) => {
      try {
        app.findFirstRecordByData('questoes_prova', 'enunciado', q.enunciado)
        return
      } catch (e) {}
      const rec = new Record(questoesCol)
      rec.set('ordem', q.ordem)
      rec.set('enunciado', q.enunciado)
      rec.set('opcao_a', q.a)
      rec.set('opcao_b', q.b)
      rec.set('opcao_c', q.c)
      rec.set('opcao_d', q.d)
      rec.set('resposta_correta', q.resposta)
      app.save(rec)
    })
  },
  (app) => {
    // Down: truncate seed data
    try {
      app.truncateCollection(app.findCollectionByNameOrId('questoes_prova'))
    } catch (e) {}
    try {
      app.truncateCollection(app.findCollectionByNameOrId('turmas'))
    } catch (e) {}
  },
)
