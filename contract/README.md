# Deployando a BFA

Para hacer esto tuve que utilizar truffle-hdwallet-provider. Esto fue debido a
la imposibilidad de unlockear la account en geth directamente por un cambio reciente:

```bash
npm install truffle-hdwallet-provider
```

Luego, hay que obtener la clave privada de la cuenta Ethereum y ponerla en la variable de entorno ```GETH_ACCOUNT_PKEY``` antes de invocar el ```truffle migrate``` a la red.

Para obtener la clave privada hay que seguir las instrucciones en https://ethereum.stackexchange.com/questions/12830/how-to-get-private-key-from-account-address-and-password 

Instalar **keythereum** en _otro_ directorio (porque si no se pelea con directorios que ya usa truffle):

```bash
mkdir /tmp/keythereum
cd /tmp/keythereum
npm install keythereum
```

Ubicar la dirección de la cuenta en el archivo que está en ```/home/bfa/bfa/network/node/keystore``` (o ```/home/bfa/bfa/test2network/node/keystore``` si es la red de testing).

Después, invocar a la consola node.js (con el comando ```nodejs```) y ejecutar los siguientes pasos (cambiando _miclave_ por la clave de la cuenta -o el string vacío si la cuenta no tiene clave- y la dirección obtenida arriba en lugar de _MiDireccion_):

```javascript
var keythereum = require("keythereum");
var datadir = "/home/bfa/bfa/network/node"; // si es la red de testing usar "/home/bfa/bfa/test2network/node"
var address= "0xMiDireccion";
const password = "miclave";

var keyObject = keythereum.importFromFile(address, datadir);
var privateKey = keythereum.recover(password, keyObject);
console.log(privateKey.toString('hex'));
```
el ```console.log()``` va a imprimir una clave con este aspecto: **bab415bada55bab415bada55bab415bada55bab415bada55bab415bada55bab4**.

Eso es lo que hay que poner en la variable de entorno ```GETH_ACCOUNT_PKEY```.

La invocación se hace así **esto deployea a bfa**
```bash
GETH_ACCOUNT_PKEY=bab415bada55bab415bada55bab415bada55bab415bada55bab415bada55bab4 truffle migrate --network bfa
```

(Si se quiere deployar a la red de testing utilizar ```--network bfatest2```)

