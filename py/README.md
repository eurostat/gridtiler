# GridTiler in Python

Install latest version of [pygridmap](https://github.com/eurostat/pygridmap) library with:

```python
pip install git+https://github.com/eurostat/pygridmap.git
```

and import `gridtiler` in your code with:

```python
from pygridmap import gridtiler
```

`gridtiler` gives the three functions:
- `gridtiler.grid_transformation` to change the format of a CSV grid.
- `gridtiler.grid_aggregation` to aggregate a CSV grid into a lower resolution CSV grid.
- `gridtiler.grid_tiling` to tile a CSV grid.

## Example

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
gridtiler.grid_aggregation("tmp/pop_5000.csv", 5000, "tmp/pop_10000.csv", 2, 0)

print("Aggregation to 20 000m")
gridtiler.grid_aggregation("tmp/pop_5000.csv", 5000, "tmp/pop_20000.csv", 4, 0)

print("Aggregation to 50 000m")
gridtiler.grid_aggregation("tmp/pop_5000.csv", 5000, "tmp/pop_50000.csv", 10, 0)
```

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

