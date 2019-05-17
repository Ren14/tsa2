# TSA2

Actualmente el contrato se encuentra deployado en BFA:
 * dirección: **0x7e56220069CAaF8367EA42817EA9210296AeC7c6**
 * abi: https://gitlab.bfa.ar/blockchain/tsa2/blob/develop/api/abi.json

## Discusión
Cosas que habría que discutir:
 * algoritmo de hasheo de archivos (ahora es sha256 se prefiere keccak o sha3?)
   * https://emn178.github.io/online-tools/keccak_256_checksum.html
 * vale la pena ponerse a ahorrar gas? Ahora cada put sale ~150000 GAS

## Dependencias
**Todo fue probado con node 10.8 y npm 6.2.**

Si se desea hacer modificaciones en el contrato hay que tener instalado truffle 
de manera global:
```bash
npm install -g truffle
```

## Instalación de desarrollo
Para desarrollo se utilizó Ganache, una "one click blockchain". Se puede
descargar desde acá: https://truffleframework.com/ganache

El proyecto está compuesto por tres componentes, los contratos, una api rest
y una interfaz gráfica.

### Deployar los contratos
La primera vez hay que ejecutar lo siguiente dentro del directorio ```contract```
```bash
npm install
```

Para manejar los contratos se utilizó truffle, para hacer el deploy de los
contratos hay que correr dentro del directorio ```contract``` el siguiente comando
```bash
truffle migrate
```

Si se hacen modificaciones sobre el contrato se debe ejecutar lo siguiente:
```bash
truffle migrate --reset
```

El contrato utilizado es el de Robert con unas pequeñas modificaciones, se puede ver
en ```contract/contracts/Stamper.sol```.

### Correr API
La primera vez hay que ejecutar lo siguiente dentro del directorio ```api```
```bash
npm install
```

Para que la API quede corriendo hay que ejecutar:
```bash
npm run serve
```

Si todo fue bien, se debería ver algo así en la consola:
```bash
➜  api git:(master) ✗ npm run serve         

> api@1.0.0 serve /home/ablanco/proyectos/bfa/tsa/api
> nodemon --exec babel-node src/index.js

[nodemon] 1.18.11
[nodemon] to restart at any time, enter `rs`
[nodemon] watching: *.*
[nodemon] starting `babel-node src/index.js`
Conectando a http://localhost:7545
El servidor es PUBLICO
TSA Api corriendo en 3000!
Conectado exitosamente: 
 > host: http://localhost:7545
 > netId: 5777
 > account: 0x80C6C180d044d476437F9F5bCc824dF134A2c9B2
```

La api tiene dos endpoints:
 * **/stamp**: Es un POST, recibe en el body un objeto json con sólo una clave
   llamada ```hashes``` que es un array de strings que representan los hashes a
   stampear.
   Devuelve 200 si la operación tuve exito, sino devuelve un error code > 400
  
 * **/verify/:hash**: Es un GET, se le pasa en vez de :hash el hash a verificar.
   Devuelve un objecto json con la siguiente estructura:
  ```json
  {stamped: bool, stamps: [ {stamper: address, block: nroDeBlock} ]}
  ```
  ```stamped``` es true si tiene algun stamp el hash ese. En ```stamps``` viene la
  lista de stampers de ese objecto junto al nro de bloque en el que lo hizo.

### UI
La primera vez hay que ejecutar lo siguiente dentro del directorio ```ui```
```bash
npm install
```

La aplicación está escrita con Vue.js. Para correr el servicio hay que ejecutar:
```bash
npm run serve
```
## Instalación en producción
Para correr en producción se deben compilar la UI y la API. Una vez hecho eso
ya se está listo para correr la API y tirar los assets de UI donde se desee.

### Compilación de componentes
Para compilar la UI y la API hay que ejecutar el comando:
```bash
npm run build
```
dentro de cada uno de los directorios.

Como output se van a crear los directorios ```ui/dist``` y ```api/dist```

