#!/bin/sh

set -e

npm run enqueue organizations:export

npm "$@"
