import rasterio
from rasterio.transform import rowcol
from math import ceil,floor
import os
import csv
import json
import pandas as pd



def _tiling_(values_calculator, resolution, output_folder, x_origin, y_origin, x_min, y_min, x_max, y_max, tile_size_cell=128, crs="", format="csv", compression="snappy"):

    #tile frame caracteristics
    tile_size_geo = resolution * tile_size_cell
    tile_min_x = floor( (x_min - x_origin) / tile_size_geo )
    tile_min_y = floor( (y_min - y_origin) / tile_size_geo )
    tile_max_x = ceil( (x_max - x_origin) / tile_size_geo )
    tile_max_y = ceil( (y_max - y_origin) / tile_size_geo )

    #get keys
    keys = values_calculator.keys()

    #minimum and maximum tile x,y, for info.json file
    min_tx=None
    min_ty=None
    max_tx=None
    max_ty=None

    #function to make cell template
    def build_cell():
        c = {}
        for k in keys: c[k] = None
        return c

	#TODO parallel ?
    for xt in range(tile_min_x, tile_max_x):
        for yt in range(tile_min_y, tile_max_y):
            print("tile", xt, yt)

            #prepare tile cells
            cells = []

            for xtc in range(0, tile_size_cell):
                for ytc in range(0, tile_size_cell):
                    #print("cell", xtc, ytc)

                    #new cell
                    cell = None

                    #get values
                    for key in keys:
                        #compute geo coordinate
                        xc = x_origin + xt * tile_size_geo + xtc*resolution
                        yc = y_origin + yt * tile_size_geo + ytc*resolution

                        #check limits
                        if xc<x_min: continue
                        if xc>x_max: continue
                        if yc<y_min: continue
                        if yc>y_max: continue

                        #get value
                        v = values_calculator[key](xc, yc)

                        #
                        if v==None: continue

                        #if not built, build cell
                        if cell == None: cell = build_cell()
                        cell[key] = v

                    #no value found: skip
                    if cell == None: continue

                    #set cell x,y within its tile
                    cell["x"] = xtc
                    cell["y"] = ytc

                    #store cell
                    cells.append(cell)

            #if no cell within tile, skip
            if len(cells) == 0: continue

            #store extreme positions, for info.json file
            if min_tx == None or xt<min_tx: min_tx = xt
            if min_ty == None or yt<min_ty: min_ty = yt
            if max_tx == None or xt>max_tx: max_tx = xt
            if max_ty == None or yt>max_ty: max_ty = yt

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

            #create output folder, if it does not already exists
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
            "yMin": min_ty,
            "yMax": max_ty,
            "xMax": max_tx,
            "xMin": min_tx
        }
    }

    with open(output_folder + '/info.json', 'w') as json_file:
        json.dump(data, json_file, indent=3)




def tiling_raster(rasters, output_folder, resolution, x_min, y_min, x_max, y_max, x_origin=None, y_origin=None, crs="", tile_size_cell=128, format="csv", compression="snappy"):


    '''
    #set extent, if not specified
    geo_bounds = raster.bounds
    if x_min==None: x_min = geo_bounds[0]
    if y_min==None: y_min  = geo_bounds[1]
    if x_max==None: x_max = geo_bounds[2]
    if y_max==None: y_max  = geo_bounds[3]
    '''

    #set origin, if not specified
    if x_origin==None: x_origin=x_min
    if y_origin==None: y_origin=y_min

    #
    #width = raster.width
    #height = raster.height
    #width = int((x_max - x_min)/resolution)
    #height = int((y_max - y_min)/resolution)


    #if raster.count != len(band_labels):
    #    print("different number of bands and labels", raster.count, band_labels)

    values_calculator = {}
    r2 = resolution/2
    for label in rasters:
        e = rasters[label]

        #open file
        raster = rasterio.open(e["file"])
        transform = raster.transform

        #value to ignore
        nodata = raster.meta["nodata"]
        no_data_values = e["no_data_values"]

        data = raster.read(e["band"])

        def fun(x_cell,y_cell):
            row, col = rowcol(transform, x_cell+r2, y_cell+r2)
            if col>=raster.width or col<0: return None
            if row>=raster.height or row <0: return None
            pixel_value = data[row,col]
            if pixel_value == nodata or pixel_value in no_data_values: return None
            return pixel_value
        values_calculator[label] = fun

    #tiling
    _tiling_(values_calculator, resolution, output_folder, x_origin, y_origin, x_min, y_min, x_max, y_max, tile_size_cell, crs, format, compression)


print("start")
tiling_raster(
    {
    "tcd_2012":{"file":'/home/juju/geodata/forest/in/forest_TCD_2012_100.tif', "band":1, 'no_data_values':[255,0]},
    "tcd_2012":{"file":'/home/juju/geodata/forest/in/forest_TCD_2015_100.tif', "band":1, 'no_data_values':[255,0]},
    "tcd_2018":{"file":'/home/juju/geodata/forest/in/forest_TCD_2018_100.tif', "band":1, 'no_data_values':[255,0]},
    "dlt_2012":{"file":'/home/juju/geodata/forest/in/forest_DLT_2012_100.tif', "band":1, 'no_data_values':[255,0]},
    "dlt_2012":{"file":'/home/juju/geodata/forest/in/forest_DLT_2015_100.tif', "band":1, 'no_data_values':[255,0]},
    "dlt_2018":{"file":'/home/juju/geodata/forest/in/forest_DLT_2018_100.tif', "band":1, 'no_data_values':[255,0]}
 },
 "/home/juju/Bureau/aaa/",
 10000,
900000,
900000,
7400000,
5500000
 )
