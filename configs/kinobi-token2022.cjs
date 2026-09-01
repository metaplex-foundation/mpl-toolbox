const path = require("path");
const fs = require("fs");
// Token-2022 (Token Extensions) is generated separately from the 8 original
// programs because its account model (base struct + account-type byte + a
// remainder TLV list of extensions, plus Pod "zeroable option" fields) needs
// codec features Kinobi 0.16 cannot express. The newer Kinobi (0.20+, the
// Codama-era release) renders these to Umi natively — including the
// zeroableOption / remainderOption / hiddenPrefix serializers, which it emits
// into the generated `shared/` module. The input is Token-2022's maintained
// Codama IDL (a rootNode), vendored as configs/token2022.idl.json.
const k = require("@metaplex-foundation/kinobi");

const idl = fs.readFileSync(
  path.join(__dirname, "token2022.idl.json"),
  "utf8"
);
const kinobi = k.createFromJson(idl);

// Render into a dedicated directory so it never collides with the existing
// generated client. It is re-exported under the `token2022` namespace.
const jsDir = path.join(
  __dirname,
  "..",
  "clients",
  "js",
  "src",
  "generated-token2022"
);

// Emit unformatted; the `generate:clients:token2022` script then runs the
// client's own Prettier (v2) so the output matches the repo's Prettier config.
kinobi.accept(k.renderJavaScriptVisitor(jsDir, { formatCode: false }));
