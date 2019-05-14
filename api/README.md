# Ejemplo en BFA

```bash
cd api
GETH_ACCOUNT_JSON=$(pwd)/../../847e7d6ea18a417496518dc90b547438bf1b3d05.json \
GETH_ACCOUNT_PASSWORD=passwordseguro \
GETH_HOST=http://localhost:8545 \
CONTRACT_ABI_PATH=$(pwd)/abi.json \
CONTRACT_ADDRESS=0x7e56220069CAaF8367EA42817EA9210296AeC7c6 \
npm run serve
```