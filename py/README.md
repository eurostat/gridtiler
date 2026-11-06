# GridTiler in Python

Install latest version of [pygridmap](https://github.com/eurostat/pygridmap) library with:

```python
pip install git+https://github.com/eurostat/pygridmap.git
```

## Tiling gridded raster data

To tile gridded data from a raster file such as GeoTiff, import `gridtiler_raster` in your code with `from pygridmap import gridtiler_raster`. `gridtiler_raster` gives access to a function `tiling_raster`.

This requires [rasterio](https://rasterio.readthedocs.io), which is not installed with pygridmap. Install it with `pip install rasterio`.

See an example [here](example_2.py). See also [this repository](https://github.com/jgaffuri/tiled-europe-forest/tree/main).

NB: For aggregating raster data, use [gdalwarp](https://gdal.org/programs/gdalwarp.html) program.

## Tiling gridded CSV data

To tile CSV gridded data, import `gridtiler` in your code with `from pygridmap import gridtiler`. `gridtiler` gives the three functions:
- `gridtiler.grid_transformation` to change the format of a CSV grid.
- `gridtiler.grid_aggregation` to aggregate a CSV grid into a lower resolution CSV grid.
- `gridtiler.grid_tiling` to tile a CSV grid.

Let's see an example on [european population grid at 5000m resolution](/assets/pop_5000m.csv). This input CSV dataset includes total population for 2006, 2011, 2018 and 2021 (columns `TOT_P_2006`, `TOT_P_2011`, `TOT_P_2018`, `TOT_P_2021`), a columns on country code `CNTR_ID` and the grid cell identifier `GRD_ID`.

The first step is to transform the input data to extract the `x` and `y` from the `GRD_ID` and then remove the `GRD_ID` and `CNTR_ID` colmuns. It can be achieved with:

```python
#define cell transformation function
def cell_transformation_fun(c):

    #extract x and y from grid cell code
    a = c['GRD_ID'].split("N")[1].split("E")
    c["x"] = int(a[1])
    c["y"] = int(a[0])

    #delete unecessary data
    del c['GRD_ID']
    del c['CNTR_ID']

print("Transformation")
gridtiler.grid_transformation("assets/pop_5000m.csv", cell_transformation_fun, "tmp/pop_5000.csv")
```

The output file `tmp/pop_5000.csv` is ready to be tiled, but aggregated version at 10000, 20000 and 50000m resolution can be produced first with:

```python
print("Aggregation to 10 000m")
gridtiler.grid_aggregation("tmp/pop_5000.csv", 5000, "tmp/pop_10000.csv", 2, aggregation_rounding=0)

print("Aggregation to 20 000m")
gridtiler.grid_aggregation("tmp/pop_5000.csv", 5000, "tmp/pop_20000.csv", 4, aggregation_rounding=0)

print("Aggregation to 50 000m")
gridtiler.grid_aggregation("tmp/pop_5000.csv", 5000, "tmp/pop_50000.csv", 10, aggregation_rounding=0)
```

By default, the aggregated values are the sum of the values. To use another method, specify an `aggregation_fun` dictionary giving the function of each column. For example, to compute the mean of a column `age` and keep the most frequent value of a column `type`:

```python
gridtiler.grid_aggregation("tmp/grid_5000.csv", 5000, "tmp/grid_10000.csv", 2, aggregation_fun={"age": gridtiler.aggregation_average_3, "type": gridtiler.aggregation_mode})
```

The predefined functions are:

| Function | Result | Empty values |
| --- | --- | --- |
| `aggregation_sum` | Sum | Ignored |
| `aggregation_average` | Sum, divided by the number of cells with a row in the input | Count as 0 |
| `aggregation_average_2` | Sum, divided by the number of possible cells (*a x a*) | Count as 0 |
| `aggregation_average_3` | Mean | Ignored |
| `aggregation_median` | Median | Ignored |
| `aggregation_min`, `aggregation_max` | Minimum, maximum | Ignored |
| `aggregation_mode` | Most frequent value. Also for non-numerical values | Ignored |
| `aggregation_single_value` | Value of the first cell | Not ignored |

A custom function can also be used: it receives the list of values and the number of possible cells (*a x a*).

Each resolution file can be tiled with:

```python
print("Tiling 5000m")
gridtiler.grid_tiling("tmp/pop_5000.csv", "tmp/5000", 5000)

print("Tiling 10 000m")
gridtiler.grid_tiling("tmp/pop_10000.csv", "tmp/10000", 10000)

print("Tiling 20 000m")
gridtiler.grid_tiling("tmp/pop_20000.csv", "tmp/20000", 20000)

print("Tiling 50 000m")
gridtiler.grid_tiling("tmp/pop_50000.csv", "tmp/50000", 50000)
```

See the entire script [here](example_1.py).

