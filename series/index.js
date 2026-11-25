const HOST = '192.168.1.9'
const axios = require('axios')
const express = require('express')
const app = express()
app.use(express.json())

let id = 1
const series = {}

app.get('/series', (req, res) => {
  res.json(series)
})

app.post('/series', async (req, res) => {
  const { titulo, plataforma } = req.body
  if (titulo && plataforma) {
    const serie = {
      id: id,
      titulo: titulo,
      plataforma: plataforma
    }
    series[id] = serie
    id++
    await axios.post(`http://${HOST}:10000/eventos`, {
      tipo: 'SerieCriada',
      dados: serie
    })
    res.status(201).json(serie)
  } else {
    res.status(400).json({ erro: 'titulo e plataforma são obrigatórios' })
  }
})

app.post('/eventos', (req, res) => {
  console.log(req.body.tipo)
  res.end()
})

const port = 4000
app.listen(port, () => console.log(`Séries. Porta ${port}.`))