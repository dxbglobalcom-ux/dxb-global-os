#!/bin/bash
DXB_DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres node "/home/dxb/DxB Global OS/scripts/models/side-by-side.mjs" --n 20 > "/home/dxb/DxB Global OS/.planning/quick/20261009-masa-b51/evidence/p7-side-by-side-run.log" 2>&1
echo "EXIT=$?" >> "/home/dxb/DxB Global OS/.planning/quick/20261009-masa-b51/evidence/p7-side-by-side-run.log"
