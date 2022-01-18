set -e && set -o pipefail
echo "pwd: " `pwd`
cd "${0%/*}"
pwd="`pwd`/"

# $ ./examples/browserify.sh --watch --minify
yarn ts-node "${pwd}../tools/browserify.ts"  $@ --input="${pwd}./ts/forBrowser.ts" --out="${pwd}../.tmp"
du -sh "${pwd}../.tmp/forBrowser.min.js"