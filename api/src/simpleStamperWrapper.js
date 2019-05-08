const simpleStamperInterface = require('../../contract/build/contracts/SimpleStamper.json')

class SimpleStamper {
    constructor(web3, netId) {
        this.web3 = web3
        let address = simpleStamperInterface.networks[netId].address
        this.contract = new web3.eth.Contract(simpleStamperInterface.abi, address)
    }

    setSender(fromAddress) {
        this.from = fromAddress
    }

    async stamp(hash) {
        console.log(`${hash}: stamping`)
        let txPromise = this.contract.methods.stamp(hash).send({
            from: this.from
        })

        txPromise.then((receipt) => {
            console.log(`${hash}: stamped (bloque: ${receipt.blockNumber})`)
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
            let blockNumber = await this.contract.methods.getBlockNumber(hash).call()
            console.log(`${hash}: blockNmb (${blockNumber})`)
            return {
                verified: blockNumber > 0,
                blockNumber: blockNumber
            }
        } catch (e) {
            console.error(e)
            throw e
        }
    }
}

export default SimpleStamper