const HOST = '192.168.1.9'
const axios = require('axios')
const express = require('express')
const app = express()
app.use(express.json())

const palavrasProibidas = ['morre', 'final', 'assassino', 'traidor']

const funcoes = {
  ComentarioCriado: async (comentario) => {
    const contemSpoiler = palavrasProibidas.some((p) => comentario.texto.includes(p))
    comentario.status = contemSpoiler ? 'spoiler' : 'liberado'
    await axios.post(`http://${HOST}:10000/eventos`, {
      tipo: 'ComentarioModerado',
      dados: {
        id: comentario.id,
        texto: comentario.texto,
        serieId: comentario.serieId,
        status: comentario.status
      }
    })
  }
}
funcoes.ComentarioEditado = funcoes.ComentarioCriado

app.post('/eventos', async (req, res) => {
  try {
    const evento = req.body
    await funcoes[evento.tipo](evento.dados)
  } catch (e) {}
  res.end()
})

const port = 4300
app.listen(port, async () => {
  console.log(`Moderação. Porta ${port}.`)
  try {
    const res = await axios.get(`http://${HOST}:10000/eventos`)
    const ultimoEventoPorComentario = {}
    for (const evento of res.data) {
      if (
        evento.tipo === 'ComentarioCriado' ||
        evento.tipo === 'ComentarioEditado' ||
        evento.tipo === 'ComentarioModerado'
      ) {
        ultimoEventoPorComentario[evento.dados.id] = evento
      }
    }
    for (const idComentario of Object.keys(ultimoEventoPorComentario)) {
      const ultimoEvento = ultimoEventoPorComentario[idComentario]
      if (
        ultimoEvento.tipo === 'ComentarioCriado' ||
        ultimoEvento.tipo === 'ComentarioEditado'
      ) {
        await funcoes.ComentarioCriado(ultimoEvento.dados)
      }
    }
  } catch (e) {
    console.log('Barramento indisponível')
  }
})