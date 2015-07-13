#!/usr/bin/env bash
echo deploying
echo $1
echo 'cd scrollback; git fetch origin; git checkout '$1'; npm install; bower install; gulp; sudo restart scrollback; tail -f logs/now.log' | ssh scrollback@sock.scrollback.io
