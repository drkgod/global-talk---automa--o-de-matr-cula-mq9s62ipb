// Fase 2 — Lembrete antes do vencimento (cron diario)
cronAdd('lembrete_vencimento', '0 9 * * *', function () {
  var hoje = new Date()
  var amanha = new Date(hoje)
  amanha.setDate(hoje.getDate() + 3)
  var pendentes = $app.findRecordsByFilter(
    'mensalidades',
    "status = 'pendente' && lembrete_enviado = false",
    'vencimento',
    500,
    0,
  )
  var enviados = 0
  for (var i = 0; i < pendentes.length; i++) {
    var venc = new Date(pendentes[i].get('vencimento'))
    if (venc <= amanha) {
      pendentes[i].set('lembrete_enviado', true)
      $app.save(pendentes[i])
      enviados++
    }
  }
  console.log('Lembretes enviados: ' + enviados)
})
