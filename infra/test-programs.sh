#!/bin/sh

(cd ./programs/system-extras && cargo test-bpf)
(cd ./programs/token-extras && cargo test-bpf)
