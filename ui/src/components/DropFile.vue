<template>
        <!-- @dragover.prevent @dragover="handleDragStart()" -->
    <div class="dropArea" @drop.prevent @drop="handleDrop($event)" aria-live="polite" v-on:click.stop="checkFile()">  
        <div id="dropzone" class="overlay pulse" style="visibility: hidden;"></div>
        <div class="loading overlay" v-if="loading">
            <svg aria-label="Cargando" class="center-v" version="1.1" id="loader-1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
            width="100px" height="100px" viewBox="0 0 40 40" enable-background="new 0 0 40 40" xml:space="preserve">
                <path opacity="0.4" fill="#fff" d="M20.201,5.169c-8.254,0-14.946,6.692-14.946,14.946c0,8.255,6.692,14.946,14.946,14.946
                s14.946-6.691,14.946-14.946C35.146,11.861,28.455,5.169,20.201,5.169z M20.201,31.749c-6.425,0-11.634-5.208-11.634-11.634
                c0-6.425,5.209-11.634,11.634-11.634c6.425,0,11.633,5.209,11.633,11.634C31.834,26.541,26.626,31.749,20.201,31.749z"/>
                <path fill="#fff" d="M26.013,10.047l1.654-2.866c-2.198-1.272-4.743-2.012-7.466-2.012h0v3.312h0
                C22.32,8.481,24.301,9.057,26.013,10.047z">
                <animateTransform attributeType="xml"
                attributeName="transform"
                type="rotate"
                from="0 20 20"
                to="360 20 20"
                dur="0.5s"
                repeatCount="indefinite"/>
                </path>
            </svg>
            <!-- <img class="center-v" src="static/images/loader.svg" width="100px" height="100px" alt="Cargando"> -->
        </div>
        <div>
            <div v-if="uploadedFiles.length == 0">
                <div><span class="glyphicon glyphicon-cloud-upload" aria-hidden="true"></span></div>
                <div class="droptxt">Arrastrá un archivo aquí<br>ó</div>
                <div><button type="button" class="btn btn-primary btn-pill" v-on:click.stop="uploadFile()">Seleccioná un archivo <span class="sr-only">para Sellar o Verificar</span></button></div>
                <input type="file" id="fileUpload" @change="handleInput" hidden>
            </div>
            <div v-if="uploadedFiles.length > 0" class="file-info">
                <p> 
                    Nombre del archivo: <b> {{ uploadedFiles[0].fileName }}</b> 
                </p>
                <p class='hash'> 
                    Hash del archivo: <b> {{ uploadedFiles[0].hash }}</b> 
                </p>
            </div>
            <!-- <li v-for="(file,index) in uploadedFiles" v-bind:key="index">{{file.fileName}}: {{file.hash}}</li> -->
        </div>

        <div>
            <button class="btn btn-lg btn-primary btn-pill" v-if="uploadedFiles.length > 0" v-on:click="stamp()">Sellar</button>
            <button class="btn btn-lg btn-success btn-pill" v-if="uploadedFiles.length > 0" v-on:click="verify(uploadedFiles[0].hash)">Verificar</button>
        </div>
        <div class="gobackLink font_small"  v-if="uploadedFiles.length > 0" >
            <a href="#" v-on:click.stop="goBack()">Seleccionar otro archivo</a>
        </div>
    </div>
</template>

<script>
import * as SHA256 from "js-sha256"
import axios from "axios"

export default {
    /* eslint-disable */ 
    name: 'DropFile',
    props: ['apiurl','timer'],
    data: function() {
        return {
            loading: false,
            uploadedFiles: [],
            dragActive: false
        };
    },
    created: function () {
        var h = this.$route.params.hash;
        if(h != undefined) this.verify(h)        
    },
    methods: {
        uploadFile() {
            document.getElementById("fileUpload").click()
        },
        checkFile() {
            if (this.uploadedFiles.length <= 0) this.uploadFile();
        },
        handleInput(e) {
            var files = e.target.files
            this.uploadFiles([files[0]])
        },
        handleDrop(e) {
            var files = e.dataTransfer.files;
            //console.log("Drop files:", files);
            //this.uploadFile(files);
            this.uploadFiles([files[0]]);
        },
        goBack(){     
            this.uploadedFiles = [];
        },
        verify(h) {
            var self = this;
            let verifyUrl = `${this.apiurl}/verify/`+h
            self.loading = true
            axios.get(verifyUrl).then((res) => {
                //console.log(res.data)
                if (res.data.stamped) {
                    self.$emit('verify', res.data.stamps)
                    this.$router.push('/hash/'+h)
                    this.$route.params.pathMatch
                } else {
                    self.$emit('failed-verify')
                }
            }).catch((e) => {
                self.$emit('failed-verify')
                //console.error(e)
            }).finally( () => self.loading = false )
        },
        stamp() {
            var self = this;

            let stampUrl = `${this.apiurl}/stamp`
            self.loading = true
            axios.post(stampUrl, {
                hashes: [self.uploadedFiles[0].hash]
            }).then((res) => {
                self.waitToVerify();
                //self.$emit('stamp', self.uploadedFiles[0].hash);
                //this.verify(self.uploadedFiles[0].hash);
            }).catch((e) => {
                //console.error(e)
                self.$emit('failed-stamp')
            })
        },
        waitToVerify(){
            var self = this;
            var t = this.timer * 1000;
            setTimeout(function(){ self.verify(self.uploadedFiles[0].hash) }, t);
        },
        uploadFiles: function(f) {            
            var self = this;
            this.loading = true
            function loadFile(file) {
                let name = file.name
                self.$emit('nombreArchivo', name)
                let reader = new FileReader()
        
                reader.onload = function(e) {
                    let contents = e.target.result
                    let hash = SHA256.create()
                    hash.update(contents)
                    let hex = hash.hex()
                    // replace for time being
                    self.uploadedFiles = [{ 
                        fileName: name,
                        hash: hex
                    }]
                    self.loading = false
                };
                reader.readAsArrayBuffer(file, "UTF-8")
            }    
            for (var i = 0; i < f.length; i++) {
                loadFile(f[i]);
            }
        }
    },
    mounted() {

        var counter = 0;

        window.addEventListener("dragenter", function (e) {
            e.preventDefault();         
            counter++;   
            document.querySelector("#dropzone").style.visibility = "";
        });
  
        window.addEventListener("dragleave", function (e) {
            e.preventDefault();
            counter--;
            if (counter === 0) { 
                document.querySelector("#dropzone").style.visibility = "hidden";
            }
        });
  
        window.addEventListener("dragover", function (e) {
            e.preventDefault();
            document.querySelector("#dropzone").style.visibility = "";
        });
  
        window.addEventListener("drop", function (e) {
            e.preventDefault();
            document.querySelector("#dropzone").style.visibility = "hidden";
        });
    }
  }
</script>
