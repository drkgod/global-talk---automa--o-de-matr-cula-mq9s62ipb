// SPEC-2-002: Importação de turmas + detecção de conflitos (sala, professor/horário, online/horário)
// Rota: POST /backend/v1/grade/importar
routerAdd(
  'POST',
  '/backend/v1/grade/importar',
  (e) => {
    var body = e.requestInfo().body
    var gradeId = body.grade_id
    if (!gradeId) {
      return e.json(400, { erro: 'grade_id é obrigatório' })
    }

    var turmas = body.turmas || []
    if (turmas.length === 0) {
      return e.json(400, { erro: 'Lista de turmas vazia' })
    }

    var alocacaoCol = $app.findCollectionByNameOrId('alocacao_professores')
    var conflitos = []
    var importados = 0
    var loteId = 'lote_' + Date.now()

    // Carrega alocações existentes da grade para checar conflitos
    var existentes = $app.findRecordsByFilter(
      'alocacao_professores',
      'grade_id = {:gradeId}',
      'created',
      500,
      0,
      { gradeId: gradeId },
    )

    for (var i = 0; i < turmas.length; i++) {
      var t = turmas[i]
      var conflitoDetectado = false
      var tipoConflito = ''

      // Verifica conflito de sala
      for (var j = 0; j < existentes.length; j++) {
        var ex = existentes[j]
        if (
          ex.get('sala') === t.sala &&
          ex.get('dia_semana') === t.dia_semana &&
          ex.get('horario_inicio') === t.horario_inicio
        ) {
          conflitoDetectado = true
          tipoConflito = 'sala'
          break
        }
      }

      // Verifica conflito professor/horário
      if (!conflitoDetectado) {
        for (var k = 0; k < existentes.length; k++) {
          var ex2 = existentes[k]
          if (
            ex2.get('professor_id') === t.professor_id &&
            ex2.get('dia_semana') === t.dia_semana &&
            ex2.get('horario_inicio') === t.horario_inicio
          ) {
            conflitoDetectado = true
            tipoConflito = 'professor_horario'
            break
          }
        }
      }

      // Verifica conflito online/horário do professor
      if (!conflitoDetectado && t.modalidade === 'online') {
        for (var m = 0; m < existentes.length; m++) {
          var ex3 = existentes[m]
          if (
            ex3.get('professor_id') === t.professor_id &&
            ex3.get('dia_semana') === t.dia_semana &&
            ex3.get('horario_inicio') === t.horario_inicio
          ) {
            conflitoDetectado = true
            tipoConflito = 'online_professor'
            break
          }
        }
      }

      var rec = new Record(alocacaoCol)
      rec.set('grade_id', gradeId)
      rec.set('turma_id', t.turma_id)
      rec.set('professor_id', t.professor_id)
      rec.set('dia_semana', t.dia_semana)
      rec.set('horario_inicio', t.horario_inicio)
      rec.set('horario_fim', t.horario_fim)
      rec.set('sala', t.sala || '')
      rec.set('modalidade', t.modalidade || 'presencial')
      rec.set('conflito_detectado', conflitoDetectado)
      rec.set('tipo_conflito', tipoConflito)
      $app.save(rec)

      if (conflitoDetectado) {
        conflitos.push({
          turma_id: t.turma_id,
          tipo: tipoConflito,
          detalhe: 'Conflito de ' + tipoConflito + ' detectado',
        })
      } else {
        importados++
        existentes.push(rec)
      }
    }

    // Atualiza status da grade
    var grade = $app.findRecordById('grade_horarios', gradeId)
    grade.set('conflitos_detectados', conflitos.length > 0)
    grade.set('importacao_id', loteId)
    $app.save(grade)

    return e.json(200, {
      lote_id: loteId,
      importados: importados,
      conflitos: conflitos,
      total: turmas.length,
      bloqueado: conflitos.length > 0,
      mensagem:
        conflitos.length > 0
          ? 'Importação concluída com conflitos. Confirmação bloqueada até resolver.'
          : 'Importação concluída sem conflitos. Grade pronta para publicação.',
    })
  },
  $apis.requireAuth(),
)
