const path = require("path");
const {
  Kinobi,
  RenderJavaScriptVisitor,
  SetLeafWrappersVisitor,
} = require("@lorisleiva/kinobi");

// Paths.
const clientDir = path.join(__dirname, "..", "clients");
const idlDir = path.join(__dirname, "..", "idls");

// Helpers.
function renderJs(kinobi, dir) {
  const jsDir = path.join(clientDir, dir, "src", "generated");
  const prettier = require(path.join(clientDir, dir, ".prettierrc.json"));
  kinobi.accept(new RenderJavaScriptVisitor(jsDir, { prettier }));
}

// System Client.
const system = new Kinobi(path.join(idlDir, "spl_system.json"));
system.update(
  new SetLeafWrappersVisitor({
    "splSystem.CreateAccount.lamports": {
      kind: "Amount",
      identifier: "SOL",
      decimals: 9,
    },
  })
);
renderJs(system, "js-system");

// Memo Client.
const memo = new Kinobi(path.join(idlDir, "spl_memo.json"));
renderJs(memo, "js-memo");

// Token Client.
const token = new Kinobi(path.join(idlDir, "spl_token.json"));
renderJs(token, "js-token");

// ATA Client.
const ata = new Kinobi(path.join(idlDir, "spl_associated_token_account.json"));
renderJs(memo, "js-associated-token");
