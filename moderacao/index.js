const axios = require('axios')
const express = require('express')
const app = express()
app.use(express.json())

const palavrasProibidas = ['morre', 'final', 'assassino', 'traidor']

const funcoes = {
  ComentarioCriado: async (comentario) => {
    const contemSpoiler = palavrasProibidas.some((p) => comentario.texto.includes(p))
    comentario.status = contemSpoiler ? 'spoiler' : 'liberado'
    await axios.post('http://localhost:10000/eventos', {
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
app.listen(port, () => console.log(`Moderação. Porta ${port}.`))