#!/bin/sh
set -eu
cd "$(dirname "$0")"
npm run build
npm run preview:open
