<template>
        <!-- @dragover.prevent @dragover="handleDragStart()" -->
    <div class="dropArea" @drop.prevent @drop="handleDrop($event)" aria-live="polite">
    
        <div id="dropzone" class="overlay pulse" style="visibility: hidden;"></div>
        <div class="loading overlay" v-if="loading">
            <img class="center-v" src="/static/images/loader.svg" width="100px" height="100px" alt="Cargando">
        </div>
        <div>
            <div v-if="uploadedFiles.length == 0">
                <div><span class="glyphicon glyphicon-cloud-upload" aria-hidden="true"></span></div>
                <div class="droptxt">Arrastrá un archivo aquí<br>ó</div>
                <div><button type="button" class="btn btn-primary btn-pill" v-on:click="uploadFile()">Seleccioná un archivo <span class="sr-only">para Sellar o Verificar</span></button></div>
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
            <button class="btn btn-lg btn-success btn-pill" v-if="uploadedFiles.length > 0" v-on:click="verify()">Verificar</button>
        </div>
    </div>
</template>

<script>
import * as SHA256 from "js-sha256"
import axios from "axios"

export default {
    /* eslint-disable */ 
    name: 'DropFile',
    props: ['apiurl'],
    data: function() {
        return {
            loading: false,
            uploadedFiles: [],
            dragActive: false
        };
    },
    methods: {
        uploadFile() {
            document.getElementById("fileUpload").click()
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
        verify() {
            var self = this;

            let hash = self.uploadedFiles[0].hash
            let verifyUrl = `${this.apiurl}/verify/${hash}`
            self.loading = true
            axios.get(verifyUrl).then((res) => {
                //console.log(res.data)
                if (res.data.stamped) {
                    self.$emit('verify', res.data.stamps)
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
                //console.log(res.data)
                self.$emit('stamp')
            }).catch((e) => {
                //console.error(e)
                self.$emit('failed-stamp')
            }).finally( () => self.loading = false )
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
