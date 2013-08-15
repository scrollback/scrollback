#!/bin/sh

cd public/sdk

cat socket.io.js > ../client.js > ../core.js
echo "(function(){" >> ../client.js >> ../core.js
cat polyfill.js addEvent.js emitter.js client.js >> ../client.js >> ../core.js
cat addStyle.js css.js dom.js domReady.js getByClass.js jsonml2.js cache.js embed.js render.js >> ../client.js
echo "}())" >> ../client.js >> ../core.js

cd ../

uglifyjs -m -c -o client.min.js client.js
uglifyjs -m -c -o core.min.js core.js
