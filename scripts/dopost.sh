#!/bin/bash
set -vx

POST='curl -d '\"@postdata.json\"' -H "Content-Type: application/json" http://127.0.0.1:6504/createzippr'

echo $POST
$POST
