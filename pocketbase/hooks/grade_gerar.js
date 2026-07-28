// Fase 3 — Gerar grade de horários semanal e detectar conflitos de professor
// POST /backend/v1/grade/gerar
routerAdd(
  'POST',
  '/backend/v1/grade/gerar',
  (e) => {
    const body = e.requestInfo().body
    const semanaInicio = body.semana_inicio
    if (!semanaInicio) {
      return e.json(400, { erro: 'semana_inicio é obrigatório (YYYY-MM-DD)' })
    }

    const inicio = new Date(semanaInicio)
    const fim = new Date(inicio)
    fim.setDate(inicio.getDate() + 6)

    // Cria nova grade
    const gradeCol = $app.findCollectionByNameOrId('grade_horarios')
    const grade = new Record(gradeCol)
    grade.set('semana_inicio', inicio.toISOString().split('T')[0])
    grade.set('semana_fim', fim.toISOString().split('T')[0])
    grade.set('status', 'rascunho')
    grade.set('versao', 1)
    grade.set('criada_por', body.criada_por || 'sistema')
    $app.save(grade)

    // Busca turmas ativas
    const turmas = $app.findRecordsByFilter('turmas', 'ativa = true', 'created', 200, 0)

    // Busca professores ativos
    const professores = $app.findRecordsByFilter('professores', 'ativo = true', 'nome', 200, 0)

    // Aloca automaticamente: turma → professor (match por idioma)
    const alocCol = $app.findCollectionByNameOrId('alocacao_professores')
    const alocacoes = []
    const conflitos = []

    turmas.forEach(function (turma) {
      const curso = (turma.get('curso') || '').toLowerCase()
      let professorAlocado = null

      for (let i = 0; i < professores.length; i++) {
        const idiomas = (professores[i].get('idiomas') || '').toLowerCase()
        if (idiomas.indexOf(curso) >= 0 || curso.indexOf(idiomas) >= 0) {
          professorAlocado = professores[i]
          break
        }
      }

      if (professorAlocado) {
        // Detecta conflito: mesmo professor, mesmo dia/horário
        let conflito = false
        for (let i = 0; i < alocacoes.length; i++) {
          if (alocacoes[i].professor_id === professorAlocado.id) {
            conflito = true
            break
          }
        }

        const aloc = new Record(alocCol)
        aloc.set('grade_id', grade.id)
        aloc.set('turma_id', turma.id)
        aloc.set('professor_id', professorAlocado.id)
        aloc.set('dia_semana', 'segunda')
        aloc.set('horario_inicio', turma.get('horario') || '19:00')
        aloc.set('horario_fim', '20:30')
        aloc.set('conflito_detectado', conflito)
        $app.save(aloc)

        alocacoes.push({
          id: aloc.id,
          turma: turma.get('curso'),
          professor: professorAlocado.get('nome'),
          dia: 'segunda',
          horario: (turma.get('horario') || '19:00') + ' - 20:30',
          conflito: conflito,
        })

        if (conflito) {
          conflitos.push({
            professor: professorAlocado.get('nome'),
            turmas_conflitantes: alocacoes
              .filter(function (a) {
                return a.professor_id === professorAlocado.id
              })
              .map(function (a) {
                return a.turma
              }),
          })
        }
      }
    })

    return e.json(200, {
      grade_id: grade.id,
      semana_inicio: inicio.toISOString().split('T')[0],
      semana_fim: fim.toISOString().split('T')[0],
      total_alocacoes: alocacoes.length,
      total_conflitos: conflitos.length,
      alocacoes: alocacoes,
      conflitos: conflitos,
      mensagem:
        conflitos.length > 0
          ? 'Grade gerada com ' +
            conflitos.length +
            ' conflito(s) detectado(s). Revisão necessária.'
          : 'Grade gerada sem conflitos.',
    })
  },
  $apis.requireAuth(),
)
