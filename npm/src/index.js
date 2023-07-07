
import { parse } from 'fast-csv';
import { createReadStream, mkdirSync, writeFileSync } from 'fs';

//export {default as tiling} from "./tiling.js";

//function returning the cell coordinates
//TODO: this should be exposed as a parameter
const getCellPos = c => { return { x: c.x, y: c.y } }
const cleanCell = c => { delete c.x; delete c.y }


export default function (opts) {
    console.log("hello world !!!")

    //grid resolution
    const r = +opts.resolutionGeo

    // compute tile size, in geo unit
    const tileSizeM = r * +opts.tileSizeCell;

    console.log("Load CSV data...")
    //https://blog.logrocket.com/complete-guide-csv-files-node-js/
    const cells = []
    createReadStream(opts.input)
        .pipe(parse({ headers: true }))
        .on('error', error => console.error(error))
        .on('data', row => {
            cells.push(row)
        })
        .on('end', () => {

            console.log("   " + cells.length + " cells loaded")

            console.log("Index cells by tile")

            // create tile dictionary tileId -> tile
            const tiles_ = {};

            // go through cell stats and assign it to a tile
            for (let c of cells) {

                //get cell coordinates
                const pos = getCellPos(c), x = pos.x, y = pos.y

                // find tile position
                const xt = Math.floor((x - +opts.originPointX) / tileSizeM);
                const yt = Math.floor((y - +opts.originPointY) / tileSizeM);

                // get tile. If it does not exists, create it.
                const tileId = xt + "_" + yt;
                let tile = tiles_[tileId];
                if (!tile) {
                    tile = { x: xt, y: yt, cells: [] };
                    tiles_[tileId] = tile;
                }

                // add cell to tile
                tile.cells.push(c);

            }

            const tiles = Object.values(tiles_);
            console.log("   " + tiles.length + " tiles created.")

            console.log("Save tiles...")

            for (let t of tiles) {

                // prepare tile cells for export
                for (let c of t.cells) {

                    //get cell coordinates
                    const pos = getCellPos(c)
                    let x = pos.x, y = pos.y

                    //get cell position within its tile
                    x -= opts.originPointX
                    y -= opts.originPointY
                    x = x / r - t.x * opts.tileSizeCell;
                    y = y / r - t.y * opts.tileSizeCell;
                    x = Math.floor(x)
                    y = Math.floor(y)

                    // check x,y values. Should be within [0,tileResolutionPix-1]
                    if (x < 0)
                        console.error("Too low value: " + x + " <0");
                    if (y < 0)
                        console.error("Too low value: " + y + " <0");
                    if (x > opts.tileSizeCell - 1)
                        console.error("Too high value: " + x + " >" + (opts.tileSizeCell - 1));
                    if (y > opts.tileSizeCell - 1)
                        console.error("Too high value: " + y + " >" + (opts.tileSizeCell - 1));

                    //clean
                    cleanCell(c)

                    // store x,y values
                    c.x = x
                    c.y = y
                }

                /*
                    // sort cells by x and y
                    Collections.sort(cells_, new Comparator<Map<String, String>>() {
                        @Override
                        public int compare(Map<String, String> s1, Map<String, String> s2) {
                            if (Integer.parseInt(s1.get("x")) < Integer.parseInt(s2.get("x")))
                                return -1;
                            if (Integer.parseInt(s1.get("x")) > Integer.parseInt(s2.get("x")))
                                return 1;
                            if (Integer.parseInt(s1.get("y")) < Integer.parseInt(s2.get("y")))
                                return -1;
                            if (Integer.parseInt(s1.get("y")) > Integer.parseInt(s2.get("y")))
                                return 1;
                            return 0;
                        }
                    });
                    */

                // save as csv file
                const folder = opts.output + "/" + t.x + "/"
                mkdirSync(folder, { recursive: true })

                const data = `
id,name,age
1,Johny,45
2,Mary,20
`;

                writeFileSync(folder + t.y + ".csv", data, "utf-8", (err) => {
                    //if (err) console.log(err);
                    //else console.log("Data saved");
                });

            }


            console.log("Save info.json file")

            //compute bounds
            let xMin = +Infinity, yMin = +Infinity, xMax = -Infinity, yMax = -Infinity
            for (let t of tiles) {
                xMin = Math.min(xMin, t.x)
                xMax = Math.max(xMax, t.x)
                yMin = Math.min(yMin, t.x)
                yMax = Math.max(yMax, t.x)
            }

            //create tiling info object
            const info = {
                dims: [],
                crs: opts.crs,
                tileSizeCell: opts.tileSizeCell,
                originPoint: {
                    x: opts.originPointX,
                    y: opts.originPointY
                },
                resolutionGeo: r,
                tilingBounds: {
                    yMin: yMin,
                    yMax: yMax,
                    xMax: xMax,
                    xMin: xMin
                }
            }

            //save tiling info object
            const jsonData = JSON.stringify(info, null, 3);
            mkdirSync(opts.output, { recursive: true })
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

