
import { parse } from 'fast-csv';
import { createReadStream, mkdirSync, writeFileSync } from 'fs';

//export {default as tiling} from "./tiling.js";

//function returning the cell coordinates
//TODO: this should be exposed as a parameter
const getCellXY = c => { return { x: c.x, y: c.y } }


export default function (opts) {
    console.log("hello world !!!")

    console.log("Load CSV data...")
    //https://blog.logrocket.com/complete-guide-csv-files-node-js/
    const data = []
    createReadStream(opts.input)
        .pipe(parse({ headers: true }))
        .on('error', error => console.error(error))
        .on('data', row => {
            data.push(row)
        })
        .on('end', () => {

            console.log("   " + data.length + " cells loaded")





            //make output repository
            mkdirSync(opts.output, { recursive: true })



            //create tiling info object
            const info = {
                dims: [],
                crs: opts.crs,
                tileSizeCell: opts.tileSizeCell,
                originPoint: {
                    x: opts.originPointX,
                    y: opts.originPointY
                },
                resolutionGeo: opts.resolutionGeo,
                tilingBounds: {
                    yMin: undefined,
                    yMax: undefined,
                    xMax: undefined,
                    xMin: undefined
                }
            }

            //save tiling info object
            console.log("Save info.json file")
            const jsonData = JSON.stringify(info, null, 3);
            writeFileSync(opts.output + "info.json", jsonData);

        });
}



/*
if (!fs.existsSync(cmd.output + "info.json")) {
}

fs.readFile(cmd.output + "info.json", 'utf8', (err, data) => {
    if (err) {
        console.log(err);
        return
    }
    const info = JSON.parse(data)
    console.log(info);
});

*/

