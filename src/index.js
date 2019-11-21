const http = require('http')
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan')

app.use(bodyParser.json())
app.use(cors())
app.use(morgan('tiny'))

const messagesRouter = require('./controllers/messages')
app.use('/messages', messagesRouter)

const PORT = 5000
http.createServer(app).listen(PORT)

process.on('SIGINT', function () {
  process.exit()
})
