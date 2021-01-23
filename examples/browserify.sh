set -e && set -o pipefail
echo "pwd: " `pwd`
cd "${0%/*}"
pwd="`pwd`/"

yarn ts-node "${pwd}../tools/browserify.ts" --watch --input="${pwd}./ts/forBrowser.ts" --out="${pwd}../.tmp" # --minify
du -sh "${pwd}../.tmp/forBrowser.min.js"