
import { parse } from 'fast-csv';
import { createReadStream, mkdirSync, writeFileSync, unlinkSync, renameSync, existsSync } from 'fs';
import duckdb from 'duckdb'


export default function (opts) {

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

            //filter cells
            if (opts.filterFunction) {
                console.log("Filter cells...")
                const filterCell = Function("c", opts.filterFunction)
                cells = cells.filter(filterCell)
                console.log("   " + cells.length + " cells kept")
            }

            //compute positions
            console.log("Get cell positions...")
            {
                const getCellPos = Function("c", opts.positionFunction)
                for (let c of cells) {
                    const pos = getCellPos(c)
                    if (pos.x == undefined || pos.y == undefined) {
                        console.error("Could not compute position of cell " + c)
                        console.error("Check parameter positionFunction : " + opts.positionFunction)
                        return;
                    }
                    c.x = pos.x
                    c.y = pos.y
                }
            }

            //pre-processing cells
            if (opts.preFunction) {
                console.log("Pre-processing cells...")
                const preFunction = Function("c", opts.preFunction)
                for (let c of cells) preFunction(c)
            }

            //keep only specified columns
            if (opts.columns) {
                const cols = opts.columns.split(",")
                console.log("Keep columns x,y and: " + (cols.join(", ")))
                const keys = Object.keys(cells[0])
                for (let k of keys) {
                    if (k === "x" || k === "y") continue;
                    if (cols.includes(k)) continue;
                    //remove column
                    for (let c of cells) delete c[k]
                }
            }

            //grid resolution
            let r = +opts.resolutionGeo

            //compute aggregation, if necessary
            if (opts.aggregationFactor && +opts.aggregationFactor > 1) {

                //target resolution
                const tr = +opts.aggregationFactor * r

                console.log("Compute aggregation to resolution " + tr + "...")

                //index cells
                // create dictionary xA -> yA -> cell
                const aggCells = {};
                for (let c of cells) {
                    //compute coordinates of the aggregated cell
                    const xa = tr * Math.floor(c.x / tr)
                    const ya = tr * Math.floor(c.y / tr)
                    delete c.x; delete c.y

                    //add c to aggregated cell cA. If not there, create a new one.
                    let cA_ = aggCells[xa]
                    if (!cA_) { cA_ = {}; aggCells[xa] = cA_ }
                    let cA = cA_[ya]
                    if (!cA) { cA = { x: xa, y: ya, cells: [] }; cA_[ya] = cA }
                    cA.cells.push(c)
                }

                //aggregation function
                //TODO handle other cases: average, mode, etc
                const aggregateSum = (vs) => { let sum = 0; for (let v of vs) { sum += +v; } return sum }

                //prepare function to round aggregated figures
                const tolerance = Math.pow(10, opts.aggregationRounding)
                const roundToTolerance = (number) => Math.round(number * tolerance) / tolerance;

                //aggregate cell values
                const keys = Object.keys(cells[0])
                cells = []
                for (let cA_ of Object.values(aggCells)) {
                    for (let cA of Object.values(cA_)) {
                        //compute aggregates values
                        for (let k of keys) {
                            //get list of values to aggregate
                            const vs = []
                            for (let c of cA.cells) vs.push(c[k])
                            //compute and set aggregated value
                            cA[k] = aggregateSum(vs)
                            if (opts.aggregationRounding != undefined)
                                cA[k] = roundToTolerance(cA[k])
                        }
                        cA.cells = []; delete cA.cells
                        cells.push(cA)
                    }
                }

                //use new resolution
                r = tr

                console.log("   " + cells.length + " aggregated cells.")
            }

            //post-processing cells
            if (opts.postFunction) {
                console.log("Post-processing cells...")
                const postFunction = Function("c", opts.postFunction)
                for (let c of cells) postFunction(c)
            }

            console.log("Index cells by tile")

            // compute tile size, in geo unit
            const tileSizeM = r * +opts.tileSizeCell;

            //ensure those are numbers
            const xO = +opts.originPointX
            const yO = +opts.originPointY

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

            //TODO release memory ?
            //cells = []

            console.log("Save tiles...")

            //the delimiter
            const delim = opts.delim || ","
            const encs = opts.outencodings || "csv"
            const codec = "GZIP" //TODO expose this as a parameter ?

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

                //sort cells by x and y value
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
                    for (let k of keys) {
                        //get stat value
                        const v = c[k]
                        //store as a integer if it is an integer
                        const vI = Math.floor(v)
                        d_.push(v == vI ? vI : v)
                    }
                    data.push(d_.join(delim))
                }

                //write data
                if (encs == "csv")
                    writeFileSync(folder + t.y + ".csv", data.join("\n"), "utf-8", (err) => { if (err) console.log(err); });
                else if (encs == "parquet") {
                    //https://www.npmjs.com/package/duckdb
                    //https://github.com/duckdb/duckdb
                    //https://duckdb.org/docs/api/nodejs/overview

                    //save as CSV, first
                    writeFileSync(folder + t.y + ".csv", data.join("\n"), "utf-8", (err) => { if (err) console.log(err); });

                    //make duckdb connection
                    const db = new duckdb.Database(':memory:');
                    const conn = new duckdb.Connection(db)

                    //import CSV data
                    const id = makeid(16)
                    const stmt = new duckdb.Statement(conn, "CREATE TABLE " + id + " AS SELECT * FROM read_csv_auto('" + folder + t.y + ".csv" + "', delim='" + delim + "', header=True)")
                    stmt.run(null, () => {
                        //delete CSV file
                        unlinkSync(folder + t.y + ".csv")
                        //export data as parquet file
                        const stmt2 = new duckdb.Statement(conn, "EXPORT DATABASE '" + folder + "' (FORMAT PARQUET, CODEC '" + codec + "')")
                        stmt2.run(null, () => {
                            //rename parquet file
                            renameSync(folder + id + ".parquet", folder + t.y + ".parquet")
                            //remove unecessary files
                            if (existsSync(folder + "schema.sql")) unlinkSync(folder + "schema.sql")
                            if (existsSync(folder + "load.sql")) unlinkSync(folder + "load.sql")
                            db.close()
                        })
                    })

                } else
                    console.warn("Unexpected encodings: " + encs)

                //TODO release memory ?
                //delete t.cells
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



//generate a random string of length 'length'
function makeid(length) {
    let result = '';
    const characters = 'abcdefghijklmnopqrstuvwxyz';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    }
    return result;
}
