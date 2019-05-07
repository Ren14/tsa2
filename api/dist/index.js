"use strict";

require("dotenv/config");

var _web = _interopRequireDefault(require("web3"));

var _express = _interopRequireDefault(require("express"));

var _cors = _interopRequireDefault(require("cors"));

var _bodyParser = _interopRequireDefault(require("body-parser"));

var _expressBasicAuth = _interopRequireDefault(require("express-basic-auth"));

var _simpleStamperWrapper = _interopRequireDefault(require("./simpleStamperWrapper"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

async function setupWeb3Ganache() {
  try {
    let netIsListening = await web3.eth.net.isListening();
    let netId = await web3.eth.net.getId();
    web3.eth.defaultAccount = (await web3.eth.getAccounts())[0];
    console.log(`Conectado exitosamente a Ganache: 
 > netId: ${netId}
 > account: ${web3.eth.defaultAccount}
    `);
  } catch (e) {
    console.error('Error de conexión');
    console.error(e);
    process.exit(1);
  }
}

var web3 = web3;

if (typeof web3 !== 'undefined') {
  console.log('Cargando web3 provider desde el entorno'); // Use Mist/MetaMask's provider
  //conector.setWeb3Instance(new Web3(web3.currentProvider))
} else {
  //console.warn(web3.eth.defaultAccount)
  console.log('Conectando a Ganache');
  web3 = new _web.default(new _web.default.providers.HttpProvider('http://localhost:7545'));
  web3.eth.defaultAccount = web3.eth.accounts[0];
  setupWeb3Ganache();
}

const app = (0, _express.default)();
app.use((0, _cors.default)());
app.use(_bodyParser.default.json());

if (process.env.AUTH_TYPE === 'basic') {
  if (process.env.API_USER && process.env.API_PASS) {
    var users = {};
    users[process.env.API_USER] = process.env.API_PASS;
    app.use((0, _expressBasicAuth.default)({
      users: users,
      challenge: true
    }));
  } else {
    console.error("El servidor es PUBLICO");
  }
}

app.post('/stamp', async (req, res) => {
  let netId = await web3.eth.net.getId();
  let ss = new _simpleStamperWrapper.default(web3, netId);
  ss.setSender(web3.eth.defaultAccount);

  if (!("hash" in req.body)) {
    res.status(422);
    res.send('No se incluyó la clave hash en el cuerpo del POST');
    return;
  }

  var hash = req.body.hash;

  if (!hash.startsWith('0x')) {
    hash = '0x' + hash;
  }

  try {
    let txHash = await ss.stamp(hash);
    let fullUrl = req.protocol + '://' + req.get('host');
    return res.json({
      verifyUri: `${fullUrl}/verify/${hash}`,
      hash: txHash
    });
  } catch (e) {
    res.status(500);
    res.send('Error interno. Chequee el log de la aplicación para más detalles');
  }
});
app.get('/verify/:hash', async (req, res) => {
  let netId = await web3.eth.net.getId();
  let ss = new _simpleStamperWrapper.default(web3, netId);
  ss.setSender(web3.eth.defaultAccount);
  var value = req.params.hash;

  if (!value.startsWith('0x')) {
    value = '0x' + value;
  }

  try {
    let info = await ss.verify(value);
    return res.json(info);
  } catch (e) {
    console.error(e);
    res.status(404);
    res.send("No existe el hash en la base de datos");
  }
}); // app.get('/status/:txHash', async (req, res) => {
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

let port = process.env.PORT ? process.env.PORT : 3000;
app.listen(port, () => console.log(`TSA Api corriendo en ${port}!`));