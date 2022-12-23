const {
  Kinobi,
  IdentifyDefaultInstructionAccountsVisitor,
  TransformU8ArraysToBytesVisitor,
  InlineDefinedTypesVisitor,
  InlineDefinedTypesForInstructionArgsVisitor,
  InlineStructsForInstructionArgsVisitor,
  RenderJavaScriptVisitor,
} = require("@lorisleiva/kinobi");
const idlDir = `${__dirname}/../idls`;
const clientDir = `${__dirname}/../clients`;

const kinobi = new Kinobi(`${idlDir}/candy_machine_core.json`);
kinobi.update(new IdentifyDefaultInstructionAccountsVisitor());
kinobi.update(new TransformU8ArraysToBytesVisitor());
kinobi.update(new InlineDefinedTypesVisitor(["Payload", "SeedsVec"]));
kinobi.update(new InlineDefinedTypesForInstructionArgsVisitor());
kinobi.update(new InlineStructsForInstructionArgsVisitor());
kinobi.accept(new RenderJavaScriptVisitor(`${clientDir}/js/src/generated`));
