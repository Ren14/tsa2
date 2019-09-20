#!/bin/bash
# Example startup script

if ip a | grep -q inet.200.108.146.180/
then
	mode=test2
else
	mode=${1:-prod}
fi

cd `dirname $0`
case "$mode" in
	"prod")
		modedir=$( echo ~bfa/bfa/network )
		export CONTRACT_ADDRESS="0x7e56220069CAaF8367EA42817EA9210296AeC7c6"
		;;
	"test2")
		modedir=$( echo ~bfa/bfa/test2network )
		export CONTRACT_ADDRESS="0xFc0f01A88bD08b988173A2354952087C9492d947"
		;;
	"*")
		echo "Unsupported mode." >&2
		echo "Usage: $0 <test2|prod>" >&2
		exit 1
		;;
esac
export GETH_ACCOUNT_JSON=$( ls -1 ${modedir}/node/keystore/UTC* | head -1 )
export GETH_ACCOUNT_PASSWORD=""
export GETH_HOST=http://localhost:8545
export CONTRACT_ABI_PATH="${PWD}/abi.json"

# roll logs
higher=10
for n in {9..0}
do
	if [ $n -eq 0 ]
	then
		mv -f "nohup.out"    "nohup.out.$higher"
	else
		mv -f "nohup.out.$n" "nohup.out.$higher"
	fi
	higher=$n
done

nohup npm run serve &
sleep 1
