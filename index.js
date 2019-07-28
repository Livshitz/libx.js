(async ()=>{
    let libx = require('./bundles/essentials');
    console.log(1)
    let p = libx.delay(5000);
    await p;
    console.log(2)
})();