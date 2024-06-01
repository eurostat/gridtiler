import rasterio
from math import ceil,floor

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

def tiling(values_calculator, resolution, folder_out, x_or, y_or, x_min, y_min, x_max, y_max, tile_size_nb=128, crs="", format="csv", compression="snappy"):


    #tile frame caracteristics
    tileSizeGeo = resolution * tile_size_nb
    tileMinX = floor( (x_min - x_or) / tileSizeGeo )
    tileMinY = floor( (y_min - y_or) / tileSizeGeo )
    tileMaxX = ceil( (x_max - x_or) / tileSizeGeo )
    tileMaxY = ceil( (y_max - y_or) / tileSizeGeo )

    #get keys
    keys = values_calculator.keys()

	#TODO parallel ?
    for tx in range(tileMinX, tileMaxX):
        for ty in range(tileMinY, tileMaxY):
            #handle tile (tx,ty)

            #prepare tile cells
            cells = []

