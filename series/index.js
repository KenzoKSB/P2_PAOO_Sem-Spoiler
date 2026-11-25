const express = require('express')
const app = express()
app.use(express.json())

let id = 1
const series = {}

app.get('/series', (req, res) => {
  res.json(series)
})

app.post('/series', (req, res) => {
  const { titulo, plataforma } = req.body
  if (titulo && plataforma) {
    const serie = {
      id: id,
      titulo: titulo,
      plataforma: plataforma
    }
    series[id] = serie
    id++
    res.status(201).json(serie)
  } else {
    res.status(400).json({ erro: 'titulo e plataforma são obrigatórios' })
  }
})

const port = 4000
app.listen(port, () => console.log(`Séries. Porta ${port}.`))