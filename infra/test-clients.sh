#!/bin/sh

(cd ./clients/js && pnpm install && pnpm build && pnpm test)
