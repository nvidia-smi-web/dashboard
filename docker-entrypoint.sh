#!/bin/sh

if [ -f ./pre-run.sh ]; then
    sh ./pre-run.sh
fi
node server.js
