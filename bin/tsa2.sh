#!/bin/bash
# Robert Martin-Legene <robert@nic.ar>
# Copyright 2019, NIC Argentina
# License: GPLv2-only

TSAHOST=${TSAHOST:-localhost}
TSAPORT=${TSAPORT:-3000}

function usage
{
    echo "Usage: `basename $0` {stamp|verify} <sha256>" >&2
    exit 1;
}

op=$1
hash=$2
out=$( mktemp )
trap "rm -f $out" EXIT
test ${#hash} = 64 || usage

case "$op" in
    stamp)
        curl --header 'Content-Type: application/json' --data "{\"hashes\":[\"${hash}\"]}" http://${TSAHOST}:${TSAPORT}/stamp
        echo
        ;;
    verify)
        curl --silent http://${TSAHOST}:${TSAPORT}/verify/${hash} > $out
        rc=$?
        if [ $rc != 0 ]
        then
            echo "curl failed and returned exit code $rc." >&2
            exit $rc
        fi
        if which jq >/dev/null
        then
            jq . < $out
        else
            cat $out
        fi
        ;;
    *)
        usage
esac

