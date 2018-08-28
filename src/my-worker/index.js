import PromiseWorker from 'promise-worker'
import Worker from 'worker-loader!./worker'

const worker = new Worker()
const promiseWorker = new PromiseWorker(worker)

const send = message => promiseWorker.postMessage({
  type: 'message',
  message
})

export default {
  send
}
