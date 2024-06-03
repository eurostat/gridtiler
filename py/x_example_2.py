from x_gridtiler_raster import tiling_raster

tiling_raster(
    #input data
    { "height": {"file":'assets/LU001_LUXEMBOURG_UA2012_DHM_V020.tif', "band":1, 'no_data_values':[255,0]} },
    #output folder
    "tmp/lux_height/",
    #resolution
    10,
    #extent
    4036900,
    2946000,
    4046740,
    2956380
    )
