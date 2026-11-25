
const HOST = '192.168.1.9'
const axios = require('axios')
const express = require('express')
const app = express()
app.use(express.json())

const palavrasProibidas = ['morre', 'final', 'assassino', 'traidor']

const funcoes = {
  ComentarioCriado: async (comentario) => {
    let contemSpoiler = false

    for(let i = 0; i < palavrasProibidas.length; i++){
      if(comentario.texto.includes(palavrasProibidas[i])){
        contemSpoiler = true
      }
    }

    if(contemSpoiler){
      comentario.status = 'spoiler'
    }
    else{
      comentario.status = 'liberado'
    }

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
    const idsComentarios = []

    for (let i = 0; i < res.data.length; i++) {
      const evento = res.data[i]

      if (
        evento.tipo === 'ComentarioCriado' ||
        evento.tipo === 'ComentarioEditado' ||
        evento.tipo === 'ComentarioModerado'
      ) {
        const idComentario = evento.dados.id

        if (!ultimoEventoPorComentario[idComentario]) {
          idsComentarios.push(idComentario)
        }

        ultimoEventoPorComentario[idComentario] = evento
      }
    }

    for(let i = 0; i < idsComentarios.length; i++){
      const idComentario = idsComentarios[i]
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