### Deploy y configuración de la API
Para correr la API hay que ejecutar con node el archivo ```dist/index.js```

```bash
node dist/index.js
```

Se pueden definir las siguientes variables de entorno para parametrizar el servidor:
 * **GETH_HOST**: url del host geth a conectarse. Por defecto ***http://localhost:7545***
 * **GETH_ACCOUNT_JSON**: Path a la key encriptada (V3) donde se encuentra la account
 a utilizar. Por defecto se utiliza la que está la pos 0 de ```web3.eth.getAccounts()```
 * **GETH_ACCOUNT_PASSWORD**: Clave plana de la key provista en ***GETH_ACCOUNT_JSON***
 * **CONTRACT_ABI_PATH**: path al archivo que contiene el abi. Puede ser un path 
 absoluto.
 Si es relativo la ruta se calcula desde el dir api/dist. Por defecto se trata 
 de cargar desde el directorio build de truffle (```contract/build/contracts/Stamper.json```)
 * **CONTRACT_ADDRESS**: dirección del contrato. Por defecto se utiliza la 
 que está en el archivo de build de truffle para el netId actual
 * **USE_CORS**: permite des/habilitar el CORS a este server. Por defecto está
 habilitado. Para deshabilitar pasar ***USE_CORS=0***
 * **API_USER** y **API_PASS**: Si están seteadas las dos la API tendrá auth
 basic. Sino es pública. Por defecto es pública.
 * **PORT**: Puerto donde corre la API. Por defecto es 3000

 Estos parámetros se pueden setear de dos maneras. La primera es crear el archivo
 ```api/.env``` y ahí definir los valores deseados:
 ```bash
 # archivo api/.env
 USE_CORS=0
 PORT=8010
 ```

 La otra forma es setearlos al correr node, eg:
 ```bash
 PORT=8010 USE_CORS=0 node dist/index.js
 ```

 Ejemplo que levanta corriendo contra BFA:
 ```bash
GETH_ACCOUNT_JSON=$(pwd)/../../847e7d6ea18a417496518dc90b547438bf1b3d05.json \
GETH_ACCOUNT_PASSWORD=mipasswordseguro \
GETH_HOST=http://localhost:8545 \
CONTRACT_ABI_PATH=$(pwd)/abi.json \
CONTRACT_ADDRESS=0x7e56220069CAaF8367EA42817EA9210296AeC7c6 \
node dist/index.js
```

### Deploy de la UI
Al buildear se crea el archivo ```ui/dist/index.html``` y todo el resto de los recursos
necesarios. Al acceder al index.html sólo se ve el componente de Stampeo. El html se ve así:
```html
<!DOCTYPE html>
<html lang=en>
   <head>
      <meta charset=utf-8>
      <meta http-equiv=X-UA-Compatible content="IE=edge">
      <meta name=viewport content="width=device-width,initial-scale=1">
      <link rel=icon href=/favicon.ico>
      <title>ui</title>
      <link href=/css/app.47c5343e.css rel=preload as=style>
      <link href=/js/app.fa8c25b5.js rel=preload as=script>
      <link href=/js/chunk-vendors.bbeb7c49.js rel=preload as=script>
      <link href=/css/app.47c5343e.css rel=stylesheet>
   </head>
   <body>
      <noscript><strong>We're sorry but ui doesn't work properly without JavaScript enabled. Please enable it to continue.</strong></noscript>
      <div id=app apiurl=http://localhost:3000></div>
      <script src=/js/chunk-vendors.bbeb7c49.js></script><script src=/js/app.fa8c25b5.js></script>
   </body>
</html>
 ```

Para embeberlo en otro contexto hay que copiar los ```<link />``` y el ```<div id=app>``` y ```<script />``` 
del body. 

**Es importante notar que la url de la api se configura en el atributo ***apiurl*** del div con id ```app```. Esto tiene que apuntar a la URL donde se eligió ejecutar la API.**
