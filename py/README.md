# GridTiler in Python

Install the [pygridmap](https://github.com/eurostat/pygridmap) library with:

```python
pip install git+https://github.com/eurostat/pygridmap.git
```

```python
from pygridmap import gridtiler
```

'gridtiler' gives the three functions:
- 'gridtiler.grid_tiling' to tile a CSV grid.
- 'gridtiler.grid_transformation' to change the format of a CSV grid.
- 'gridtiler.grid_aggregation' to aggregate a CSV grid into a lower resolution CSV grid.

## Example

TODO: with pop_5000m.csv file.


## See also

See this Jupyter notebook based on Pandas implemented by [@wahlatlas](https://github.com/wahlatlas):
https://github.com/wahlatlas/grid_data/blob/main/gridviz_tiled_csv.ipynb

