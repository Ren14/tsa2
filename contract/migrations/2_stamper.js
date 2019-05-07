const Stamper = artifacts.require("Stamper");

module.exports = function(deployer) {
  deployer.deploy(Stamper);
};
