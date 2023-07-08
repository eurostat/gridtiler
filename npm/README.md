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

TODO: CSV file with 

### Specify cell position

TODO: case were filed is not x,y. Case where position is upper left corner.

### Dealing with INSPIRE cell ID

TODO: show example

