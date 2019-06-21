import { sign } from "crypto";

//const stamperInterface = require('../../contract/build/contracts/Stamper.json')

class Stamper {
    constructor(web3, contractAbi, contractAddress) {
        this.web3 = web3
        this.contractAddress = contractAddress
        this.contract = new web3.eth.Contract(contractAbi, contractAddress)
    }

    // stampea un conjunto de hashes.
    // si walletAccount es undefined trata de usar la account de web3.eth.defaultAccount
    async stamp(hashes, walletAccount) {
        console.log(`stamping ${hashes}`)

        let defaultAccount = (walletAccount) ? walletAccount.address : this.web3.eth.defaultAccount
        let hashesToStamp = []

        for (let i=0; i < hashes.length; i++) {
            let blockNo = await this.contract.methods.getBlockNo(hashes[i], defaultAccount).call()
            if (blockNo == 0) hashesToStamp.push(hashes[i])
        }

        if (hashesToStamp.length == 0) return new Promise( (resolve) => {
            console.log(`Los hashes enviados ya están stampeados`)
            resolve()
        })

        let txPromise
        let gasLimit = 2000000

        if (walletAccount) {
            let methodPut = this.contract.methods.put(hashesToStamp)
            let encodedABI = methodPut.encodeABI()

            let tx = {
                to: this.contractAddress,
                // v: 47525974938 * 35 + 2,
                // v: 47525974938,
                chainId: '200941592',
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
            txPromise = this.contract.methods.put(hashesToStamp).send({
                from: defaultAccount,
                gasLimit: gasLimit
            })
        }

        txPromise.then((receipt) => {
            console.log(`> hashes stampeados en bloque: ${receipt.blockNumber}`)
            console.log(hashesToStamp)
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

    async verify(hash) {
        try {
            let count = await this.contract.methods.getObjectCount(hash).call()
            if (count == 0) {
                console.log(`fallo verificación ${hash}`)
                return { stamped: false, stamps: [] }
            }

            var stamps = []
            for (var i = 0; i < count; i++) {
                let stampPos = await this.contract.methods.getObjectPos(hash, i).call()
                let stamp = await this.contract.methods.getStamplistPos(stampPos).call()

                stamps.push({ stamper: stamp[1], block: stamp[2].toString() })
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