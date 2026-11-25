const HOST = '192.168.1.9'
const axios = require('axios')
const express = require('express')
const { v4: uuidv4 } = require('uuid')
const app = express()
app.use(express.json())

const comentariosPorSerieId = {}

const funcoes = {
  //atualiza o status do comentário
  ComentarioModerado: async (comentario) => {
    const comentarios = comentariosPorSerieId[comentario.serieId]
    if (comentarios) {
      const comentarioParaAtualizar = comentarios.find((c) => c.id === comentario.id)
      if (comentarioParaAtualizar) {
        comentarioParaAtualizar.status = comentario.status
        await axios.post(`http://${HOST}:10000/eventos`, {
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

//adiciona um novo comentário
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
  await axios.post(`http://${HOST}:10000/eventos`, {
    tipo: 'ComentarioCriado',
    dados: comentario
  })
  res.status(201).json(comentariosDaSerie)
})

//edita um comentário existente
app.put('/series/:id/comentarios/:idComentario', async (req, res) => {
  const comentariosDaSerie = comentariosPorSerieId[req.params.id]
  if (!comentariosDaSerie) {
    return res.status(404).json({ erro: 'comentário não encontrado' })
  }
  const comentario = comentariosDaSerie.find((c) => c.id === req.params.idComentario)
  if (!comentario) {
    return res.status(404).json({ erro: 'comentário não encontrado' })
  }
  comentario.texto = req.body.texto
  comentario.status = 'pendente'
  await axios.post(`http://${HOST}:10000/eventos`, {
    tipo: 'ComentarioEditado',
    dados: {
      id: comentario.id,
      texto: comentario.texto,
      serieId: comentario.serieId,
      status: comentario.status
    }
  })
  res.status(200).json(comentario)
})

//lista os comentários de uma série
app.get('/series/:id/comentarios', (req, res) => {
  res.json(comentariosPorSerieId[req.params.id] || [])
})

//recebe os eventos enviados pelo barramento
app.post('/eventos', async (req, res) => {
  console.log(req.body.tipo)
  try {
    const evento = req.body
    await funcoes[evento.tipo](evento.dados)
  } catch (e) {}
  res.end()
})

const port = 4100
app.listen(port, () => console.log(`Comentários. Porta ${port}.`))