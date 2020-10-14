set -e && set -o pipefail
echo "pwd: " `pwd`
cd "${0%/*}"
pwd="`pwd`/"

yarn ts-node "${pwd}../tools/browserify.ts" --minify --input="${pwd}./ts/forBrowser.ts" --out="${pwd}../.tmp"
du -sh "${pwd}../.tmp/forBrowser.min.js"