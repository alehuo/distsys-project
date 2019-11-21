const fetch = require('node-fetch')
const { PerformanceObserver, performance } = require('perf_hooks')
const [, , fromNode, toNode, numberOfMessages, messageSize, random] = process.argv
const crypto = require('crypto')

const obs = new PerformanceObserver((items) => {
  console.log(items.getEntries()[0].duration)
  performance.clearMarks()
})
obs.observe({ entryTypes: ['measure'] })

const nodeAddresses = {
  one: 'http://localhost:5001',
  two: 'http://localhost:5002',
  three: 'http://localhost:5003'
}
const nodes = Object.keys(nodeAddresses)

if (!(nodes.indexOf(fromNode) > -1)) {
  throw new Error('Unknown node')
}

if (!(nodes.indexOf(toNode) > -1)) {
  throw new Error('Unknown node')
}

if (numberOfMessages === undefined) {
  throw new Error('Number of messages is undefined')
}

const message = {
  name: 'test',
  message: 'test'
}
if (messageSize !== undefined) {
  if (random !== undefined && Boolean(random) === true) {
    message.message = crypto.randomBytes(Math.floor(Number(messageSize) / 2)).toString('hex')
  } else {
    message.message = ''.padEnd(Number(messageSize), '0')
  }
}
let promises = []
for (let i = 0; i < numberOfMessages; i++) {
  const url = nodeAddresses[fromNode] + '/messages?to=' + toNode
  promises = [...promises, fetch(url, {
    method: 'post',
    body: JSON.stringify(message),
    headers: { 'Content-Type': 'application/json' }
  })]
}

performance.mark('A')
Promise.all(promises).then(res => {
  performance.mark('B')
  performance.measure('A to B', 'A', 'B')
}).catch(err => console.error(err))
