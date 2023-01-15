const path = require("path");
const { generateIdl } = require("@lorisleiva/shank-js");

const idlDir = path.join(__dirname, "..", "idls");
const binaryInstallDir = path.join(__dirname, "..", ".crates");
const programDir = path.join(__dirname, "..", "programs");

generateIdl({
  generator: "shank",
  programName: "mpl_system_extras",
  programId: "SysExL2WDyJi9aRZrXorrjHJut3JwHQ7R9bTyctbNNG",
  idlDir,
  binaryInstallDir,
  programDir: path.join(programDir, "system-extras"),
});
