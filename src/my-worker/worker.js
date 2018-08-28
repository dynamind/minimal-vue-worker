import registerPromiseWorker from 'promise-worker/register'

registerPromiseWorker((message) => {
  if (message.type === 'message') {
    return `Worker reply: ${JSON.stringify(message)}`
  }
})
