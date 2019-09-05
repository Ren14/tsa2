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
        console.log(`stamping ${objects}`)

        // si walletAccount es undefined trata de usar la account de web3.eth.defaultAccount
        let defaultAccount = (walletAccount) ? walletAccount.address : this.web3.eth.defaultAccount
        let objectsToStamp = []

        for (let i=0; i < objects.length; i++) {
            let blockNo = await this.contract.methods.getBlockNo(objects[i], defaultAccount).call()
            if (blockNo == 0) objectsToStamp.push(objects[i])
        }

        if (objectsToStamp.length == 0) return new Promise( (resolve) => {
            console.log(`Los objects enviados ya están stampeados`)
            resolve()
        })

        let txPromise
        let gasLimit = 2000000

        if (walletAccount) {
            let methodPut = this.contract.methods.put(objectsToStamp)
            let encodedABI = methodPut.encodeABI()

            let tx = {
                to: this.contractAddress,
                // v: 47525974938 * 35 + 2,
                // v: 47525974938,
                // Parece que sin chainId funciona igual - hasta a veces mejor.
                //chainId: '200941592',
                gas: gasLimit,
                // gasLimit: gasLimit,
                data: encodedABI
            }
            // tx.v = Buffer.from([47525974938])
            // tx.nonce = this.web3.utils.toHex(await this.web3.eth.getTransactionCount(defaultAccount))

            let signedTx = await walletAccount.signTransaction(tx)
            // console.log(signedTx)
            // txPromise = this.web3.eth.sendSignedTransaction(signedTx)
            // txPromise = this.web3.eth.sendSignedTransaction('0x' + signedTx.serialize().toString('hex'))
            txPromise = this.web3.eth.sendSignedTransaction(signedTx.rawTransaction)
        } else {
            txPromise = this.contract.methods.put(objectsToStamp).send({
                from: defaultAccount,
                gasLimit: gasLimit
            })
        }

        txPromise.then((receipt) => {
            console.log(`> objects stampeados en bloque: ${receipt.blockNumber}`)
            console.log(objectsToStamp)
        }).catch((error) => {
            console.error(error)
        })

        return new Promise((resolve, reject) => {
            txPromise.on('transactionHash', (txHash) => {
                resolve(txHash)
            })
            txPromise.catch((error) => {
                reject(error)
            })
        })
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
