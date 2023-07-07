

//see
//https://www.npmjs.com/package/commander

//examples:
//https://github.com/nodejs/examples/tree/main/cli/commander/fake-names-generator
//https://github.com/topojson/topojson-server/tree/master


//export {default as tiling} from "./tiling.js";

export const tiling = function(input, output, info) {
    console.log("hello world !!!")
    console.log(input)
}


/*
const fs = require('fs')
const csv = require('fast-csv');

exports.doTiling = (input, output, info) => {

    const data = []

    fs.createReadStream(input)
        .pipe(csv.parse({ headers: true }))
        .on('error', error => console.error(error))
        .on('data', row => {
            data.push(row)
        })
        .on('end', () => {
            console.log(data)
        });

}
*/






/*
install, uninstall locally
https://github.com/nodejs/examples/blob/main/cli/commander/fake-names-generator/README.md#as-a-local-project

sudo npm i -g
# this will install the current working directory as a global module.

gridtiler
# run the CLI
sudo npm uninstall -g
*/


//read: https://docs.npmjs.com/packages-and-modules


/*
export const hwfun = () => {
    console.log("hello world !")
}
*/
