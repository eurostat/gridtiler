
import { parse } from 'fast-csv';
import { createReadStream, mkdirSync, writeFileSync } from 'fs';


export default function (opts) {

    //the delimiter
    const delim = opts.delim || ","

    //grid resolution
    const r = +opts.resolutionGeo

    // compute tile size, in geo unit
    const tileSizeM = r * +opts.tileSizeCell;

    //ensure those are numbers
    const xO = +opts.originPointX
    const yO = +opts.originPointY

    console.log("Load CSV data...")
    //https://blog.logrocket.com/complete-guide-csv-files-node-js/
    let cells = []
    createReadStream(opts.input)
        .pipe(parse({ headers: true }))
        .on('error', error => console.error(error))
        .on('data', row => {
            cells.push(row)
        })
        .on('end', () => {

            console.log("   " + cells.length + " cells loaded")


            console.log("Filter cells...")
            {
                const filterCell = Function("c", opts.filterFunction)
                cells = cells.filter(filterCell)
            }
            console.log("   " + cells.length + " cells kept")


            console.log("Get cell positions...")
            {
                const getCellPos = Function("c", opts.positionFunction)
                for (let c of cells) {
                    const pos = getCellPos(c)
                    c.x = pos.x
                    c.y = pos.y
                }
            }


            console.log("Modify cells...")
            {
                const modifyCell = Function("c", opts.modFunction)
                for (let c of cells) modifyCell(c)
            }


            //TODO compute aggregation
            if (opts.aggregationFactor) {
                //TODO index cells
                //TODO aggregate cells
            }


            console.log("Index cells by tile")

            // create tile dictionary tileId -> tile
            const tiles_ = {};
            for (let c of cells) {

                // find tile position
                const xt = Math.floor((c.x - xO) / tileSizeM);
                const yt = Math.floor((c.y - yO) / tileSizeM);

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

                    //compute cell position within its tile
                    c.x = Math.floor((c.x - xO) / r - t.x * opts.tileSizeCell)
                    c.y = Math.floor((c.y - yO) / r - t.y * opts.tileSizeCell)

                    // check x,y values. Should be within [0,tileResolutionPix-1]
                    if (c.x < 0)
                        console.error("Too low value: " + c.x + " <0");
                    if (c.y < 0)
                        console.error("Too low value: " + c.y + " <0");
                    if (c.x > opts.tileSizeCell - 1)
                        console.error("Too high value: " + c.x + " >" + (opts.tileSizeCell - 1));
                    if (c.y > opts.tileSizeCell - 1)
                        console.error("Too high value: " + c.y + " >" + (opts.tileSizeCell - 1));
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
                    x: xO,
                    y: yO
                },
                resolutionGeo: r,
                tilingBounds: {
                    yMin: +yMin,
                    yMax: +yMax,
                    xMax: +xMax,
                    xMin: +xMin
                }
            }

            //suggest x,y parameters
            if (xMin != 0) console.log("   Parameter: -x " + (xO + xMin * tileSizeM) + " may be used")
            if (yMin != 0) console.log("   Parameter: -y " + (yO + yMin * tileSizeM) + " may be used")

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

