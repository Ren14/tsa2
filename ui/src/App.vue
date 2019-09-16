<template>
  <div id="app">       
    <div>
        <div v-if="state == 'stamped'" class="dropAreasuccess-stamp alert alert-success" role="alert">
          <p><span class="glyphicon glyphicon-ok" aria-hidden="true"></span> <span v-html="this.lb_00"></span> <b>{{archivo}}</b> <span v-html="this.lb_01"></span></p>
        </div>
        <div v-if="state=='failed-stamp'" class="fail-stamp alert alert-danger" role="alert">
          <p><span class="glyphicon glyphicon-remove" aria-hidden="true"></span> <span v-html="this.lb_02"></span> <b>{{archivo}}</b>
          </p>
        </div>        
        <div v-if="state=='verify-completed'">
          <div v-for="(value, index) in allFiles" :key="index">
            <div v-if="value.verified" class="success-verify alert alert-success" role="alert">
              <p><span class="glyphicon glyphicon-ok" aria-hidden="true"></span> <span v-html="lb_00"></span> <b>{{value.fileName}}</b> <span v-html="lb_03"></span></p>
              <ul>
                  <li v-for="(stamp, index) in value.stamps" :key="index">
                      <b>{{ stamp.whostamped }}</b> <span v-html="lb_04"></span> <b>{{ stamp.blocknumber }}</b> {{ convertTime(stamp.blocktimestamp)  }}
                  </li>
              </ul>
              <p><button class="btn btn-default btn-sm copiar" v-on:click="copiarURL(index)"><span class="glyphicon glyphicon-copy text-success" aria-hidden="true"></span> <span v-html="lb_15"></span></button></p>
            </div>
            <div v-else class="fail-verify alert alert-danger" role="alert" >
              <p><span class="glyphicon glyphicon-remove" aria-hidden="true"></span> <span v-html="lb_05"></span> <b>{{value.fileName}}</b></p>
            </div>
          </div>
        </div>

        <div v-if="state=='verified'" class="success-verify alert alert-success" role="alert">
          <p><span class="glyphicon glyphicon-ok" aria-hidden="true"></span> <span v-html="this.lb_00"></span> <b>{{archivo}}</b> <span v-html="this.lb_03"></span></p>
          <ul>
              <li v-for="stamp in stamps" v-bind:key="stamp.whostamped">
                  <b>{{ stamp.whostamped }}</b> <span v-html="lb_04"></span> <b>{{ stamp.blocknumber }}</b> {{ convertTime(stamp.blocktimestamp)  }}
              </li>
          </ul>
          <p><button class="btn btn-default btn-sm copiar" v-on:click="copiarCurrentURL"><span class="glyphicon glyphicon-copy text-success" aria-hidden="true"></span> <span v-html="lb_15"></span></button></p>
        </div>

        <div v-if="state=='failed-verification'" class="fail-verify alert alert-danger">
          <p><span class="glyphicon glyphicon-remove" aria-hidden="true"></span> <span v-html="this.lb_05"></span> <b>{{archivo}}</b></p>
        </div>
        <div v-if="state!='visible-drop'">
          <button v-on:click="continuar()" class="btn btn-primary btn-pill btn-lg" v-html="this.lb_06"></button>
        </div>
      </div>
      <DropFile
        :apiurl="apiurl"
        :lb_07="lb_07"
        :lb_08="lb_08"
        :lb_09="lb_09"
        :lb_10="lb_10"
        :lb_11="lb_11"
        :lb_12="lb_12"
        :lb_13="lb_13"
        :lb_14="lb_14"
        v-if="state == 'visible-drop'"
        v-on:stamp="onStamp" 
        v-on:failed-stamp="onFailedStamp()" 
        v-on:verify="onVerify" 
        v-on:verify-completed="onVerifyCompleted" 
        v-on:failed-verify="onFailedVerify()" 
        v-on:nombreArchivo="onFilename"
      />
  </div>
</template>

<script>
 import DropFile from './components/DropFile.vue'
 
 export default {
   name: 'app',
   props: ['apiurl',
           'lb_00',
           'lb_01',
           'lb_02',
           'lb_03',
           'lb_04',
           'lb_05',
           'lb_06',
           'lb_07',
           'lb_08',
           'lb_09',
           'lb_10',
           'lb_11',
           'lb_12',
           'lb_13',
           'lb_14',
           'lb_15'
          ],
   computed: {
    hash () {
      return this.$route.params.hash
    }
   },   
   data: function() {
     return {
       state: 'visible-drop', 
       archivo: '',
       allFiles: [],
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
     onVerifyCompleted(allFiles) {
       this.allFiles = allFiles
       this.state = 'verify-completed'
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
    copiarURL(index){
      this.copiar(window.location.href+'hash/'+this.allFiles[index].hash);
    },
    copiarCurrentURL(){
      this.copiar(window.location.href);
    },
    copiar(t){
        var copyText = document.createElement("textarea");
        copyText.value = t;
        document.body.appendChild(copyText);
        copyText.focus();
      /* Select the text field */
        copyText.select();
        copyText.setSelectionRange(0, 99999); /*For mobile devices*/
        /* Copy the text inside the text field */
        document.execCommand("copy");
        //console.log("Copied the text: " + copyText.value);
        document.body.removeChild(copyText);
    },
    convertTime(timestamp){
      var date = new Date(timestamp*1000)
      var options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', timeZoneName: 'short' };
      date = date.toLocaleDateString('es-AR', options)
      return date
    }
   },
   components: {
     DropFile
   }
 }

</script>
