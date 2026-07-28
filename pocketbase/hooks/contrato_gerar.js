// SPEC-1-004: Geração automática de contrato PDF
// Rota: POST /backend/v1/contrato/gerar
routerAdd(
  'POST',
  '/backend/v1/contrato/gerar',
  (e) => {
    const body = e.requestInfo().body
    const matriculaId = body.matricula_id
    if (!matriculaId) {
      return e.json(400, { erro: 'matricula_id é obrigatório' })
    }

    const matricula = $app.findRecordById('matriculas', matriculaId)

    // Verifica dados obrigatórios
    const camposObrigatorios = ['nome', 'cpf', 'endereco', 'curso_pretendido']
    const faltando = []
    camposObrigatorios.forEach((campo) => {
      const val = matricula.get(campo)
      if (!val || val.trim() === '') {
        faltando.push(campo)
      }
    })

    if (faltando.length > 0) {
      return e.json(400, {
        erro: 'Geração bloqueada. Campo(s) obrigatório(s) ausente(s).',
        campos_faltantes: faltando,
      })
    }

    const valor = matricula.get('valor_matricula') || 0
    const data = new Date().toLocaleDateString('pt-BR')

    // Gera o conteúdo do contrato (template fixo)
    const conteudoContrato = [
      'CONTRATO DE PRESTAÇÃO DE SERVIÇOS EDUCACIONAIS',
      '',
      'Pelo presente instrumento particular, de um lado, GLOBAL TALK ESCOLA DE IDIOMAS LTDA,',
      'doravante denominada "CONTRATADA", e do outro lado:',
      '',
      'CONTRATANTE: ' + matricula.get('nome'),
      'CPF: ' + matricula.get('cpf'),
      'ENDEREÇO: ' + matricula.get('endereco'),
      'CURSO: ' + matricula.get('curso_pretendido'),
      'VALOR DA MATRÍCULA: R$ ' + Number(valor).toFixed(2).replace('.', ','),
      'DATA: ' + data,
      '',
      'CLÁUSULA 1ª — DO OBJETO',
      'A CONTRATADA compromete-se a prestar serviços educacionais ao CONTRATANTE,',
      'conforme o curso e horário acordados.',
      '',
      'CLÁUSULA 2ª — DO VALOR',
      'O valor da matrícula está fixado em R$ ' + Number(valor).toFixed(2).replace('.', ',') + ',',
      'a ser pago via PIX no ato da confirmação.',
      '',
      'CLÁUSULA 3ª — DAS OBRIGAÇÕES',
      'A CONTRATADA compromete-se a ministrar as aulas conforme grade de horários.',
      'O CONTRATANTE compromete-se a efetuar o pagamento na forma acordada.',
      '',
      'CLÁUSULA 4ª — DA RESCISÃO',
      'Este contrato pode ser rescindido por qualquer das partes, mediante aviso prévio.',
      '',
      'E, por estarem de acordo, assinam o presente contrato.',
      '',
      '_____________________________      _______________________________',
      '  GLOBAL TALK ESCOLA DE IDIOMAS        ' + matricula.get('nome'),
      '       CONTRATADA                          CONTRATANTE',
    ].join('\n')

    // Salva o contrato
    const contratosCol = $app.findCollectionByNameOrId('contratos')
    const contrato = new Record(contratosCol)
    contrato.set('matricula_id', matriculaId)
    contrato.set('pdf_conteudo', conteudoContrato)
    contrato.set('gerado', true)
    contrato.set('excecao_template', false)
    $app.save(contrato)

    return e.json(200, {
      contrato_id: contrato.id,
      matricula_id: matriculaId,
      gerado: true,
      conteudo: conteudoContrato,
      mensagem: 'Contrato PDF gerado sem edição manual de campo variável.',
    })
  },
  $apis.requireAuth(),
)
