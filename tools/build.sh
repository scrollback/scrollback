#!/bin/sh

cd public/sdk

echo "(function(){" >> ../client.js >> ../core.js
cat sockjs.js polyfill.js addEvent.js emitter.js request.js client.js >> ../client.js >> ../core.js
cat addStyle.js css.js dom.js domReady.js getByClass.js jsonml2.js cache.js embed.js render.js >> ../client.js
cat browserNotify.js dialog.js >> ../client.js
echo "}())" >> ../client.js >> ../core.js

cd ../

uglifyjs -m -c -o client.min.js client.js
uglifyjs -m -c -o core.min.js core.js

rm client.js
rm core.js