const { LOCALHOST, tmpLedgerDir } = require("@metaplex-foundation/amman");

const validator = {
  killRunningValidators: true,
  programs: [],
  commitment: "singleGossip",
  resetLedger: true,
  verifyFees: false,
  jsonRpcUrl: LOCALHOST,
  websocketUrl: "",
  ledgerDir: tmpLedgerDir(),
};

module.exports = { validator };
