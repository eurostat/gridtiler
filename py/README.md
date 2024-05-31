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
#cell transformation function
def cell_transformation(c):

    #extract x and y from grid cell code
    a = c['GRD_ID'].split("N")[1].split("E")
    c["x"] = int(a[1])
    c["y"] = int(a[0])

    #delete unecessary data
    del c['GRD_ID']
    del c['CNTR_ID']

print("Transformation")
gridtiler.grid_transformation("assets/pop_5000m.csv", cell_transformation, "tmp/pop_5000.csv")
```




TODO: with pop_5000m.csv file.


## See also

See this Jupyter notebook based on Pandas implemented by [@wahlatlas](https://github.com/wahlatlas):
https://github.com/wahlatlas/grid_data/blob/main/gridviz_tiled_csv.ipynb

