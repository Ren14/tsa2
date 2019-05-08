//const stamperInterface = require('../../contract/build/contracts/Stamper.json')

class Stamper {
    constructor(web3, contractAbi, contractAddress) {
        this.web3 = web3
        this.contract = new web3.eth.Contract(contractAbi, contractAddress)
    }

    setSender(fromAddress) {
        this.from = fromAddress
    }

    async stamp(hashes) {
        console.log(`stamping ${hashes}`)

        let hashesToStamp = []

        for (let i=0; i < hashes.length; i++) {
            let blockNo = await this.contract.methods.getBlockNo(hashes[i], this.from).call()
            if (blockNo == 0) hashesToStamp.push(hashes[i])
        }

        if (hashesToStamp.length == 0) return new Promise( (resolve) => {
            console.log(`Los hashes enviados ya están stampeados`)
            resolve()
        })

        let txPromise = this.contract.methods.put(hashesToStamp).send({
            from: this.from,
            gasLimit: 500000
        })

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