
import { parse } from 'fast-csv';
import { createReadStream, mkdirSync, writeFileSync } from 'fs';


export default function (opts) {
    //console.log("hello world !!!")

    //function returning the cell coordinates
    //See https://stackoverflow.com/questions/7650071/is-there-a-way-to-create-a-function-from-a-string-with-javascript
    const getCellPos = Function("c", opts.positionFunction)


    //filtering function
    const filterCell = Function("c", opts.filterFunction)

    //modification function
    const modifyCell = Function("c", opts.modFunction)

    //the delimiter
    const delim = opts.delim || ","

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

                //check if cell should be filtered
                const keep = filterCell(c)
                if (!keep) continue

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

                    // store x,y values
                    c.x = x
                    c.y = y

                    //modify
                    modifyCell(c)
                }

                //sort cells
                t.cells.sort(
                    (c1, c2) => c1.x == c2.x ? c1.y - c2.y : c1.x - c2.x
                )

                // save as csv file
                const folder = opts.output + "/" + t.x + "/"
                mkdirSync(folder, { recursive: true })

                const data = []

                //header - force starting with x,y,
                const keys = Object.keys(t.cells[0])
                keys.splice(keys.indexOf("x"), 1);
                keys.splice(keys.indexOf("y"), 1);
                data.push("x" + delim + "y" + delim + keys.join(delim))

                //add cell data
                for (let c of t.cells) {

                    const d_ = []
                    //x,y first
                    d_.push(c.x)
                    d_.push(c.y)
                    delete c.x
                    delete c.y
                    //stats after
                    for (let k of keys) d_.push(c[k])
                    data.push(d_.join(delim))
                }

                //write data
                writeFileSync(folder + t.y + ".csv", data.join("\n"), "utf-8", (err) => { if (err) console.log(err); });

            }


            console.log("Save info.json file")

            //compute bounds
            let xMin = +Infinity, yMin = +Infinity, xMax = -Infinity, yMax = -Infinity
            for (let t of tiles) {
                xMin = Math.min(xMin, t.x)
                xMax = Math.max(xMax, t.x)
                yMin = Math.min(yMin, t.y)
                yMax = Math.max(yMax, t.y)
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

