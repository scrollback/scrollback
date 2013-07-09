#!/bin/sh

cd public/sdk

cat socket.io.js > ../client.js
echo "(function(){" >> ../client.js
cat addEvent.js addStyle.js emitter.js domReady.js getByClass.js jsonml2.js >> ../client.js
cat polyfill.js css.js dom.js client.js cache.js embed.js render.js >> ../client.js
echo "}())" >> ../client.js

cd ../

uglifyjs -m -c -o client.min.js client.js
