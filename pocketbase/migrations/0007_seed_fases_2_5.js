// Seed data para Fases 2-5: professores, métricas e treinamentos
migrate(
  (app) => {
    // --- Professores ---
    var profCol = app.findCollectionByNameOrId('professores')
    var profsData = [
      {
        nome: 'Maria Silva',
        email: 'maria.silva@globaltalk.com.br',
        telefone: '(11) 98765-4321',
        idiomas: 'Inglês, Espanhol',
        ativo: true,
      },
      {
        nome: 'João Costa',
        email: 'joao.costa@globaltalk.com.br',
        telefone: '(11) 97654-3210',
        idiomas: 'Inglês',
        ativo: true,
      },
      {
        nome: 'Ana Paula Souza',
        email: 'ana.souza@globaltalk.com.br',
        telefone: '(11) 96543-2109',
        idiomas: 'Inglês, Francês',
        ativo: true,
      },
      {
        nome: 'Carlos Ruiz',
        email: 'carlos.ruiz@globaltalk.com.br',
        telefone: '(11) 95432-1098',
        idiomas: 'Espanhol',
        ativo: true,
      },
      {
        nome: 'Sophie Martin',
        email: 'sophie.martin@globaltalk.com.br',
        telefone: '(11) 94321-0987',
        idiomas: 'Francês, Inglês',
        ativo: true,
      },
    ]
    for (var i = 0; i < profsData.length; i++) {
      var p = profsData[i]
      try {
        app.findFirstRecordByData('professores', 'nome', p.nome)
        continue // ja existe
      } catch (_) {
        /* ok */
      }
      var rec = new Record(profCol)
      rec.set('nome', p.nome)
      rec.set('email', p.email)
      rec.set('telefone', p.telefone)
      rec.set('idiomas', p.idiomas)
      rec.set('ativo', p.ativo)
      rec.set(
        'disponibilidade',
        JSON.stringify({ dias: ['segunda', 'terca', 'quarta', 'quinta', 'sexta'] }),
      )
      app.save(rec)
    }

    // --- Métricas do projeto ---
    var metCol = app.findCollectionByNameOrId('metricas')
    var metricasData = [
      {
        nome: 'Tempo médio de matrícula',
        valor: 12,
        unidade: 'min',
        meta: '< 15 min',
        status: 'atingido',
        fase: '1',
        observacao: 'Reduzido de 40 min para 12 min',
      },
      {
        nome: 'Redigitação eliminada',
        valor: 100,
        unidade: '%',
        meta: '100%',
        status: 'atingido',
        fase: '1',
        observacao: 'Dados capturados uma única vez',
      },
      {
        nome: 'Provas corrigidas automaticamente',
        valor: 100,
        unidade: '%',
        meta: '100%',
        status: 'atingido',
        fase: '1',
        observacao: 'Sem intervenção manual',
      },
      {
        nome: 'Boletos gerados automaticamente',
        valor: 100,
        unidade: '%',
        meta: '100%',
        status: 'atingido',
        fase: '2',
        observacao: '12 parcelas por matrícula',
      },
      {
        nome: 'Conciliação automática',
        valor: 85,
        unidade: '%',
        meta: '> 80%',
        status: 'atingido',
        fase: '2',
        observacao: 'Match por valor + data',
      },
      {
        nome: 'Lembretes enviados antes do vencimento',
        valor: 100,
        unidade: '%',
        meta: '100%',
        status: 'atingido',
        fase: '2',
        observacao: '3 dias antes, cron diário',
      },
      {
        nome: 'Grade semanal documentada',
        valor: 100,
        unidade: '%',
        meta: '100%',
        status: 'atingido',
        fase: '3',
        observacao: 'Não depende de uma única pessoa',
      },
      {
        nome: 'Conflitos detectados automaticamente',
        valor: 100,
        unidade: '%',
        meta: '100%',
        status: 'atingido',
        fase: '3',
        observacao: 'Sinalização visual na grade',
      },
      {
        nome: 'Escalonamento automático de inadimplência',
        valor: 100,
        unidade: '%',
        meta: '100%',
        status: 'atingido',
        fase: '4',
        observacao: '4 níveis: lembrete → diretora',
      },
      {
        nome: 'Renegociações pela diretora',
        valor: 100,
        unidade: '%',
        meta: '100%',
        status: 'atingido',
        fase: '4',
        observacao: 'Linha vermelha respeitada',
      },
      {
        nome: 'Equipe capacitada',
        valor: 0,
        unidade: '%',
        meta: '100%',
        status: 'em_andamento',
        fase: '5',
        observacao: 'Treinamentos agendados',
      },
      {
        nome: 'Documentação entregue',
        valor: 80,
        unidade: '%',
        meta: '100%',
        status: 'parcial',
        fase: '5',
        observacao: 'Em finalização',
      },
    ]
    for (var j = 0; j < metricasData.length; j++) {
      var m = metricasData[j]
      try {
        app.findFirstRecordByData('metricas', 'nome', m.nome)
        continue
      } catch (_) {
        /* ok */
      }
      var mrec = new Record(metCol)
      mrec.set('nome', m.nome)
      mrec.set('valor', m.valor)
      mrec.set('unidade', m.unidade)
      mrec.set('meta', m.meta)
      mrec.set('status', m.status)
      mrec.set('fase', m.fase)
      mrec.set('observacao', m.observacao)
      app.save(mrec)
    }

    // --- Treinamentos ---
    var treinCol = app.findCollectionByNameOrId('treinamentos')
    var treinsData = [
      {
        funcionario: 'Luiza',
        papel: 'atendente',
        topico: 'Sistema de matrícula — formulário e prova',
        data: '2026-08-05',
        status: 'agendado',
      },
      {
        funcionario: 'Patrícia',
        papel: 'coordenadora',
        topico: 'Painel da coordenadora e notificações',
        data: '2026-08-06',
        status: 'agendado',
      },
      {
        funcionario: 'Roberto',
        papel: 'financeiro',
        topico: 'Cobrança recorrente e conciliação bancária',
        data: '2026-08-07',
        status: 'agendado',
      },
      {
        funcionario: 'Sandra',
        papel: 'diretoria',
        topico: 'Escalonamento de inadimplência e renegociação',
        data: '2026-08-08',
        status: 'agendado',
      },
    ]
    for (var k = 0; k < treinsData.length; k++) {
      var t = treinsData[k]
      try {
        app.findFirstRecordByData('treinamentos', 'funcionario', t.funcionario)
        continue
      } catch (_) {
        /* ok */
      }
      var trec = new Record(treinCol)
      trec.set('funcionario', t.funcionario)
      trec.set('papel', t.papel)
      trec.set('topico', t.topico)
      trec.set('data_treinamento', t.data)
      trec.set('status', t.status)
      app.save(trec)
    }
  },
  (app) => {
    try {
      app.truncateCollection(app.findCollectionByNameOrId('treinamentos'))
    } catch (e) {
      /* ignore */
    }
    try {
      app.truncateCollection(app.findCollectionByNameOrId('metricas'))
    } catch (e) {
      /* ignore */
    }
    try {
      app.truncateCollection(app.findCollectionByNameOrId('professores'))
    } catch (e) {
      /* ignore */
    }
  },
)
