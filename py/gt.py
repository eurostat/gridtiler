import rasterio
from math import ceil,floor
import os
import csv
import json
import pandas as pd

#https://github.com/eurostat/JGiscoTools/blob/dev/modules/gproc/src/main/java/eu/europa/ec/eurostat/jgiscotools/gridProc/GridTiler2.java

file_path = 'assets/LU001_LUXEMBOURG_UA2012_DHM_V020.tif'
with rasterio.open(file_path) as src:
    data = src.read()
    metadata = src.meta

    geo_bounds = src.bounds
    num_bands = src.count

    transform = src.transform
    pixel_width = transform[0]
    pixel_height = -transform[4]

    no_data = metadata["nodata"]

    pixel_value = src.read(1)[45, 90]


print("Metadata:", metadata)
print("Data shape:", data.shape)
print("Data shape:", geo_bounds)

print("res x", pixel_width)
print("res y", pixel_height)


print("no data", no_data)
print("num_bands", num_bands)

print(pixel_value)




#	public static void tile(String description, Map<String, ColummCalculator> values, Coordinate originPoint, Envelope envG, int resolutionG, int tileSizeNbCells, String crs, Format format, CompressionCodecName comp, String folderPath) {

def tiling(values_calculator, resolution, output_folder, x_origin, y_origin, x_min, y_min, x_max, y_max, tile_size_cell=128, crs="", format="csv", compression="snappy"):


    #tile frame caracteristics
    tileSizeGeo = resolution * tile_size_cell
    tileMinX = floor( (x_min - x_origin) / tileSizeGeo )
    tileMinY = floor( (y_min - y_origin) / tileSizeGeo )
    tileMaxX = ceil( (x_max - x_origin) / tileSizeGeo )
    tileMaxY = ceil( (y_max - y_origin) / tileSizeGeo )

    #get keys
    keys = values_calculator.keys()

    #minimum and maximum tile x,y, for info.json file
    minTX=None
    maxTX=None
    minTY=None
    maxTY=None

    #function to make cell template
    def make_cell():
        c = {}
        for k in keys: c[k] = None
        return c

	#TODO parallel ?
    for xt in range(tileMinX, tileMaxX):
        for yt in range(tileMinY, tileMaxY):
            #handle tile (tx,ty)

            #prepare tile cells
            cells = []

            for xtc in range(0, tile_size_cell):
                for ytc in range(0, tile_size_cell):

                    #make new cell
                    cell = None

                    #get values
                    for k in keys:
                        #compute geo coordinate
                        xG = x_origin + xt * tileSizeGeo + xtc*resolution
                        yG = y_origin + yt * tileSizeGeo + ytc*resolution

                        if xG<x_min: continue
                        if xG>x_max: continue
                        if yG<y_min: continue
                        if yG>y_max: continue

                        #get value
                        v = values_calculator[k](xG, yG)

                        #
                        if v==None: continue
                        if cell == None: cell = make_cell(keys)
                        cell[k] = v
                    
                    #no value found: skip
                    if cell == None: continue

                    #set cell x,y within its tile
                    cell["x"] = xtc
                    cell["y"] = ytc

                    cells.append(cell)


            #if no cell within tile, skip
            if len(cells) == 0: continue

            #store extreme positions, for info.json file
            if minTY == None or yt<minTY: minTY = yt
            if maxTY == None or yt>maxTY: maxTY = yt
            if minTX == None or xt<minTX: minTX = xt
            if maxTX == None or xt>maxTX: maxTX = xt

            #remove column with all values null
            #check columns
            for key in keys:
                #check if cells all have key as column
                toRemove = True
                for c in cells:
                    if c[key]==None: continue
                    toRemove = False
                    break
                #remove column
                if toRemove:
                    for c in cells: del c[key]

            #make csv header, ensuring x and y are first columns
            headers = cells[0].keys()
            headers.remove("x")
            headers.remove("y")
            headers.insert(0, "x")
            headers.insert(1, "y")

            #create output folder if it does not already exists
            fo = output_folder + "/" + xt + "/"
            if not os.path.exists(fo): os.makedirs(fo)

            #save as CSV file
            cfp = fo + yt + ".csv"
            with open(cfp, 'w', newline='') as csv_file:
                writer = csv.writer(csv_file)
                #write the header
                writer.writerow(headers)

                #write the cell rows
                for c in cells:
                    writer.writerow(c)

            if format == "csv": continue

            #csv to parquet
            #load csv file            
            df = pd.read_csv(cfp)
            #save as parquet            
            df.to_parquet(fo + yt + ".parquet", engine='pyarrow', compression=compression, index=False)
            #delete csv file
            os.remove(cfp)


    #write info.json
    data = {
        "dims": [],
        "crs": crs,
        "tileSizeCell": tile_size_cell,
        "originPoint": {
            "x": x_origin,
            "y": y_origin
        },
        "resolutionGeo": resolution,
        "tilingBounds": {
            "yMin": minTY,
            "yMax": maxTY,
            "xMax": maxTX,
            "xMin": minTX
        }
    }

    with open(output_folder + '/info.json', 'w') as json_file:
        json.dump(data, json_file, indent=3)

