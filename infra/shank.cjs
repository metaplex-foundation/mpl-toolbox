const { generateIdl } = require("@lorisleiva/shank-js");
const idlDir = `${__dirname}/../idls`;
const binaryInstallDir = `${__dirname}/../.crates`;
const programDir = `${__dirname}/../programs`;

generateIdl({
  generator: "anchor",
  programName: "candy_guard",
  programId: "Guard1JwRhJkVH6XZhzoYxeBVQe872VH6QggF4BWmS9g",
  idlDir,
  binaryInstallDir,
  programDir: `${programDir}/candy-guard`,
});
