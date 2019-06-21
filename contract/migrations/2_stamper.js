const Stamper = artifacts.require("Stamper");
module.exports = function(deployer, network) {
  deployer.deploy(Stamper);
};
