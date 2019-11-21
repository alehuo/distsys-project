const messagesRouter = require('express').Router()
const fetch = require('node-fetch')
const messages = []
const nodeList = String(process.env.NODE_URLS).split(';')
const nodeName = String(process.env.NODE_NAME)

messagesRouter.get('/', async (req, res) => {
  try {
    const nodeUrls = nodeList.map(
      addr => 'http://' + addr.trim() + ':5000/messages/state'
    )
    const requests = []
    nodeUrls.forEach(url => {
      requests.push(fetch(url).then(res => res.json()))
    })
    const results = await Promise.all(requests)
    let msgs = []
    results.forEach(result => {
      msgs = [...msgs, ...result]
    })
    res.status(200).json(msgs)
  } catch (err) {
    console.error(err)
    res.sendStatus(500)
  }
})

messagesRouter.get('/state', (req, res) => {
  res.status(200).json(messages)
})

messagesRouter.post('/receive', (req, res) => {
  const newMessage = {
    time: Date.now(),
    name: req.body.name,
    message: req.body.message,
    nodeName
  }
  messages.push(newMessage)
  res.sendStatus(200)
})

messagesRouter.post('/', async (req, res) => {
  if (req.body.name === undefined || req.body.message === undefined) {
    res.sendStatus(400)
  }
  try {
    const message = {
      time: Date.now(),
      name: req.body.name,
      message: req.body.message,
      nodeName
    }
    if (req.query && req.query.to !== undefined) {
      const to = String(req.query.to).trim()
      const address =
        nodeList.indexOf(to) > -1 ? 'http://' + to + ':5000/messages/receive' : undefined
      if (address === undefined) {
        res.sendStatus(500)
      }
      await fetch(address, {
        method: 'post',
        body: JSON.stringify(message),
        headers: { 'Content-Type': 'application/json' }
      })
    } else {
      messages.push(message)
    }
    res.sendStatus(201)
  } catch (error) {
    console.log(error)
    res.sendStatus(500)
  }
})

module.exports = messagesRouter
