const HOST = '192.168.1.9'
const axios = require('axios')
const express = require('express')
const app = express()
app.use(express.json())

const palavrasProibidas = ['morre', 'final', 'assassino', 'traidor']

const funcoes = {
  ComentarioCriado: async (comentario) => {
    comentario.status = 'liberado'
    palavrasProibidas.forEach((palavra) => {
      if (comentario.texto.includes(palavra)) {
        comentario.status = 'spoiler'
      }
    })
    await axios.post(`http://${HOST}:10000/eventos`, {
      tipo: 'ComentarioModerado',
      dados: {
        id: comentario.id,
        texto: comentario.texto,
        serieId: comentario.serieId,
        status: comentario.status
      }
    })
  },
  ComentarioEditado: async (comentario) => {
    await funcoes.ComentarioCriado(comentario)
  }
}

app.post('/eventos', async (req, res) => {
  try {
    await funcoes[req.body.tipo](req.body.dados)
  } catch (e) {}
  res.end()
})

const port = 4300
app.listen(port, async () => {
  console.log(`Moderação. Porta ${port}.`)
  try {
    const resp = await axios.get(`http://${HOST}:10000/eventos`)
    const ultimoEventoPorId = {}
    const ids = []
    resp.data.forEach((evento) => {
      try {
        if (evento.tipo === 'ComentarioCriado' || evento.tipo === 'ComentarioEditado' || evento.tipo === 'ComentarioModerado') {
          if (ultimoEventoPorId[evento.dados.id] === undefined) {
            ids.push(evento.dados.id)
          }
          ultimoEventoPorId[evento.dados.id] = evento
        }
      } catch (e) {}
    })
    ids.forEach(async (id) => {
      const ultimo = ultimoEventoPorId[id]
      if (ultimo.tipo === 'ComentarioModerado') {
      } else {
        try {
          await funcoes.ComentarioCriado(ultimo.dados)
        } catch (e) {}
      }
    })
  } catch (e) {
    console.log('Barramento indisponível')
  }
})