import rasterio

file_path = '/home/juju/Bureau/sample.tif'
with rasterio.open(file_path) as src:
    data = src.read()
    metadata = src.meta

    geo_bounds = src.bounds
    num_bands = src.count

    transform = src.transform
    pixel_width = transform[0]
    pixel_height = -transform[4]

    no_data = metadata["nodata"]

    pixel_value = src.read(1)[450, 990]


print("Metadata:", metadata)
print("Data shape:", data.shape)
print("Data shape:", geo_bounds)

print("res x", pixel_width)
print("res y", pixel_height)


print("no data", no_data)
print("num_bands", num_bands)

print(pixel_value)




def tiling():
    return

