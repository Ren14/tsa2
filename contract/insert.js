
var contract = artifacts.require("SimpleStamper");

//var contract_address = '0xD32F2B055B1D9a45C99C4FdCc158Bd477999D93A';
let value = web3.utils.asciiToHex('sdfjsdd')
module.exports = function() {

  async function insert() {
    let instance = await contract.deployed()
    let res = await instance.stamp(value);
    console.log(res)
    console.log('---------')
  }

  async function check() {
    let instance = await contract.deployed()
    let res = await instance.stamped(value);
    console.log(res)
  }

  insert()
  check()
}