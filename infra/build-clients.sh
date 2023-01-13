#!/bin/sh

(cd ./clients/js-system && pnpm install && pnpm build)
(cd ./clients/js-memo && pnpm install && pnpm build)
(cd ./clients/js-token && pnpm install && pnpm build)
(cd ./clients/js-associated-token && pnpm install && pnpm build)
