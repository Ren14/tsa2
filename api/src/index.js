import 'dotenv/config'

import Web3             from 'web3'
import express          from 'express'
import cors             from 'cors'
import bodyParser       from 'body-parser'
import basicAuth        from 'express-basic-auth'
import Stamper          from './StamperWrapper'
import fs               from 'fs'

/***************************************************/
// Conexión al provider
/***************************************************/
const   providerHost    =   process.env.GETH_HOST         || 'http://localhost:8545'
const   accountIsSet    =   process.env.GETH_ACCOUNT_JSON || false

var     web3            =   web3
if (typeof web3 !== 'undefined') {
    console.log('Cargando web3 provider desde el entorno')
    // Use Mist/MetaMask's provider
    //conector.setWeb3Instance(new Web3(web3.currentProvider))
} else {
    console.log(`Conectando a ${providerHost}`)
    web3 = new Web3(new Web3.providers.HttpProvider(providerHost))
    setupWeb3()
}

let     contractAbi;
let     contractAddress;
let     walletAccount;

async function setupWeb3() {
    try {
        let     netIsListening      =   await web3.eth.net.isListening()
        let     netId               =   await web3.eth.net.getId()
        if (accountIsSet) {
            let     rawKeyJsonV3    =   fs.readFileSync(process.env.GETH_ACCOUNT_JSON)
            let     keyJsonV3       =   JSON.parse(rawKeyJsonV3)
            let     key             =   web3.eth.accounts.decrypt(keyJsonV3, process.env.GETH_ACCOUNT_PASSWORD)
            walletAccount           =   web3.eth.accounts.wallet.add(key)
            web3.eth.defaultAccount =   (await web3.eth.getAccounts())[0]
        } else {
            // se trata de utilizar una que haya abierta
            web3.eth.defaultAccount =   (await web3.eth.getAccounts())[0]
        }
	web3.bfa	            =   {
		txnonce: await web3.eth.getTransactionCount(web3.eth.defaultAccount),
	}

        /***************************************************/
        // Carga de contrato
        /***************************************************/
        if (process.env.CONTRACT_ABI_PATH) {
            contractAbi             =   require(process.env.CONTRACT_ABI_PATH)
            if ( ! process.env.CONTRACT_ADDRESS ) {
                console.error('Si se especifica el path de un abi, debe proveerse un address con la env CONTRACT_ADDRESS')
                process.exit(1)
            }
            contractAddress         =   process.env.CONTRACT_ADDRESS
        } else {
            let     path            =   '../../contract/build/contracts/Stamper.json'
            console.log(`Intentando cargar ${path} netId: ${netId}`)
            let     data            =   require(path)
            contractAbi             =   data.abi
            contractAddress         =   data.networks[netId].address
        }

        console.log(`Conectado exitosamente: 
 > host: ${providerHost}
 > netId: ${netId}
 > account: ${web3.eth.defaultAccount}
 > address: ${contractAddress}
    `)
    } catch (e) {
        console.error('Error de conexión')
        console.error(e)
        process.exit(1)
    }
}

/***************************************************/
// Setup CORS y Auth
/***************************************************/
const   app                         =   express()

// USE_CORS=0 para disablear
const   useCors                     =   process.env.USE_CORS || 1
if (useCors)
    app.use(cors())
app.use(bodyParser.json())

if ( process.env.API_USER && process.env.API_PASS ) {
    var     users                   =   {}
    users[process.env.API_USER]     =   process.env.API_PASS

    app.use(basicAuth({
        users: users,
        challenge: true
    }))
} else {
    console.log("El servidor es PUBLICO")
}

/***************************************************/
// API Endpoints
/***************************************************/
app.get('/wait1block', async (req, res) => {
    console.log( Date() + ": /wait1block" );
    let     ss                      =   new Stamper(web3, contractAbi, contractAddress)

    try {
        let     blockno             =   await ss.wait1block()
        return res.json(
	    {
		success:        true,
		blocknumber:    blockno
	    }
	)
    } catch (e) {
        console.error( e )
        res.status( 500 )
        res.send( e )
    }
})
app.post('/stamp', async (req, res) => {
    console.log( Date() + ": /stamp " + req.body.hashes.join(', ') );
    let     ss                      =   new Stamper(web3, contractAbi, contractAddress)

    if ( ! ("hashes" in req.body) )
    {
        res.status(422)
        res.send('No se incluyó la clave hashes en el cuerpo del POST')
        return
    }

    let     hashes                  =   req.body.hashes
    if ( ! Array.isArray(hashes))
    {
        res.status(422)
        res.send('La clave hashes debe ser un array')
        return
    }

    for ( let i=0; i < hashes.length; i++ )
    {
        let     hash                =   hashes[i]
        if ( ! hash.startsWith('0x') ) {
            hash                    =   '0x' + hash
        }
        hashes[i]                   =   hash
    }

    // Ahora retorno un JSON con el resultado de la operación
    try
    {
        let     txHash              =   await ss.stamp(hashes, walletAccount)
        //let   fullUrl             =   req.protocol + '://' + req.get('host')        
        console.log(">>>> Stamp OK <<<<");
        res.json({
            status: 'ok',
            txHash
        });
    } catch (e) {
        console.log(">>>> Stamp ERROR <<<<");
        console.error(e)
        //res.status(500)
        //res.send('Error interno. Chequee el log de la aplicación para más detalles')
        res.json({
            status: 'error',
            error: e,
        })
    }
})

app.get('/verify/:hash', async (req, res) => {
    console.log( Date() + ": /verify/:" + req.params.hash );
    let     ss                      =   new Stamper(web3, contractAbi, contractAddress)

    var     value                   =   req.params.hash
    if ( ! value.startsWith('0x') )
        value = '0x' + value

    try {
        let     info                =   await ss.verify(value)
        return res.json(info)
    } catch (e) {
        console.error(e)
        res.status(404)
        res.send("No existe el hash en la base de datos")
    } 
})

// app.get('/status/:txHash', async (req, res) => {
//     try {
//         let info = await web3.eth.getTransaction(req.params.txHash, (e, f) => {
//             console.log(e)
//             console.log(f)
//         })
//         console.log(info)
//         res.send(info)
//     } catch (e) {
//         res.send(e)
//     }
// })


let     port                        =   (process.env.PORT) ? process.env.PORT : 3000

app.listen(port, () =>
    console.log(`TSA Api corriendo en ${port}!`),
)
