// SPEC-4-001: Escalonamento de inadimplência — detecta vencidos e escala (0d, 3d, 15d)
// Rota: POST /backend/v1/inadimplencia/escalonar
routerAdd(
  'POST',
  '/backend/v1/inadimplencia/escalonar',
  (e) => {
    var hoje = new Date()
    var inadimpCol = $app.findCollectionByNameOrId('inadimplencia')
    var acoesCol = $app.findCollectionByNameOrId('acoes_cobranca')
    var novasCasos = 0
    var reenvios = 0
    var escalados = 0

    // Busca mensalidades atrasadas
    var atrasadas = $app.findRecordsByFilter(
      'mensalidades',
      'status = {:st}',
      'vencimento',
      500,
      0,
      { st: 'atrasado' },
    )

    for (var i = 0; i < atrasadas.length; i++) {
      var mens = atrasadas[i]
      var venc = new Date(mens.get('vencimento'))
      var diasAtraso = Math.floor((hoje - venc) / (1000 * 60 * 60 * 24))

      // Verifica se já existe registro de inadimplência
      var existentes = $app.findRecordsByFilter(
        'inadimplencia',
        'mensalidade_id = {:mensId}',
        'created',
        10,
        0,
        { mensId: mens.id },
      )

      var inadimp = null
      if (existentes.length > 0) {
        inadimp = existentes[0]
      }

      var nivel = 'cobranca_inicial'
      if (diasAtraso >= 15) nivel = 'escala_15d_diretoria'
      else if (diasAtraso >= 3) nivel = 'reenvio_3d'

      if (!inadimp) {
        // Caso novo — criar registro
        inadimp = new Record(inadimpCol)
        inadimp.set('matricula_id', mens.get('matricula_id'))
        inadimp.set('mensalidade_id', mens.id)
        inadimp.set('dias_atraso', diasAtraso)
        inadimp.set('valor_devido', mens.get('valor'))
        inadimp.set('nivel_escalonamento', nivel)
        inadimp.set('status', 'ativo')
        inadimp.set('data_cobranca_inicial', hoje.toISOString().split('T')[0])
        $app.save(inadimp)

        // Registra ação de cobrança inicial
        var acao = new Record(acoesCol)
        acao.set('inadimplencia_id', inadimp.id)
        acao.set('tipo_acao', 'cobranca_inicial')
        acao.set('descricao', 'Cobrança inicial enviada. Dias de atraso: ' + diasAtraso)
        acao.set('data_execucao', hoje.toISOString().split('T')[0])
        acao.set('executada', true)
        acao.set('resultado', 'Cobrança enviada')
        $app.save(acao)
        novasCasos++
      } else {
        // Atualiza dias e verifica se precisa escalar
        inadimp.set('dias_atraso', diasAtraso)
        var nivelAtual = inadimp.get('nivel_escalonamento')

        if (nivel === 'reenvio_3d' && nivelAtual === 'cobranca_inicial') {
          inadimp.set('nivel_escalonamento', 'reenvio_3d')
          inadimp.set('data_reenvio', hoje.toISOString().split('T')[0])
          $app.save(inadimp)

          var acao2 = new Record(acoesCol)
          acao2.set('inadimplencia_id', inadimp.id)
          acao2.set('tipo_acao', 'reenvio_3d')
          acao2.set('descricao', 'Reenvio de cobrança (3 dias). Dias de atraso: ' + diasAtraso)
          acao2.set('data_execucao', hoje.toISOString().split('T')[0])
          acao2.set('executada', true)
          acao2.set('resultado', 'Reenvio enviado')
          $app.save(acao2)
          reenvios++
        } else if (nivel === 'escala_15d_diretoria' && nivelAtual !== 'escala_15d_diretoria') {
          inadimp.set('nivel_escalonamento', 'escala_15d_diretoria')
          inadimp.set('status', 'escalado_diretoria')
          inadimp.set('data_escala_diretoria', hoje.toISOString().split('T')[0])
          $app.save(inadimp)

          var acao3 = new Record(acoesCol)
          acao3.set('inadimplencia_id', inadimp.id)
          acao3.set('tipo_acao', 'escala_diretoria')
          acao3.set(
            'descricao',
            'Escalado para diretoria (15 dias). Dias de atraso: ' +
              diasAtraso +
              '. Valor: R$ ' +
              mens.get('valor'),
          )
          acao3.set('data_execucao', hoje.toISOString().split('T')[0])
          acao3.set('executada', true)
          acao3.set('resultado', 'Escalado para Sandra')
          $app.save(acao3)
          escalados++
        } else {
          $app.save(inadimp)
        }
      }
    }

    return e.json(200, {
      novas_casos: novasCasos,
      reenvios: reenvios,
      escalados_diretoria: escalados,
      total_atrasados: atrasadas.length,
      mensagem:
        'Escalonamento processado. ' +
        novasCasos +
        ' novos, ' +
        reenvios +
        ' reenvios, ' +
        escalados +
        ' escalados para diretoria.',
    })
  },
  $apis.requireAuth(),
)
