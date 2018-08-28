<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <button @click="handleClick">Send message</button>
  </div>
</template>

<script>
import myWorker from '@/my-worker'

export default {
  name: 'HelloWorld',
  props: {
    msg: String
  },
  methods: {
    handleClick() {
      myWorker.send('Hello worker!')
        .then(reply => alert(reply))
    }
  }
}
</script>

<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
