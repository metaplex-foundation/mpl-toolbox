const { Kinobi, RenderJavaScriptVisitor } = require("@lorisleiva/kinobi");

const idlDir = `${__dirname}/../idls`;
const clientDir = `${__dirname}/../clients`;
const idls = [
  `${idlDir}/candy_machine_core.json`,
  `${idlDir}/candy_guard.json`,
];

const kinobi = new Kinobi(idls);
kinobi.accept(new RenderJavaScriptVisitor(`${clientDir}/js/src/generated`));
