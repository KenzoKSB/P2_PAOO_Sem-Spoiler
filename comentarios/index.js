const axios = require('axios')
const express = require('express')
const { v4: uuidv4 } = require('uuid')
const app = express()
app.use(express.json())

const comentariosPorSerieId = {}

app.post('/series/:id/comentarios', async (req, res) => {
  const id = uuidv4()
  const { texto } = req.body
  const serieId = req.params.id
  const comentario = {
    id,
    texto,
    serieId
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

app.post('/eventos', (req, res) => {
  console.log(req.body.tipo)
  res.end()
})

const port = 4100
app.listen(port, () => console.log(`Comentários. Porta ${port}.`))