from pygridmap import gridtiler_raster

gridtiler_raster.tiling_raster(
    {"heigth":{"file":'assets/LU001_LUXEMBOURG_UA2012_DHM_V020.tif', "band":1, 'no_data_values':[255,0]} },
    "assets/lux_height/",
    10,
    4036900,
    2946000,
    4046740,
    2956380
    )
