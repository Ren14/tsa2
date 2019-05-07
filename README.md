# TSA2

Descargar el proyecto:
```shell
git clone https://gitlab.bfa.ar/blockchain/tsa2.git
```

## Dependencias
Todo fue probado con node 10.8 y npm 6.2.

También hay que tener instalado truffle de manera global:
```shell
npm install -g truffle
```

## Instalación de desarrollo
Para desarrollo se utilizó Ganache, una "one click blockchain". Se puede
descargar desde acá: https://truffleframework.com/ganache

El proyecto está compuesto por tres componentes, los contratos, una api rest
y una interfaz gráfica.

### Deployar los contratos
Para manejar los contratos se utilizó truffle, para hacer el deploy de los
contratos hay que correr dentro del directorio ```contract``` el siguiente comando
```shell
truffle migrate
```

Si se hacen modificaciones sobre el contrato se debe ejecutar lo siguiente:
```shell
truffle migrate --reset
```

El contrato utilizado es el de Robert con unas pequeñas modificaciones, se puede ver
en ```contract/contracts/Stamper.sol```.

### Correr API
La primera vez hay que ejecutar lo siguiente dentro del directorio ```api```
```shell
npm install
```

Para que la API quede corriendo hay que ejecutar:
```shell
npm run serve
```

Si todo fue bien, se debería ver algo así en la consola:
```shell
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
```shell
npm install
```

La aplicación está escrita con Vue.js. Para correr el servicio hay que ejecutar:
```shell
npm run serve
```

## Discusión
Cosas que habría que discutir:
 * algoritmo de hasheo de archivos (ahora es sha256 se prefiere keccak o sha3?)
   * https://emn178.github.io/online-tools/keccak_256_checksum.html
 * vale la pena ponerse a ahorrar gas?