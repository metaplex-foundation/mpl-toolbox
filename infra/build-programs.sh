#!/bin/sh

(cd ./programs/system-extras && cargo build-bpf) &&
  (cd ./programs/token-extras && cargo build-bpf)
