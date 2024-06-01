import rasterio
from rasterio.transform import rowcol
from math import ceil,floor
import os
import csv
import json
import pandas as pd



def tiling_(values_calculator, resolution, output_folder, x_origin, y_origin, x_min, y_min, x_max, y_max, tile_size_cell=128, crs="", format="csv", compression="snappy"):
    """_summary_

    Args:
        values_calculator (_type_): _description_
        resolution (_type_): _description_
        output_folder (_type_): _description_
        x_origin (_type_): _description_
        y_origin (_type_): _description_
        x_min (_type_): _description_
        y_min (_type_): _description_
        x_max (_type_): _description_
        y_max (_type_): _description_
        tile_size_cell (int, optional): _description_. Defaults to 128.
        crs (str, optional): _description_. Defaults to "".
        format (str, optional): _description_. Defaults to "csv".
        compression (str, optional): _description_. Defaults to "snappy".

    Returns:
        _type_: _description_
    """

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
            print("tile", xt, yt)

            #prepare tile cells
            cells = []

            for xtc in range(0, tile_size_cell):
                for ytc in range(0, tile_size_cell):
                    #print("cell", xtc, ytc)

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
                        if cell == None: cell = make_cell()
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
            headers = list(cells[0].keys())
            headers.remove("x")
            headers.remove("y")
            headers.insert(0, "x")
            headers.insert(1, "y")

            #create output folder if it does not already exists
            fo = output_folder + "/" + str(xt) + "/"
            if not os.path.exists(fo): os.makedirs(fo)

            #save as CSV file
            cfp = fo + str(yt) + ".csv"
            with open(cfp, 'w', newline='') as csv_file:
                #get writer
                writer = csv.DictWriter(csv_file, fieldnames=headers)
                #write the header
                writer.writeheader()

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




def tiling_raster(in_raster_file, band_labels, output_folder, tile_size_cell=128, format="csv", compression="snappy"):

    #input raster file
    raster = rasterio.open(in_raster_file)

    #
    width = raster.width
    height = raster.height

    #get resolution
    transform = raster.transform
    pixel_width = transform[0]
    pixel_height = -transform[4]
    if pixel_width != pixel_height:
        print("Different resolutions in x and y for", in_raster_file, pixel_width, pixel_height)
        return
    resolution = pixel_width

    #get origin
    geo_bounds = raster.bounds
    x_min = geo_bounds[0]
    y_min  = geo_bounds[1]
    x_max = geo_bounds[2]
    y_max  = geo_bounds[3]

    #value to ignore
    metadata = raster.meta
    no_data = metadata["nodata"]

    if raster.count != len(band_labels):
        print("different number of bands and labels", raster.count, band_labels)

    print(width, height)

    values_calculator = {}
    r2 = resolution/2
    for i, label in enumerate(band_labels):
        data = raster.read(i+1)
        def fun(x_cell,y_cell):
            row, col = rowcol(transform, x_cell+r2, y_cell+r2)
            if col>=width or col<0: return None
            if row>=height or row <0: return None
            pixel_value = data[row,col]
            if pixel_value == no_data: return None
            return pixel_value
        values_calculator[label] = fun

    #tiling
    tiling_(values_calculator, resolution, output_folder, x_min, y_min, x_min, y_min, x_max, y_max, tile_size_cell, str(raster.crs), format, compression)


print("start")
tiling_raster('assets/LU001_LUXEMBOURG_UA2012_DHM_V020.tif', ["height"], "assets/lux_height/")
