# TSA2

Actualmente el contrato se encuentra deployado en BFA:
 * dirección: **0x7e56220069CAaF8367EA42817EA9210296AeC7c6**
 * abi: https://gitlab.bfa.ar/blockchain/tsa2/blob/develop/api/abi.json

También está deployado en la testnet2:
 * dirección: **0xFc0f01A88bD08b988173A2354952087C9492d947**
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
Utilizar esta herramienta para probar la TSA2 en localhost. Recordar **configurar** Ganache en modo Automine->False y establecer el parámetro **MINING BLOCK TIME (SECONDS)** en 5 segundos (qué es como está configurada la BFA).
Caso contrario, dará un error el endpoint de la API REST /wait1block

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
Ver la [incidencia #2](https://gitlab.bfa.ar/blockchain/tsa2/issues/2) para solucionar posibles errores al migrar el contrato.

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
Si estas probando en la red de TESTNET, deberás configurar el parámetro ```chainId``` que se encuentra en ```api/src/StamperWrapper.js``` con el valor ```99118822```

La api tiene dos endpoints:
 * **/stamp**: Es un POST, recibe en el body un objeto json con sólo una clave
   llamada ```hashes``` que es un array de strings que representan los hashes a
   stampear.
   Devuelve un objeto json con la siguiente estructura:
```json
  {
  "status": "ok",
  "txHash": [
    {
      "hash": "0x0bd11b06abfd0d29295bada8aec7dda0c336d23856ac0a21b93d4be60d6388d5",
      "block_number": "2540433",
      "status": "already_stamped_by_this_TSA"
    },
    {
      "hash": "0xca7ad1fc3c916e0f8956e997dd5f32072b17b381c9ea753295d387792499fcdc",
      "block_number": "2540508",
      "status": "already_stamped_by_this_TSA"
    },
    {
      "hash": "0x589e0b25fe9e05ff319af24b9dd356a9228be8b1a46fe4bd4cca3567688c617b",
      "block_number": "2540508",
      "status": "stamped"
    }
  ]
}
  ```
   ```status``` es ok si el resultado fue correcto. En ```txHash``` viene la
  lista de hashes stampados (con sus metadatos). El campo ```status``` propio de cada elemento, se refiere
  a que si el hash ya se encontraba previamente stampado ```already_stamped_by_this_TSA```, si fue stampado correctamente en el envío ```stamped```, o si tuvo algún error durante su proceso ```error```.
  
 * **/verify/:hash**: Es un GET, se le pasa en vez de :hash el hash a verificar.
   Devuelve un objecto json con la siguiente estructura:
  ```json
  {stamped: bool, stamps: [ {stamper: address, block: nroDeBlock} ]}
  ```
  ```stamped``` es true si tiene algun stamp el hash ese. En ```stamps``` viene la
  lista de stampers de ese objecto junto al nro de bloque en el que lo hizo.

### UI
Para el desarrollo de la UI, la primera vez hay que ejecutar lo siguiente dentro del directorio ```ui```
```bash
npm install
```

La aplicación está escrita con Vue.js. Para correr el servicio hay que ejecutar:
```bash
npm run serve
```
**Ver más detalles en el README dentro del directorio ```ui```** 

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
<div id="app" apiurl=https://tsa2.buenosaires.gob.ar 
  lb_00=" El archivo "
  lb_01=" fue enviado con éxito para ser sellado"
  lb_02="Se ha producido un error al intentar sellar " 
  lb_03=" se encuentra sellado por: "
  lb_04=" en el bloque " 
  lb_05="No se ha podido verificar el archivo "
  lb_06="Volver a Sellar o Verificar" 
  lb_07="Cargando"
  lb_08="Arrastrá archivos aquí<br>ó"
  lb_09="Seleccioná archivos <span class='sr-only'>para Sellar o Verificar</span>"
  lb_10="Nombre del archivo: " 
  lb_11="Hash del archivo: " 
  lb_12="Sellar"
  lb_13="Verificar"
  lb_14=" Agregar archivos" 
  lb_15=" Copiar" 
  lb_16="Enlace de verificación" 
  lb_17="Remover archivo"
  lb_18="Seleccionar otros archivos" 
  lb_19=" Solo se pueden agregar " 
  lb_20=" archivos por vez">
</div>
 ```

Para embeberlo en otro contexto hay que copiar el div ```<div id=app>```, los estilos  ```link``` y el script ```tsa2.js``` del body. 

También se puede cambiar los textos de la app modificando todos los labels (```lb_```) que figuran como atributos de ```<div id=app>``` según corresponda. 

Es **importante** notar que la url de la api se configura en el atributo ***apiurl*** del div con id ```app```. Esto tiene que apuntar a la URL donde se eligió ejecutar la API. En este caso apunta a la API de producción hosteada por buenosaires.gob.ar

**Ver más detalles en el README dentro del directorio ```ui```** 
