<template>
        <!-- @dragover.prevent @dragover="handleDragStart()" -->
    <div class="drop-file" @drop.prevent @drop="handleDrop($event)">
    
        <div style="visibility:hidden; opacity:0" id="dropzone">
            <div class="center-v">Arrastrá el archivo aquí</div>
        </div>
        <div class="loading" v-if="loading">
            <div class="center-v">Loading . . .</div>
        </div>
        <div class="col-md-4" id="file-panel">
            <div class="panel panel-success">
                <div class="panel-body">
                    <div v-if="uploadedFiles.length == 0">
                        <p><strong>Arrastrá un archivo aquí</strong></p>
                        <p>o</p>
                        <p>
                            <label class="text-reader">
                                Elegir archivo 
                                <input type="file" @change="handleInput">
                            </label>
                        </p>
                    </div>
                    <div v-if="uploadedFiles.length > 0" class="file-info">
                        <p> 
                            Nombre del archivo: <b> {{ uploadedFiles[0].fileName }}</b> 
                        </p>
                        <p class='hash'> 
                            Hash: <b> {{ uploadedFiles[0].hash }}</b> 
                        </p>
                    </div>
                    <!-- <li v-for="(file,index) in uploadedFiles" v-bind:key="index">{{file.fileName}}: {{file.hash}}</li> -->
                </div>
            </div>
        </div>

        <div class="buttons">
            <button v-if="uploadedFiles.length > 0" v-on:click="stamp()">Stamp</button>
            <button v-if="uploadedFiles.length > 0" v-on:click="verify()">Verify</button>
        </div>
    </div>
</template>

<script>
import * as SHA256 from "js-sha256"
import axios from "axios"

export default {
    name: 'DropFile',
    data: function() {
        return {
            loading: false,
            uploadedFiles: [],
            dragActive: false
        };
    },
    methods: {
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

            let baseUrl = process.env.VUE_APP_API_URL
            let hash = self.uploadedFiles[0].hash
            let verifyUrl = `${baseUrl}/verify/${hash}`
            self.loading = true
            axios.get(verifyUrl).then((res) => {
                console.log(res.data)
                if (res.data.stamped) {
                    self.$emit('verify', res.data.stamps)
                } else {
                    self.$emit('failed-verify')
                }
            }).catch((e) => {
                self.$emit('failed-verify')
                console.error(e)
            }).finally( () => self.loading = false )
        },
        stamp() {
            var self = this;

            let baseUrl = process.env.VUE_APP_API_URL
            let stampUrl = `${baseUrl}/stamp`
            self.loading = true
            axios.post(stampUrl, {
                hashes: [self.uploadedFiles[0].hash]
            }).then((res) => {
                console.log(res.data)
                self.$emit('stamp')
            }).catch((e) => {
                console.error(e)
                self.$emit('failed-stamp')
            }).finally( () => self.loading = false )
        },
        uploadFiles: function(f) {
            var self = this;
    
            this.loading = true
            function loadFile(file) {
                let name = file.name
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
        window.addEventListener("dragenter", function (e) {
            e.preventDefault();
            
            document.querySelector("#dropzone").style.visibility = "";
            document.querySelector("#dropzone").style.opacity = 1;
        });
  
        window.addEventListener("dragleave", function (e) {
            e.preventDefault();

            document.querySelector("#dropzone").style.visibility = "hidden";
            document.querySelector("#dropzone").style.opacity = 0;
        });
  
        window.addEventListener("dragover", function (e) {
            e.preventDefault();

            document.querySelector("#dropzone").style.visibility = "";
            document.querySelector("#dropzone").style.opacity = 1;
        });
  
        window.addEventListener("drop", function (e) {
            e.preventDefault();
            document.querySelector("#dropzone").style.visibility = "hidden";
            document.querySelector("#dropzone").style.opacity = 0;
        })
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.drop-file {
    width: 100%;
    height: 100%;
}

.text-reader {
  position: relative;
  overflow: hidden;
  display: inline-block;

  /* Fancy button looking */
  border: 1px solid black;
  border-radius: 5px;
  padding: 6px 10px;
  margin: 5px;
  cursor: pointer;
}

.text-reader input {
  position: absolute;
  top: 0;
  left: 0;
  z-index: -1;
  opacity: 0;
}

.hash {
    word-wrap: break-word;
}

.panel-body {
    padding: 20px
}
.panel-body p {
    margin: 0
}
.buttons {
    position: absolute;
    top: 104%;
    margin: 0 auto;
    width: 100%;
}

.loading {
    position: absolute;
    /* top: 0;
    left: 0;  */
    z-index: 9999999999;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    transition: visibility 175ms, opacity 175ms;
    display: table;
    text-shadow: 1px 1px 2px #000;
    color: #fff;
    background: rgba(0, 0, 0, 0.45);
    font: bold 42px Oswald, DejaVu Sans, Tahoma, sans-serif;
}

.center-v {
    display: table-cell;
    text-align: center;
    vertical-align: middle;
    transition: font-size 175ms;
}
div#dropzone {
    position: absolute;
    /* top: 0;
    left: 0;  */
    z-index: 9999999999;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    transition: visibility 175ms, opacity 175ms;
    display: table;
    text-shadow: 1px 1px 2px #000;
    color: #fff;
    background: rgba(0, 0, 0, 0.45);
    font: bold 42px Oswald, DejaVu Sans, Tahoma, sans-serif;
}

</style>
