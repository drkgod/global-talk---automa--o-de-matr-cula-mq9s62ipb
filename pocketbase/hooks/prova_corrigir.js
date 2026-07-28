// SPEC-1-002: Correção automática da prova + roteamento para turma/horário
// Rota: POST /backend/v1/prova/corrigir
routerAdd(
  'POST',
  '/backend/v1/prova/corrigir',
  (e) => {
    const body = e.requestInfo().body
    const matriculaId = body.matricula_id
    if (!matriculaId) {
      return e.json(400, { erro: 'matricula_id é obrigatório' })
    }

    // Busca a matrícula
    const matricula = $app.findRecordById('matriculas', matriculaId)

    // Busca todas as respostas da matrícula
    const respostas = $app.findRecordsByFilter(
      'prova_respostas',
      'matricula_id = {:matriculaId}',
      'created',
      100,
      0,
      { matriculaId: matriculaId },
    )

    if (respostas.length === 0) {
      // Prova incompleta — nenhuma resposta registrada
      return e.json(400, { erro: 'Prova incompleta. Nenhuma resposta registrada.' })
    }

    // Verifica se todas as questões foram respondidas
    const todasQuestoes = $app.findRecordsByFilter('questoes_prova', '1=1', 'ordem', 100, 0)
    if (respostas.length < todasQuestoes.length) {
      return e.json(400, { erro: 'Prova incompleta. Faltam questões a serem respondidas.' })
    }

    // Corrige: conta acertos
    let acertos = 0
    let total = respostas.length
    respostas.forEach((r) => {
      const questao = $app.findRecordById('questoes_prova', r.get('questao_id'))
      const correta = questao.get('resposta_correta')
      const dada = r.get('resposta')
      const acertou = correta === dada
      r.set('acertou', acertou)
      $app.save(r)
      if (acertou) acertos++
    })

    // Define nível: >=70% avancado, >=40% intermediario, <40% basico
    const pct = acertos / total
    let nivel = 'basico'
    if (pct >= 0.7) nivel = 'avancado'
    else if (pct >= 0.4) nivel = 'intermediario'

    // Atualiza matrícula
    matricula.set('nivel', nivel)
    matricula.set('status', 'prova_concluida')

    // Tenta encontrar turma compatível
    const turmasCompativeis = $app.findRecordsByFilter(
      'turmas',
      'nivel = {:nivel} && vagas_disponiveis > 0',
      'created',
      50,
      0,
      { nivel: nivel },
    )

    let turmaAtribuida = null
    let horarioAlternativo = false

    // Primeiro tenta a turma no horário pretendido
    const horarioPretendido = matricula.get('horario_pretendido') || ''
    if (horarioPretendido) {
      for (let i = 0; i < turmasCompativeis.length; i++) {
        if (turmasCompativeis[i].get('horario') === horarioPretendido) {
          turmaAtribuida = turmasCompativeis[i]
          break
        }
      }
    }

    // Se não encontrou no horário pretendido, oferece alternativa
    if (!turmaAtribuida && turmasCompativeis.length > 0) {
      turmaAtribuida = turmasCompativeis[0]
      horarioAlternativo = true
    }

    if (turmaAtribuida) {
      matricula.set('turma_id', turmaAtribuida.id)
      matricula.set('horario_alternativo_oferecido', horarioAlternativo)
      $app.save(matricula)
      return e.json(200, {
        acertos: acertos,
        total: total,
        nivel: nivel,
        turma: {
          id: turmaAtribuida.id,
          curso: turmaAtribuida.get('curso'),
          horario: turmaAtribuida.get('horario'),
          nivel: turmaAtribuida.get('nivel'),
        },
        horario_alternativo: horarioAlternativo,
      })
    } else {
      // Nenhuma turma compatível — aluno fica pendente, coordenadora notificada
      matricula.set('status', 'pendente')
      $app.save(matricula)

      // Cria notificação para coordenadora
      const notifCol = $app.findCollectionByNameOrId('notificacoes_coordenadora')
      const notif = new Record(notifCol)
      notif.set('matricula_id', matriculaId)
      notif.set('nome_aluno', matricula.get('nome') || 'Sem nome')
      notif.set('nivel', nivel)
      notif.set('curso', matricula.get('curso_pretendido') || '')
      notif.set('horario_pretendido', horarioPretendido)
      notif.set('lida', false)
      $app.save(notif)

      return e.json(200, {
        acertos: acertos,
        total: total,
        nivel: nivel,
        pendente: true,
        mensagem:
          'Nenhuma turma compatível disponível. Aluno registrado como pendente e coordenadora notificada.',
      })
    }
  },
  $apis.requireAuth(),
)
