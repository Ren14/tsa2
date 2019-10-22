import { sign } from "crypto";

class Stamper {
    constructor(web3, contractAbi, contractAddress) {
        this.web3 = web3
        this.contractAddress = contractAddress
        this.contract = new web3.eth.Contract(contractAbi, contractAddress)
    }

    // stampea un conjunto de objects (hashes) recibido como array
    // utiliza la cuenta walletAccount para enviar la transaccion
    // (o defaultAccount si no se especifica)
    async stamp(objects, walletAccount) {
        console.log(`asked to stamp ${objects}`)
        try {
            // si walletAccount es undefined trata de usar la account de web3.eth.defaultAccount
            let defaultAccount = (walletAccount) ? walletAccount.address : this.web3.eth.defaultAccount
            let objectsToStamp = [] // Guardo los hashes que seran enviados a la BFA
            let objectsStamped = [] // Guardo los objetos que ya fueron enviados a la BFA

            for (let i=0; i < objects.length; i++) {
                let blockNo = await this.contract.methods.getBlockNo(objects[i], defaultAccount).call()
                if (blockNo == 0){                
                    objectsToStamp.push(objects[i]);
    	        } else {
            	    console.log(`already stamped: ` + objects[i] + ' blockNro: ' + blockNo);
                    let new_object = {
                        hash: objects[i],
                        block_number: blockNo,
                        status: 'already_stamped_by_this_TSA',
                    }
                    objectsStamped.push(new_object);
    	        }
            }

            if (objectsToStamp.length == 0) return new Promise( (resolve) => {
                console.log(`Los objects enviados ya están stampeados`)            
                resolve(objectsStamped)
            })        
            
            console.log(`stamping ` +  objectsToStamp.join(', '));

            let txPromise
            let gasLimit = 2000000

            if (walletAccount) {
                let methodPut = this.contract.methods.put(objectsToStamp)
                let encodedABI = methodPut.encodeABI()

                let tx = {
                    to: this.contractAddress,
                    // v: 47525974938 * 35 + 2,
                    // v: 47525974938,
                    // Parece que sin chainId funciona igual - hasta a veces mejor. Pero en la red Testnet, hay que agregar el chainID 99118822
                    chainId: '99118822',
                    gas: gasLimit,
                    // gasLimit: gasLimit,
                    data: encodedABI,
    		        nonce: this.web3.bfa.txnonce++
                }
                // tx.v = Buffer.from([47525974938])
                // tx.nonce = this.web3.utils.toHex(await this.web3.eth.getTransactionCount(defaultAccount))

                let signedTx = await walletAccount.signTransaction(tx)
                // console.log(signedTx)
                // txPromise = this.web3.eth.sendSignedTransaction(signedTx)
                // txPromise = this.web3.eth.sendSignedTransaction('0x' + signedTx.serialize().toString('hex'))
                txPromise = await this.web3.eth.sendSignedTransaction(signedTx.rawTransaction) // Apliqué el await para que espere a que finalice la operación
                
                let tx_result = []; // Objeto que contiene la info de la TX

                if(txPromise.status == true){
                    tx_result = {
                        status: 'stamped',
                        block_number: txPromise.blockNumber,
                        hash: txPromise.transactionHash,
                    };
                } else {                
                    tx_result = {
                        status: 'error',
                        block_number: '-',
                        hash: '-',
                    };
                }

                
                for (let i=0; i < objectsToStamp.length; i++) {
                        // Creo un nuevo objeto con la info de la tx realizada
                        let new_object = {
                            hash: objectsToStamp[i],
                            block_number: tx_result.block_number,
                            status: tx_result.status,
                            tx_hash: tx_result.hash,
                        }
                        // Agrego el objeto al array de objetos stampados (incluye los que ya fueron stampados, si los hubiese, y los nuevos)
                        objectsStamped.push(new_object)
                    }
            } else {
                txPromise = await this.contract.methods.put(objectsToStamp).send({
                    from: defaultAccount,
                    gasLimit: gasLimit
                })
            }

            // Retorno un array con todos los objetos stampados
            return objectsStamped;
        } catch (e) {
            console.error(e)
            throw e
        }

            // Código anterior, comentado a la espera de confirmar el cambio
            /*txPromise.then((receipt) => {
                console.log(`> objects stampeados en bloque: ${receipt.blockNumber}`)
                console.log(`> Hash de la Tx: ${receipt.transactionHash}`)
                console.log(`> Hash/es enviado/s:`)
                console.log(objectsToStamp)
            }).catch((error) => {
                console.error(error)
            })*/

            /*return new Promise((resolve, reject) => {
                txPromise.on('transactionHash', (txHash) => {
                    resolve(objectsStamped)
                })
                txPromise.catch((error) => {
                    reject(error)
                })
            })*/
    }

    async wait1block() {
        return new Promise((resolve, reject) => {
        let max = 10;
        let web3 = this.web3;
        web3.eth.getBlockNumber()
            .then(
        (startnum) => {
                setTimeout( 
                function nextblock()
                {
                        web3.eth.getBlockNumber()
                .then(
                (nownum) => {
                            if ( nownum != startnum )
                            resolve( nownum );
                        else
                            if ( max-- > 0 )
                                setTimeout( nextblock, 500 )
                            else
                                reject( 'Timeout. Tal vez no esta sincronizado el nodo local' )
                },
                reject
                )
                },
                500
            )
            },
            (errtxt) => { reject('No conseguimos el blockNumber.\n'+errtxt) }
        )
    })
    }

    async verify(hash) {
        try {
            let count = await this.contract.methods.getObjectCount(hash).call()
            if (count == 0) {
                console.log(`fallo verificación ${hash}`)
                return { stamped: false, stamps: [] }
            }

            var stamps = []
            for (var i = 0; i < count; i++) {
                let stampPos    =       await this.contract.methods.getObjectPos(hash, i).call()
                let stamp       =       await this.contract.methods.getStamplistPos(stampPos).call()
                let whostamped  =       stamp[1];
                let blockno     =       stamp[2];
                let block       =       await this.web3.eth.getBlock( blockno );
                stamps.push({
                        whostamped:     whostamped,
                        blocknumber:    blockno.toString(),
                        blocktimestamp: block.timestamp
                });
            }

            console.log(`exito verificación ${hash}`)
            return { stamped: true, stamps: stamps }
        } catch (e) {
            console.error(e)
            throw e
        }
    }
}

export default Stamper
