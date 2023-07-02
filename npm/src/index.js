

//see
//https://www.npmjs.com/package/commander

//examples:
//https://github.com/nodejs/examples/tree/main/cli/commander/fake-names-generator
//https://github.com/topojson/topojson-server/tree/master



//import { csv } from 'd3-fetch'

const d3f = import('d3-fetch')
//Promise.all().then(write).catch(abort);
//https://javascript.info/modules-dynamic-imports

exports.doTiling = (input, output, info) => {

    console.log(input)
    console.log(d3f)

}


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
