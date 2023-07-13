# GridTiler

![npm](https://img.shields.io/npm/v/gridtiler)
![license](https://img.shields.io/badge/license-EUPL-success)

Produce tiled grids in [tiled grid format](https://github.com/eurostat/gridviz/blob/master/docs/tiledformat.md) for web mapping applications such as [GridViz](https://github.com/eurostat/gridviz).


## Installation

- Install [Node.js](https://nodejs.org/), version >=14
- Run `npm install gridtiler -g` (with `sudo` for Linux users)

`gridtiler` command is now available.

## Documentation

Run `gridtiler --help` to show the help, or see there:

| Parameter | Required | Description | Default value |
| ------------- | ------------- |-------------| ------|
| -i, --input <file> | X | Input CSV file. One row per cell. The file is expected to include two *x* and *y* columns for the coordinates of the lower left corner. If not, see *positionFunction* parameter. |  |
| -o, --output <folder> | | output folder where to produce the tiled grid. | "out/" |
| -r, --resolutionGeo <number> | X | The grid resolution, that is the size of a grid cell in the CRS unit. |  |
| -t, --tileSizeCell <integer> | | The size of the tile in number of cells. | 128 |
| -x, --originPointX <number> | | The X coordinate of the tiling scheme origin point (bottom left). |0  |
| -y, --originPointY <number> | | The Y coordinate of the tiling scheme origin point (bottom left). |0  |
| -a, --aggregationFactor <integer> | | In case there is the need for aggregating the cells to lower resolution, specify this parameter. The resolution of the aggregated grid will be this parameter time the input resolution *resolutionGeo*. | undefined |
| -p, --positionFunction <string> | | A javascript function body returning the position of an input cell c as a {x,y} object. | "return { x: c.x, y: c.y };" |
| -f, --filterFunction <string> | | A javascript function body specifying if an input cell should be filtered or kept. Return true to keep, false to filter out. | undefined |
| -m, --modFunction <string> | | A javascript function body modifying an input cell c. This may be used for example to remove unecessary columns, or computing new ones from the combination of others. This function applies after filtering. | undefined |
| -d, --delim <string> | | The CSV delimiter. | "," |
| -c, --crs <EPSG code> | | EPSG code of the grid Coordinate Reference System. | "" |
| -V, --version | | Show version number. |  |
| -h, --help | | Show the help. |  |

## Usage

### Default

The default input format is a CSV file with the following specifications:
- One grid cell per row.
- A *x* and *y* columns with the coordinates of the cell bottom left corner position in the grid CRS.
- Other columns with data of the grid cells, as many as necessary, numerical or not.
- The order of the columns does not matter. For example, the *y* column could be the last one.

Here is an example, for a grid of 5 cells of resolution *10* with two data columns *pop* (numerical) and *type* (text):

```
x,y,pop,type
1000,2000,54654,A
1010,2000,4554,B
5000,2000,6434,C
4150,2560,43,B
4160,2560,43,A
```

If this data is stored in a **grid.csv** file, simply run `gridtiler -i grid.csv -r 10` in the folder where the *grid.csv* file is located to produce the tiled grid in a **out/** folder.

Since the grid is located north and east of point *(1000,2000)*, this point could be used as an origin point. Run `gridtiler -i grid.csv -r 10 -x 1000 -y 2000` to adapt this.

### Custom cell position

When the input data does not provide explicit **x** and **y** columns for the bottom left position of each cell, the **positionFunction** parameter can be used to derive this position from other cell data. This parameter is a javascript function which returns the bottom left position of a cell. By default, this function body is `return { x: c.x, y: c.y };` which simply returns the *x* and *y* column values of a cell *c*.

Examples:
- If the bottom left coordinates are in two **posX** and **posY** columns, use: `--positionFunction "return { x: c.posX, y: c.posY };"`
- If the cells position is the position of its center in two columns **xCentre** and **yCentre**, and the grid resolution is **1000**, use: `--positionFunction "return { x: c.xCentre - 500, y: c.yCentre - 500 };"` which translates the centre position toward the bottom left corner.
- If the cell is described by its INSPIRE identifier, see below.

#### Dealing with INSPIRE identifier

If the cell is described with an INSPIRE identifier (such as *CRS3035RES5000mN4585000E5265000*) in a **GRD_ID** column, use the following parameter to extract the cell position:

`--positionFunction "const a=c.GRD_ID.split('N')[1].split('E');return {x:a[1],y:a[0]};"`

This **GRD_ID** column may then be removed in the output tiles with:

`--modFunction "delete c.GRD_ID"`

Example: With European population grids downloaded from [Eurostat grids page](https://ec.europa.eu/eurostat/web/gisco/geodata/reference-data/grids), use:

`gridtiler -i pop_5000m.csv -r 5000 --positionFunction "const a=c.GRD_ID.split('N')[1].split('E');return {x:a[1],y:a[0]};" --modFunction "delete c.GRD_ID"`

### Aggregation

Gridtiler offers the possibility to aggregate grid cells to lower resolutions, on-the-fly, using the `-a, --aggregationFactor` parameter. The resolution of the target grid will be this parameter time the input grid resolution specified under `-r, --resolutionGeo` parameter. The tiling then applies on the aggregated grid.

Example: The command `gridtiler -i pop_5000m.csv -r 5000 -a 4` aggregates the grid *pop_5000m.csv* from the input resolution *5000* to the resolution *5000 x 4 = 20000*.

### Filtering and modifying

Use the parameters **filterFunction** and **modFunction** to filter and modify the cells.

For example, to select only the cells with a *type* value *A* or *B*, multiply the *pop* value by 1000 and add a new column *new* with the value 100, run:

`gridtiler -i grid.csv -r 10 --filterFunction "return c.type==='A' || c.type==='C'" --modFunction "c.pop*=1000;c.new=100"`

## Other resources

Grid tiling in: 
- [Python](/py)
- [Java](/java)


## About

|            |             |
| -------------- | ----------- |
| _contributors_ | [<img src="https://github.com/jgaffuri.png" height="40" />](https://github.com/jgaffuri) [<img src="https://github.com/JoeWDavies.png" height="40" />](https://github.com/JoeWDavies) |
| _version_      | See [npm](https://www.npmjs.com/package/gridtiler?activeTab=versions)      |
| _status_       | Since 2023        |
| _license_      | [EUPL 1.2](LICENSE)        |

### Support and contribution

Feel free to [ask support](https://github.com/eurostat/gridtiler/issues/new), fork the project or simply star it (it's always a pleasure).
