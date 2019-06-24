<template>
  <div id="app">       
    <div>
        <div v-if="state == 'stamped'" class="dropAreasuccess-stamp alert alert-success" role="alert">
          <p><span class="glyphicon glyphicon-ok" aria-hidden="true"></span> El archivo <b>{{archivo}}</b> fue enviado con éxito para ser sellado.</p>
        </div>
        <div v-if="state=='failed-stamp'" class="fail-stamp alert alert-danger" role="alert">
          <p><span class="glyphicon glyphicon-remove" aria-hidden="true"></span> Se ha producido un error al intentar sellar el archivo <b>{{archivo}}</b>
          </p>
        </div>
        <div v-if="state=='verified'" class="success-verify alert alert-success" role="alert">
          <p><span class="glyphicon glyphicon-ok" aria-hidden="true"></span> El archivo <b>{{archivo}}</b> se encuentra sellado por:</p>
          <ul>
              <li v-for="stamp in stamps" v-bind:key="stamp.stamper">
                  <b>{{ stamp.stamper }}</b> en el bloque <b>{{ stamp.block }}</b> el {{ convertTime(stamp.blocktimestamp)  }}
              </li>
          </ul>
        </div>
        <div v-if="state=='failed-verification'" class="fail-verify alert alert-danger">
          <p><span class="glyphicon glyphicon-remove" aria-hidden="true"></span> No se ha podido verificar el archivo <b>{{archivo}}</b></p>
        </div>
        <div v-if="state!='visible-drop'">
          <button v-on:click="continuar()" class="btn btn-primary btn-pill btn-lg">Volver a Sellar o Verificar</button>
        </div>
      </div>
      <DropFile
        :apiurl="apiurl"
        :timer="timer"
        v-if="state == 'visible-drop'"
        v-on:stamp="onStamp" 
        v-on:failed-stamp="onFailedStamp()" 
        v-on:verify="onVerify" 
        v-on:failed-verify="onFailedVerify()" 
        v-on:nombreArchivo="onFilename"
      />
  </div>
</template>

<script>
 import DropFile from './components/DropFile.vue'
 
 export default {
   name: 'app',
   props: ['apiurl','timer'],
   computed: {
    hash () {
      return this.$route.params.hash
    }
   },   
   data: function() {
     return {
       state: 'visible-drop', 
       archivo: '',
       stamps: []
     }
   },
   methods: {     
     continuar() {
      this.$router.push('/')
      this.$route.params.pathMatch
      this.state = 'visible-drop'
     },
     onVerify(stamps) {
       this.stamps = stamps
       this.state = 'verified'
     },
     onFailedVerify() {
       this.state = 'failed-verification'
     },
     onStamp(hashStamped) {
       this.hashStamped = hashStamped;
       this.state = 'stamped'
     },
     onFailedStamp() {
       this.state = 'failed-stamp'
     },
     onFilename (value) {
      this.archivo = value
    },
    convertTime(timestamp){
      var date = new Date(timestamp*1000)
      return date
    }
   },
   components: {
     DropFile
   }
 }

</script>
