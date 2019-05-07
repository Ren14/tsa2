<template>
  <div id="app">
    <div class="drop-file-wrapper">
      <DropFile
        v-if="state == 'visible-drop'"
        v-on:stamp="onStamp()" 
        v-on:failed-stamp="onFailedStamp()" 
        v-on:verify="onVerify" 
        v-on:failed-verify="onFailedVerify()" 
      />
      <div v-if="state == 'stamped'" class="success-stamp">
        <p> Stampeado exitosamente :)</p>
      </div>
      <div v-if="state=='failed-stamp'" class="fail-stamp">
        <p> Error al stampear :( </p>
      </div>
      <div v-if="state=='verified'" class="success-verify">
        <p> Verificado exitosamente por</p>
        <ul>
            <li v-for="stamp in stamps" v-bind:key="stamp.stamper">
                <b>{{ stamp.stamper }}</b> en el bloque <b>{{ stamp.block }}</b>
            </li>
        </ul>
      </div>
      <div v-if="state=='failed-verification'" class="fail-verify">
        <p> Error al verificar :( </p>
      </div>
      <div v-if="state!='visible-drop'">
        <button v-on:click="continuar()">Probar de nuevo!</button>
      </div>
    </div>
  </div>
</template>

<script>
 import DropFile from './components/DropFile.vue'
 
 export default {
   name: 'app',
   data: function() {
     return {
       state: 'visible-drop',
       stamps: []
     }
   },
   methods: {
     continuar() {
       this.state = 'visible-drop'
     },
     onVerify(stamps) {
       this.state = 'verified'
       this.stamps = stamps
     },
     onFailedVerify() {
       this.state = 'failed-verification'
     },
     onStamp() {
       this.state = 'stamped'
     },
     onFailedStamp() {
       this.state = 'failed-stamp'
     }
   },
   components: {
     DropFile
   }
 }

</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

.drop-file-wrapper {
    max-width: 500px;
    position: relative;
    border: 4px dashed;
    margin: 0 auto;
    height: 200px;
}

</style>
