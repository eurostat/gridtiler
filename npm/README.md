# GridTiler - in javascript

![npm](https://img.shields.io/npm/v/gridtiler)
![license](https://img.shields.io/badge/license-EUPL-success)

## Installation

- Install first Node.js, version >=14
- Run `npm install gridtiler -g` (NB: with `sudo` for Linux users)

The command `gridtiler` will then be available.

## Documentation

Run `gridtiler --help` to show the help or see here:

| Parameter | Required | Description | Default value |
| ------------- | ------------- |-------------| ------|
| -i, --input <file> | X | Input CSV file. One row per cell. The file is expected to include two **x** and **y** columns for the coordinates of the lower left corner. If not, see **positionFunction** parameter. |  |
| -o, --output <folder> | | output folder where to produce the tiled grid. | "out/" |
| -r, --resolutionGeo <number> | X | The grid resolution, that is the size of a grid cell in the CRS unit. |  |
| -c, --crs <EPSG code> | | EPSG code of the grid Coordinate Reference System. | "" |
| -t, --tileSizeCell <number> | | The size of the tile in number of cells. | 128 |
| -x, --originPointX <number> | | The X coordinate of the tiling scheme origin point (bottom left). |0  |
| -y, --originPointY <number> | | The Y coordinate of the tiling scheme origin point (bottom left). |0  |
| -p, --positionFunction <string> | | A javascript function body returning the position of an input cell c as a {x,y} object. | "return { x: c.x, y: c.y };" |
| -m, --modFunction <string> | | A javascript function body modifying an input cell c before writing a cell data. | { delete c.x; delete c.y; } |
| -d, --delim <number> | | The CSV delimiter. | "," |
| -V, --version | | Output the version number. |  |
| -h, --help | | output usage information |  |

## Usage

### Default

The default input format is a CSV file with the following specifications:
- One row per grid cell.
- A **x** and **y** columns with the coordinates of the cell bottom left corner position in the grid CRS.
- Other columns with data of the grid cells, as many as necessary.
- The order of the columns does not matter. For example, the **y** column could be the last one.

Here is an example, for a grid of resolution *10* with two data columns *pop* (numerical) and *type* (text):

```
x,y,pop,type
1000,1000,54654,A
1010,1000,4554,B
5000,1000,6434,C
4150,2560,43,B
4160,2560,43,A
```

If this data is stored in a **grid.csv** file, run:

`gridtiler -i grid.csv -r`

in the folder where the *grid.csv* file is located to produce the tiled grid in a **out/** folder.



### Specify cell position

TODO: case were filed is not x,y. Case where position is upper left corner.

### Dealing with INSPIRE cell ID

TODO: show example
