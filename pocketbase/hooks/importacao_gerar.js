// SPEC-1-003: Geração de pacote de importação + upload assistido com deduplicação por CPF
// Rota: POST /backend/v1/importacao/gerar
routerAdd('POST', '/backend/v1/importacao/gerar', (e) => {
  const body = e.requestInfo().body
  const matriculaId = body.matricula_id
  if (!matriculaId) {
    return e.json(400, { erro: 'matricula_id é obrigatório' })
  }

  const matricula = $app.findRecordById('matriculas', matriculaId)

  // Verifica deduplicação por CPF
  const cpf = matricula.get('cpf') || ''
  if (cpf) {
    const existentes = $app.findRecordsByFilter(
      'pacotes_importacao',
      'matricula_id != {:currentId}',
      'created',
      100,
      0,
      { currentId: matriculaId },
    )
    for (let i = 0; i < existentes.length; i++) {
      const otherMatricula = $app.findRecordById('matriculas', existentes[i].get('matricula_id'))
      if (otherMatricula.get('cpf') === cpf) {
        return e.json(409, {
          erro: 'Duplicidade detectada: já existe um pacote de importação para este CPF.',
          cpf: cpf,
        })
      }
    }
  }

  // Gera o pacote JSON no layout do sistema
  const pacote = {
    operacao: 'importacao_matricula',
    versao: '1.0',
    dados: {
      nome: matricula.get('nome'),
      cpf: matricula.get('cpf'),
      endereco: matricula.get('endereco'),
      telefone: matricula.get('telefone'),
      curso: matricula.get('curso_pretendido'),
      horario_pretendido: matricula.get('horario_pretendido'),
      nivel: matricula.get('nivel'),
      turma_id: matricula.get('turma_id'),
      status: 'pendente',
      valor_matricula: matricula.get('valor_matricula') || 0,
    },
    metadata: {
      matricula_id: matriculaId,
      gerado_em: new Date().toISOString(),
    },
  }

  const pacotesCol = $app.findCollectionByNameOrId('pacotes_importacao')
  const pacoteRec = new Record(pacotesCol)
  pacoteRec.set('matricula_id', matriculaId)
  pacoteRec.set('dados_json', JSON.stringify(pacote))
  pacoteRec.set('status', 'gerado')
  pacoteRec.set('tentativas', 0)
  $app.save(pacoteRec)

  return e.json(200, {
    pacote_id: pacoteRec.id,
    dados: pacote,
    mensagem: 'Pacote de importação gerado com sucesso.',
  })
})
