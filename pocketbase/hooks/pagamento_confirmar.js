// SPEC-1-005: Confirmação automática de pagamento PIX
// Rota: POST /backend/v1/pagamento/confirmar
routerAdd('POST', '/backend/v1/pagamento/confirmar', (e) => {
  const body = e.requestInfo().body
  const matriculaId = body.matricula_id
  const valorPago = body.valor_pago || 0
  const nomePagador = body.nome_pagador || ''
  const dataPagamento = body.data_pagamento || new Date().toISOString()

  if (!matriculaId) {
    return e.json(400, { erro: 'matricula_id é obrigatório' })
  }

  const matricula = $app.findRecordById('matriculas', matriculaId)
  const valorEsperado = matricula.get('valor_matricula') || 0
  const nomeAluno = matricula.get('nome') || ''

  // Determina status do pagamento
  let status = 'identificado'
  let divergenciaNome = false
  let notaDivergencia = ''
  let ativada = false

  // Pagamento parcial nunca ativa automaticamente
  if (valorPago < valorEsperado) {
    status = 'parcial'
  } else {
    // Valor bate (total ou superior)
    // Verifica nome
    if (nomePagador && nomeAluno) {
      const nomePagadorLower = nomePagador.toLowerCase().trim()
      const nomeAlunoLower = nomeAluno.toLowerCase().trim()
      if (nomePagadorLower !== nomeAlunoLower) {
        divergenciaNome = true
        notaDivergencia =
          'Nome do pagador diverge do nome do aluno. Pagamento: "' +
          nomePagador +
          '" / Aluno: "' +
          nomeAluno +
          '". Matrícula ativada automaticamente, divergência registrada para revisão.'
        status = 'divergente'
      }
    }

    // Ativa a matrícula automaticamente (valor e janela batem)
    ativada = true
    matricula.set('status', 'ativo')
    $app.save(matricula)
  }

  // Registra o pagamento
  const pagamentosCol = $app.findCollectionByNameOrId('pagamentos')
  const pagamento = new Record(pagamentosCol)
  pagamento.set('matricula_id', matriculaId)
  pagamento.set('valor_esperado', valorEsperado)
  pagamento.set('valor_pago', valorPago)
  pagamento.set('nome_pagador', nomePagador)
  pagamento.set('data_pagamento', dataPagamento)
  pagamento.set('status', status)
  pagamento.set('divergencia_nome', divergenciaNome)
  pagamento.set('nota_divergencia', notaDivergencia)
  $app.save(pagamento)

  // Se ativada, cria notificação para coordenadora (SPEC-1-006)
  if (ativada) {
    const notifCol = $app.findCollectionByNameOrId('notificacoes_coordenadora')
    const notif = new Record(notifCol)
    notif.set('matricula_id', matriculaId)
    notif.set('nome_aluno', nomeAluno)
    notif.set('nivel', matricula.get('nivel') || '')
    notif.set('curso', matricula.get('curso_pretendido') || '')
    notif.set('horario_pretendido', matricula.get('horario_pretendido') || '')
    notif.set('lida', false)
    $app.save(notif)
  }

  const resposta = {
    pagamento_id: pagamento.id,
    matricula_id: matriculaId,
    status: status,
    ativada: ativada,
    divergencia_nome: divergenciaNome,
    nota_divergencia: notaDivergencia,
    mensagem: ativada
      ? 'Matrícula confirmada e ativada automaticamente.'
      : 'Pagamento parcial. Matrícula não ativada. Caso enviado para fila de verificação manual.',
  }

  return e.json(200, resposta)
})
