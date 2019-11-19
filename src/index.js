const http = require('http')
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')

app.use(bodyParser.json())
app.use(cors())

const messagesRouter = require('./controllers/messages')
app.use('/messages', messagesRouter)

const PORT = 5000
http.createServer(app).listen(PORT)
