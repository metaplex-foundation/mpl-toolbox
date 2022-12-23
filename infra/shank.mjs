import { generateIdl } from "@lorisleiva/shank-js";
// import path from "path";
// const programDir = path.join(__dirname, "..", "program");
// const idlDir = path.join(__dirname, "idl");
// const binaryInstallDir = path.join(__dirname, ".crates");

generateIdl({
  generator: "anchor",
  programName: "candy_guard",
  programId: "Guard1JwRhJkVH6XZhzoYxeBVQe872VH6QggF4BWmS9g",
  idlDir: "./idls",
  binaryInstallDir: "./.crates",
  programDir: "./programs/candy-guard",
});
