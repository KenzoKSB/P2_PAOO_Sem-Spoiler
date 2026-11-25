const HOST = '192.168.1.9'
const axios = require('axios')
const express = require('express')
const app = express()
app.use(express.json())

const baseConsulta = {}

const funcoes = {
  SerieCriada: (serie) => {
    baseConsulta[serie.id] = {
      id: serie.id,
      titulo: serie.titulo,
      plataforma: serie.plataforma,
      comentarios: []
    }
  },
  ComentarioCriado: (comentario) => {
    const serie = baseConsulta[comentario.serieId]
    if (serie) {
      serie.comentarios.push(comentario)
    }
  },
  ComentarioAtualizado: (comentario) => {
    const serie = baseConsulta[comentario.serieId]
    if (serie) {
      const indice = serie.comentarios.findIndex((c) => c.id === comentario.id)
      if (indice !== -1) {
        serie.comentarios[indice] = comentario
      }
    }
  }
}
funcoes.ComentarioEditado = funcoes.ComentarioAtualizado

app.get('/series', (req, res) => {
  res.json(baseConsulta)
})

app.get('/series/:id', (req, res) => {
  const serie = baseConsulta[req.params.id]
  if (serie) {
    res.json(serie)
  } else {
    res.status(404).json({ erro: 'série não encontrada' })
  }
})

app.post('/eventos', (req, res) => {
  try {
    const evento = req.body
    funcoes[evento.tipo](evento.dados)
  } catch (e) {}
  res.end()
})

const port = 4200
app.listen(port, async () => {
  console.log(`Consulta. Porta ${port}.`)
  try {
    const resp = await axios.get(`http://${HOST}:10000/eventos`)
    resp.data.forEach((evento) => {
      try {
        funcoes[evento.tipo](evento.dados)
      } catch (e) {}
    })
  } catch (e) {
    console.log('Barramento indisponível')
  }
})