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
        <input type="file" id="fileUpload" @change="handleInput" multiple hidden>
        <div>
            <div v-if="uploadedFiles.length == 0">
                <div><span class="glyphicon glyphicon-cloud-upload" aria-hidden="true"></span></div>
                <div class="droptxt" v-html="this.lb_08"></div>
                <div><button type="button" class="btn btn-primary btn-pill" v-on:click.stop="uploadFile()" v-html="this.lb_09"></button></div>
            </div>
            <div v-if="uploadedFiles.length > 0" class="file-info">
                <ul>

                <li v-for="(value, index) in uploadedFiles" :key="index">
                    <p>
                        <span v-html="lb_10"></span> 
                        <b> {{ value.fileName }}</b> 
                    </p>
                    <p class='hash font_small'> 
                        <span v-html="lb_11"></span> 
                        <b> {{ value.hash }}</b> 
                    </p>
                    <button class="btn btn-default remover" v-on:click.stop.prevent="removeFile">
                        <span class="glyphicon glyphicon-trash text-danger " aria-hidden="true"></span> 
                        <span v-html="lb_17" class="sr-only"></span>
                    </button>
                </li>
                </ul>
            </div>
            <!-- <li v-for="(file,index) in uploadedFiles" v-bind:key="index">{{file.fileName}}: {{file.hash}}</li> -->
        </div>
        <div class="add-btn" v-if="uploadedFiles.length > 0 && uploadedFiles.length <= limit-1" >
            <a class="btn btn-default btn-pill"  href="#" v-on:click.stop.prevent="addFile" >
                <span class="glyphicon glyphicon-plus text-primary " aria-hidden="true"></span> 
                <span v-html="this.lb_14"></span>
            </a>
        </div>
        <div v-if="uploadedFiles.length > 0" class="cta">
            <button class="btn btn-lg btn-success btn-pill btn-cta" v-on:click="verify()" v-html="this.lb_13"></button>
            <button class="btn btn-lg btn-primary btn-pill btn-cta"  v-on:click="stamp()" v-html="this.lb_12"></button>
        </div>
        <div class="gobackLink font_small" v-if="uploadedFiles.length > 0" >
            <a href="#" v-on:click.stop.prevent="goBack" >
                <span v-html="this.lb_18"></span>
            </a>
        </div>
        
    </div>
</template>

<script>
import * as SHA256 from "js-sha256"
import axios from "axios"

