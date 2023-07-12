#!/usr/bin/env node

/*
sudo npm i -g
sudo npm uninstall -g
gridtiler -i ../assets/pop_2018_10km.csv -r 10000 --crs 3035 -t 128 -x 0 -y 0
*/

//examples:
//https://github.com/nodejs/examples/tree/main/cli/commander/fake-names-generator
//https://github.com/topojson/topojson-server/tree/master


import gtil from 'gridtiler'
import cmd from 'commander'

import pkg from "../package.json" assert { type: "json" };
//import pkg from "../package.json" with { type: "json" };
//import { readFileSync } from 'fs';
//const pkg = JSON.parse(readFileSync("package.json"));

//define command line parameters
cmd
    .version(pkg.version)
    //.usage("[options] <[name=]file>…")
    .description(pkg.description)
    .option("-i, --input <file>", "input CSV file. One row per cell. The file is expected to include two 'x' and 'y' columns for the coordinates of the lower left corner. If not, see positionFunction parameter")
    .option("-o, --output <folder>", "output folder where to produce the tiled grid.", "out/")
    .option("-c, --crs <EPSG code>", "EPSG code of the grid Coordinate Reference System", "")
    .option("-t, --tileSizeCell <number>", "The size of the tile in number of cells.", 128)
    .option("-x, --originPointX <number>", "The X coordinate of the tiling scheme origin point (bottom left).", 0)
    .option("-y, --originPointY <number>", "The Y coordinate of the tiling scheme origin point (bottom left).", 0)
    .option("-r, --resolutionGeo <number>", "The grid resolution, that is the size of a grid cell in the CRS unit.")
    .option("-p, --positionFunction <string>", "A javascript function body returning the position of an input cell c as a {x,y} object.", "return { x: c.x, y: c.y };")
    .option("-f, --filterFunction <string>", "A javascript function body specifying if a cell should be filtered or kept. Return true to keep, false to filter out.", "return true;")
    .option("-m, --modFunction <string>", "A javascript function body modifying an input cell c before writing a cell data. This may be used for example to remove unecessary columns, or computing new ones from the combination of others.", "")
    .option("-d, --delim <number>", "The CSV delimiter.", ",")
//.on('--help', () => { console.log('show help') })

//read command line parameters
cmd.parse(process.argv);

//check mandatory parameters
if (!cmd.input)
    throw new Error("Missing parameter: -i, --input");
if (!cmd.resolutionGeo)
    throw new Error("Missing parameter: -res, --resolutionGeo");

//launch tiling
gtil(cmd)


