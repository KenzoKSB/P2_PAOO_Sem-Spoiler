const HOST = '192.168.1.9'
const axios = require('axios')
const express = require('express')
const app = express()
app.use(express.json())

const eventos = []

//retorna todos os eventos
app.get('/eventos', (req, res) => {
  res.json(eventos)
})

//recebe e envia os eventos para os outros serviços
app.post('/eventos', async (req, res) => {
  const evento = req.body
  eventos.push(evento)
  try {
    await axios.post(`http://${HOST}:4000/eventos`, evento)
  } catch (e) {}
  try {
    await axios.post(`http://${HOST}:4100/eventos`, evento)
  } catch (e) {}
  try {
    await axios.post(`http://${HOST}:4200/eventos`, evento)
  } catch (e) {}
  try {
    await axios.post(`http://${HOST}:4300/eventos`, evento)
  } catch (e) {}
  res.end()
})

const port = 10000
app.listen(port, () => console.log(`Barramento de eventos. Porta ${port}.`))