export default {
    /* eslint-disable */ 
    name: 'DropFile',
    props: ['apiurl',
           'lb_07',
           'lb_08',
           'lb_09',
           'lb_10',
           'lb_11',
           'lb_12',
           'lb_13',
           'lb_14',
           'lb_17',
           'lb_18',
           'lb_19',
           'lb_20',
          ],
    data: function() {
        return {
            loading: false,   
            limit: 10, // CAMBIAR ESTO SI SE PUEDE MAS DE 10 ARCHIVOS         
            uploadedFiles: [],
            verifyCounter: 0,
            allHashes: [],
            dragActive: false
        };
    },
    created: function () {
        var h = this.$route.params.hash;
        if(h != undefined) this.verifybyURL(h);   
    },
    methods: {
        uploadFile() {
            document.getElementById("fileUpload").click()
        },
        checkFile() {
            if (this.uploadedFiles.length <= 0) this.uploadFile();
        },
        handleInput(e) {
            var files = e.target.files;
            this.checkLimit(files);
        },
        handleDrop(e) {
            var files = e.dataTransfer.files;
            this.checkLimit(files);
        },
        checkLimit(ufiles){
            
            var self = this;
            var files = ufiles;
            var lfiles = files.length;
            //Checkea si se agregran todos a la vez
            if(lfiles > 0 && lfiles <= self.limit){
                self.uploadFiles([files]);
            }else{                
                self.limitSurpased(self.limit);
            }
        },
        limitSurpased(value){
            var self = this;
            // console.log(self.lb_19+self.limit+self.lb_20);
            self.$emit('limit-surpassed', value)
        },
        removeFile(e) {
            //Lo saca del array pero no del input
            var li = e.target.closest('li');
            var nodes = Array.from( li.closest('ul').children );
            var index = nodes.indexOf( li );
            this.uploadedFiles.splice(index, 1);
            this.allHashes.splice(index, 1);
            this.limitSurpased(0);
        },
        addFile(){     
            //this.uploadedFiles = [];            
            document.getElementById("fileUpload").click()
        },
        goBack(){     
            this.uploadedFiles = [];            
            this.allHashes = [];            
            document.getElementById("fileUpload").click()
        },
        verify() {
            var self = this;
            self.verifyCounter = 0;
            for (let i = 0; i < self.uploadedFiles.length; i++) {
                    
                var h = self.allHashes[i];
                let verifyUrl = `${this.apiurl}/verify/`+h
                self.loading = true
                axios.get(verifyUrl).then((res) => {
                    //console.log(res.data)
                    if (res.data.stamped) {
                        //self.$emit('verify', res.data.stamps)
                        // if(self.uploadedFiles.length <= 1)
                        // {
                        //     this.$router.push('/hash/'+h)
                        //     this.$route.params.pathMatch
                        // }
                        self.uploadedFiles[i].verified = true;
                        self.uploadedFiles[i].stamps = res.data.stamps;
                        self.checkVerify()
                    } else {
                        //self.$emit('failed-verify')
                        self.uploadedFiles[i].verified = false;
                        // console.error('Verify '+res.data.stamped)
                        self.checkVerify()
                    }
                }).catch((e) => {
                    //self.$emit('failed-verify')
                    console.error(e)
                    self.uploadedFiles[i].verified = false;
                    self.checkVerify()
                }).finally( () => self.loading = false )                
            }
            //self.$emit('verify-completed', self.uploadedFiles)
        },
        checkVerify(){
            var self = this;
            self.verifyCounter++;
            if (self.verifyCounter == self.uploadedFiles.length) self.$emit('verify-completed', self.uploadedFiles)
        },
        verifybyURL(h){
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

            let stampUrl = `${self.apiurl}/stamp`
            self.loading = true
            axios.post(stampUrl, {
                hashes: self.allHashes
            }).then(function(response)
                {
                    if(response.data.status == 'ok'){
                        // Itero por los archivos que fueron enviados a sellar                        
                        for (var i = 0; i < self.uploadedFiles.length; i++) {

                            //Itero por los archivos que me retorno el metodo stamp de la api rest
                            for (var k = 0; k < response.data.txHash.length; k++) {
                                
                                var hash = self.uploadedFiles[i].hash;
                                if ( ! hash.startsWith('0x') ) {
                                    hash = '0x' + hash;
                                }
                                
                                //Agrego nueva info para ser mostrada por pantalla, en cas
                                if(hash == response.data.txHash[k].hash){
                                    self.uploadedFiles[i].block = response.data.txHash[k].block_number;
                                    self.uploadedFiles[i].status = response.data.txHash[k].status;
                                    
                                    if(response.data.txHash[k].status == 'stamped'){
                                        self.uploadedFiles[i].tx_hash =  response.data.txHash[k].tx_hash;
                                    }
                                }    
                            }
                            
                        }
                        
                        console.log(self.uploadedFiles);
                        self.$emit('stamp', self.uploadedFiles);
                    } else {
                        self.$emit('failed-stamp')
                    }
                    
                    // console.log(response)
                    // axios.get(`${self.apiurl}/wait1block`).then(function(response){
                    //     axios.get(`${self.apiurl}/wait1block`).then(() => {
                    //         //console.log('Verificar:'+ self.allHashes)                            
                    //         self.verify(false);
                    //     }).catch((e) => {
                    //         // console.error(e)
                    //         self.$emit('stamp', self.uploadedFiles);
                    //     })
                    // }).catch((e) => {
                    //     // console.error(e)
                    //     self.$emit('stamp', self.uploadedFiles);
                    // })
                }    

            ).catch((e) => {
                console.error(e)
                self.$emit('failed-stamp')
            })
        },
        uploadFiles: function(f) {            
            var self = this;            
            this.loading = true;
            function loadFile(file) {                
                let name = file.name
                self.$emit('nombreArchivo', name)
                let reader = new FileReader()
        
                reader.onload = function(e) {
                    if(self.uploadedFiles.length < self.limit){                
                        let contents = e.target.result
                        let hash = SHA256.create()
                        hash.update(contents)
                        let hex = hash.hex()
                        //Checks if already exists
                        if(self.allHashes.indexOf(hex) === -1){
                            self.uploadedFiles.push({ 
                                fileName: name,
                                hash: hex
                            });
                            self.allHashes.push(hex)
                        } else{
                            //file already uploaded
                        }
                        //self.uploadedFiles = self.getUnique(self.uploadedFiles, 'hash')
                        self.limitSurpased(0);
                    }else{
                        self.limitSurpased(self.limit);
                    }
                    self.loading = false;
                };
                reader.readAsArrayBuffer(file, "UTF-8")
            }    
            for (var i = 0; i < f[0].length; i++) {
                loadFile(f[0][i]);
            }
        },        
        getUnique(arr, comp) {

            const unique = arr
                .map(e => e[comp])

                // store the keys of the unique objects
                .map((e, i, final) => final.indexOf(e) === i && i)

                // eliminate the dead keys & store unique objects
                .filter(e => arr[e]).map(e => arr[e]);

            return unique;
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
