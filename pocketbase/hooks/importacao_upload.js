// SPEC-1-003: Upload assistido do pacote (1 ação da atendente)
// Rota: POST /backend/v1/importacao/upload
routerAdd(
  'POST',
  '/backend/v1/importacao/upload',
  (e) => {
    const body = e.requestInfo().body
    const pacoteId = body.pacote_id
    if (!pacoteId) {
      return e.json(400, { erro: 'pacote_id é obrigatório' })
    }

    const pacote = $app.findRecordById('pacotes_importacao', pacoteId)
    const matricula = $app.findRecordById('matriculas', pacote.get('matricula_id'))

    // Simula indisponibilidade do sistema (para teste)
    const simularIndisponibilidade = body.simular_indisponivel || false
    const tentativas = (pacote.get('tentativas') || 0) + 1
    pacote.set('tentativas', tentativas)

    if (simularIndisponibilidade && tentativas < 3) {
      pacote.set('status', 'retido')
      pacote.set('erro_mensagem', 'Sistema indisponível. Pacote retido para reintento.')
      $app.save(pacote)
      return e.json(503, {
        erro: 'Sistema indisponível no momento. Pacote retido. Tente novamente.',
        tentativas: tentativas,
        pacote_id: pacoteId,
      })
    }

    // Sucesso — confirma upload
    pacote.set('status', 'confirmado')
    pacote.set('erro_mensagem', '')
    $app.save(pacote)

    // Matrícula permanece como pendente até confirmação de pagamento
    if (matricula.get('status') === 'prova_concluida') {
      matricula.set('status', 'pendente')
      $app.save(matricula)
    }

    return e.json(200, {
      pacote_id: pacoteId,
      status: 'confirmado',
      aluno: matricula.get('nome'),
      cpf: matricula.get('cpf'),
      mensagem: 'Aluno cadastrado com status "pendente". Nenhum campo redigitado.',
    })
  },
  $apis.requireAuth(),
)
