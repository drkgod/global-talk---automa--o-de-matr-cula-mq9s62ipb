// Fase 2 — Enviar lembrete antes do vencimento (cron diário)
cronAdd('lembrete_vencimento', '0 9 * * *', function () {
  const hoje = new Date()
  const amanha = new Date(hoje)
  amanha.setDate(hoje.getDate() + 3)

  const pendentes = $app.findRecordsByFilter(
    'mensalidades',
    "status = 'pendente' && lembrete_enviado = false",
    'vencimento',
    500,
    0,
  )

  let enviados = 0
  pendentes.forEach(function (mens) {
    const venc = new Date(mens.get('vencimento'))
    if (venc <= amanha) {
      // Marca lembrete como enviado
      mens.set('lembrete_enviado', true)
      $app.save(mens)
      enviados++
    }
  })

  console.log('Lembretes de vencimento enviados: ' + enviados)
})
