# Minimal example of using a Web Worker with Vue

## Requirements

- Vue CLI 3 (see [https://cli.vuejs.org]() for installation instructions)
- `worker-loader` to let Webpack load the worker for you
- `promise-worker` to simplify communication with the worker

## Running the example

This example uses the standard Vue CLI 3 commands:

```bash
yarn serve
```

#### Stand-alone build

```bash
yarn build
```

You could use Python's SimpleHTTPServer to check out the build locally:

```bash
cd dist
python -m SimpleHTTPServer
```

## Build it yourself

### Create the app (using Vue CLI 3.0)

```bash
vue create minimal-vue-worker
# select your preferred preset, such as 'default'
cd minimal-vue-worker
```

### Add `worker-loader` and `promise-worker`

```bash
yarn add --dev worker-loader promise-worker
```

### Configuring the build with `vue.config.js`

### Issue with globalObject
Setting `globalObject` to `this` to fix a reference error: "Uncaught ReferenceError: window is not defined".

> **Note:** This is a workaround taken from webpack/webpack#6642 (comment) and should be replaced by `target: 'universal'` when webpack/webpack#6525 has been implemented.

```js
module.exports = {
  chainWebpack: config => {
    config.output
      .globalObject('this')
    /* ... */
  }
}
```

#### Hot Module Replacement in Safari
For HMR there's currently an issue in Safari which can be fixed with a small config change:

```js
module.exports = {
  chainWebpack: config => {
    /* ... */
    if (process.env.NODE_ENV === 'development') {
      config.output
        .publicPath('/')
        .filename('[name].[hash].js')
        .end()
    }
    /* ... */
}
```

#### Webpack Loader configuration

Configuring the `worker-loader` here using a rule does not work reliably.

- Hot Module Replacement does not seem to work at all
- Even refresh (F5) doesn't reload the worker javascript, unless the development server is restarted
- Sometimes the contents of `index.html` is served in stead of the worker javascript!

Using the inline loader syntax works fine:

```js
import Worker from 'worker-loader!./worker'
```

But if it did work, I would need to add the following configuration here, which triggers the loader for any file ending with `worker.js`. You can't use this in combination with the inline syntax.

```js
module.exports = {
  chainWebpack: config => {
    /* ... */
    config.module
      .rule('worker')
        .test(/worker\.js$/)
        .use('worker-loader')
          .loader('worker-loader')
      .end()
    /* ... */
  }
}
```

### Create the primary entrypoints of your worker

```bash
mkdir src/my-worker
touch src/my-worker/index.js
touch src/my-worker/worker.js
```

This is slightly opinionated, but the idea is this: the `index.js` defines the public API of your worker, and `worker.js` defines the private API. The `index.js` offers a thin layer of abstraction to simplify communication with the worker.

> **Note:** Take care that the `worker.js` does not import anything major from the main application, especially when you're refactoring an existing code base. You don't want to duplicate your entire app inside your worker...

#### index.js

This is the script the rest of your application sees. It sets up the `postMessage` and `onMessage` code, and exports a simple API.

```js
import PromiseWorker from 'promise-worker'
import Worker from 'worker-loader!./worker'

const promiseWorker = new PromiseWorker(new Worker())

const send = message => promiseWorker.postMessage({
  type: 'message',
  message
})

export default {
  send
}
```

#### worker.js

This is where messages come in and are passed on to other modules if you like.

Promise-Worker makes all this really simple and intuitive, and if you like you can still access the raw Web Worker API, i.e. `postMessage` and `onMessage`.

```js
import registerPromiseWorker from 'promise-worker/register'

registerPromiseWorker((message) => {
  if (message.type === 'message') {
    return `Worker replies: ${JSON.stringify(message)}`
  }
})
```

#### Using the worker

In any part of your application where you want to use the worker, do something like this:

```js
import myWorker from '@/my-worker'
/* ... */
myWorker.send({ anything: 'you need' })
  .then(reply => {
    // Handle the reply
  })
```
