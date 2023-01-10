const { LOCALHOST, tmpLedgerDir } = require("@metaplex-foundation/amman");

const validator = {
  killRunningValidators: true,
  programs: [programs.candy_guard],
  commitment: "singleGossip",
  resetLedger: true,
  verifyFees: false,
  jsonRpcUrl: LOCALHOST,
  websocketUrl: "",
  ledgerDir: tmpLedgerDir(),
};

module.exports = { validator };
