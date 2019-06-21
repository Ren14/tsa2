# Ejemplo en BFA

(en lugar de __UTC*__ poner el nombre completo del archivo de la cuenta)

```bash
cd api
GETH_ACCOUNT_JSON="/home/bfa/bfa/network/node/keystore/UTC*" \
GETH_ACCOUNT_PASSWORD="miclave" \
GETH_HOST=http://localhost:8545 \
CONTRACT_ABI_PATH="$(pwd)/abi.json" \
CONTRACT_ADDRESS="0x7e56220069CAaF8367EA42817EA9210296AeC7c6" \
npm run serve
```

# Ejemplo en test network

(en lugar de __UTC*__ poner el nombre completo del archivo de la cuenta)

```bash
cd api
GETH_ACCOUNT_JSON="/home/bfa/bfa/test2network/node/keystore/UTC*" \
GETH_ACCOUNT_PASSWORD="miclave" \
GETH_HOST=http://localhost:8545 \
CONTRACT_ABI_PATH="$(pwd)/abi.json" \
CONTRACT_ADDRESS="0xFc0f01A88bD08b988173A2354952087C9492d947" \
npm run serve
```
