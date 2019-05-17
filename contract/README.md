# Deployando a BFA

Para hacer esto tuve que utilizar truffle-hdwallet-provider. Esto fue debido a
la imposibilidad de unlockear la account en geth directamente por un cambio reciente.

Para elegir la account que se quiere utilizar hay que pasar la pkey de la account en la variable
de entorno ```GETH_ACCOUNT_PKEY```.

La invocación se hace así **esto deployea a bfa**
```bash
GETH_ACCOUNT_PKEY=840e5ddddda6037390329b2d0b65f422f2555555555b6de292cc574fff212345 truffle migrate --network bfa
```

Para obtener la pkey desde el keystore de geth seguí las siguiente instrucciones: https://ethereum.stackexchange.com/questions/12830/how-to-get-private-key-from-account-address-and-password

Para hacerlo desde el REPL esto ayudó: https://stackoverflow.com/questions/18260605/how-to-require-node-module-in-node-repl-without-installing-globally
