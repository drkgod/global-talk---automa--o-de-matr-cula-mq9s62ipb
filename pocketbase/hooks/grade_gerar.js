// Fase 3 — Gerar grade de horarios semanal
routerAdd('POST', '/backend/v1/grade/gerar', (e) => {
  var body = e.requestInfo().body
  var semanaInicio = body.semana_inicio
  if (!semanaInicio) {
    return e.json(400, { erro: 'semana_inicio obrigatorio' })
  }
  var inicio = new Date(semanaInicio)
  var fim = new Date(inicio)
  fim.setDate(inicio.getDate() + 6)
  var gradeCol = $app.findCollectionByNameOrId('grade_horarios')
  var grade = new Record(gradeCol)
  grade.set('semana_inicio', inicio.toISOString().split('T')[0])
  grade.set('semana_fim', fim.toISOString().split('T')[0])
  grade.set('status', 'rascunho')
  grade.set('versao', 1)
  grade.set('criada_por', body.criada_por || 'sistema')
  $app.save(grade)
  var turmas = $app.findRecordsByFilter('turmas', 'ativa = true', 'created', 200, 0)
  var profs = $app.findRecordsByFilter('professores', 'ativo = true', 'nome', 200, 0)
  var alocCol = $app.findCollectionByNameOrId('alocacao_professores')
  var alocacoes = [],
    conflitos = []
  for (var ti = 0; ti < turmas.length; ti++) {
    var turma = turmas[ti]
    var curso = (turma.get('curso') || '').toLowerCase()
    var prof = null
    for (var pi = 0; pi < profs.length; pi++) {
      if ((profs[pi].get('idiomas') || '').toLowerCase().indexOf(curso) >= 0) {
        prof = profs[pi]
        break
      }
    }
    if (prof) {
      var conflito = false
      for (var ai = 0; ai < alocacoes.length; ai++) {
        if (alocacoes[ai].professor_id === prof.id) {
          conflito = true
          break
        }
      }
      var aloc = new Record(alocCol)
      aloc.set('grade_id', grade.id)
      aloc.set('turma_id', turma.id)
      aloc.set('professor_id', prof.id)
      aloc.set('dia_semana', 'segunda')
      aloc.set('horario_inicio', turma.get('horario') || '19:00')
      aloc.set('horario_fim', '20:30')
      aloc.set('conflito_detectado', conflito)
      $app.save(aloc)
      alocacoes.push({
        turma: turma.get('curso'),
        professor: prof.get('nome'),
        conflito: conflito,
        professor_id: prof.id,
      })
      if (conflito) {
        conflitos.push({ professor: prof.get('nome') })
      }
    }
  }
  return e.json(200, {
    grade_id: grade.id,
    total_alocacoes: alocacoes.length,
    total_conflitos: conflitos.length,
    alocacoes: alocacoes,
    conflitos: conflitos,
  })
})
