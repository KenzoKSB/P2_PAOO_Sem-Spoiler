const axios = require('axios')
const express = require('express')
const { v4: uuidv4 } = require('uuid')
const app = express()
app.use(express.json())

const comentariosPorSerieId = {}

const funcoes = {
  ComentarioModerado: async (comentario) => {
    const comentarios = comentariosPorSerieId[comentario.serieId]
    if (comentarios) {
      const comentarioParaAtualizar = comentarios.find((c) => c.id === comentario.id)
      if (comentarioParaAtualizar) {
        comentarioParaAtualizar.status = comentario.status
        await axios.post('http://localhost:10000/eventos', {
          tipo: 'ComentarioAtualizado',
          dados: {
            id: comentarioParaAtualizar.id,
            texto: comentarioParaAtualizar.texto,
            serieId: comentarioParaAtualizar.serieId,
            status: comentarioParaAtualizar.status
          }
        })
      }
    }
  }
}

app.post('/series/:id/comentarios', async (req, res) => {
  const id = uuidv4()
  const { texto } = req.body
  const serieId = req.params.id
  const comentario = {
    id,
    texto,
    serieId,
    status: 'pendente'
  }
  const comentariosDaSerie = comentariosPorSerieId[serieId] || []
  comentariosDaSerie.push(comentario)
  comentariosPorSerieId[serieId] = comentariosDaSerie
  await axios.post('http://localhost:10000/eventos', {
    tipo: 'ComentarioCriado',
    dados: comentario
  })
  res.status(201).json(comentariosDaSerie)
})

app.get('/series/:id/comentarios', (req, res) => {
  res.json(comentariosPorSerieId[req.params.id] || [])
})

app.post('/eventos', async (req, res) => {
  try {
    const evento = req.body
    await funcoes[evento.tipo](evento.dados)
  } catch (e) {}
  res.end()
})

const port = 4100
app.listen(port, () => console.log(`Comentários. Porta ${port}.`))