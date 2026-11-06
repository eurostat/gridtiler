import test from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdtempSync, writeFileSync, readFileSync, existsSync, rmSync, readdirSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { aggregate, parseAggregationMethod } from '../src/aggregation.js'

const bin = fileURLToPath(new URL('../bin/gridtiler.js', import.meta.url))
const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url)))

//run the command line, without the variables npm defines when running a script
const run = (...args) => {
    const env = { ...process.env }
    for (const k of Object.keys(env)) if (k.startsWith('npm_')) delete env[k]
    return spawnSync(process.execPath, [bin, ...args], { encoding: 'utf8', env })
}

//the input is a 2x2 block of cells, aggregated to a single cell with -a 2
const INPUT = 'x,y,pop,age,type,empty\n0,0,1,10,A,\n1000,0,2,20,B,\n0,1000,4,30,B,\n1000,1000,9,,A,\n'

const withDir = (fun) => {
    const dir = mkdtempSync(join(tmpdir(), 'gridtiler-'))
    try {
        const input = join(dir, 'in.csv')
        writeFileSync(input, INPUT)
        return fun(dir, input)
    } finally {
        rmSync(dir, { recursive: true, force: true })
    }
}

//the aggregated tile, as an object column -> value
const aggregated = (...method) =>
    withDir((dir, input) => {
        const out = join(dir, 'out') + '/'
        const r = run('-i', input, '-r', '1000', '-a', '2', '-o', out, ...method)
        assert.equal(r.status, 0, r.stderr)
        const [header, row] = readFileSync(join(out, '0', '0.csv'), 'utf8').split('\n')
        const values = row.split(',')
        return { cell: Object.fromEntries(header.split(',').map((k, i) => [k, values[i]])), stderr: r.stderr }
    })

const getDuckdb = () => {
    try {
        return createRequire(import.meta.url)('duckdb')
    } catch (e) {
        return undefined
    }
}
const noDuckdb = getDuckdb() ? false : 'duckdb is not installed'

test('aggregate: numerical methods', () => {
    const vs = ['1', '2', '4', '9']
    assert.equal(aggregate('sum', vs), 16)
    assert.equal(aggregate('mean', vs), 4)
    assert.equal(aggregate('average', vs), 4)
    assert.equal(aggregate('median', vs), 3)
    assert.equal(aggregate('median', ['9', '1', '4']), 4)
    assert.equal(aggregate('min', ['10', '9']), 9)
    assert.equal(aggregate('max', ['10', '9']), 10)
})

test('aggregate: mode', () => {
    assert.equal(aggregate('mode', ['A', 'B', 'B']), 'B')
    assert.equal(aggregate('mode', ['A', 'B', 'B', 'A']), 'A')
    assert.equal(aggregate('mode', ['', '', 'A']), 'A')
})

test('aggregate: empty values', () => {
    assert.equal(aggregate('sum', ['', '2']), 2)
    assert.equal(aggregate('sum', ['', '']), 0)
    assert.equal(aggregate('mean', ['', '2', '4']), 3)
    assert.equal(aggregate('median', ['', '2']), 2)
    assert.equal(aggregate('min', ['', '2']), 2)
    assert.equal(aggregate('max', ['', '2']), 2)
    for (const m of ['mean', 'median', 'min', 'max', 'mode']) assert.equal(aggregate(m, ['', ' ']), undefined, m)
})

test('aggregate: non numerical values give NaN, whatever their position', () => {
    for (const m of ['sum', 'mean', 'median', 'min', 'max']) {
        assert.ok(Number.isNaN(aggregate(m, ['A', '1'])), m)
        assert.ok(Number.isNaN(aggregate(m, ['1', 'A'])), m)
    }
})

test('aggregate: zero is a value, not an empty value', () => {
    assert.equal(aggregate('min', ['0', '5']), 0)
    assert.equal(aggregate('mean', ['0', '4']), 2)
    assert.equal(aggregate('mode', [0, 0, 5]), 0)
})

test('parseAggregationMethod', () => {
    assert.deepEqual(parseAggregationMethod(undefined), { defaultMethod: 'sum', columns: {} })
    assert.deepEqual(parseAggregationMethod('mean'), { defaultMethod: 'mean', columns: {} })
    assert.deepEqual(parseAggregationMethod('pop:sum, type:mode'), { defaultMethod: 'sum', columns: { pop: 'sum', type: 'mode' } })
    assert.deepEqual(parseAggregationMethod('mean,pop:sum'), { defaultMethod: 'mean', columns: { pop: 'sum' } })
    assert.throws(() => parseAggregationMethod('near'), /Unexpected aggregation method/)
    assert.throws(() => parseAggregationMethod('pop:near'), /Unexpected aggregation method/)
    assert.throws(() => parseAggregationMethod('constructor'), /Unexpected aggregation method/)
    assert.throws(() => parseAggregationMethod('mean,max'), /Several default/)
    assert.throws(() => parseAggregationMethod(':sum'), /Missing column/)
    assert.throws(() => parseAggregationMethod(''), /Unexpected aggregation method/)
})

test('CLI: the aggregation is a sum by default', () => {
    const { cell } = aggregated('-s', 'pop,age,empty')
    assert.deepEqual(cell, { x: '0', y: '0', pop: '16', age: '60', empty: '0' })
})

test('CLI: aggregation methods by column', () => {
    const { cell, stderr } = aggregated('-A', 'pop:median,age:mean,type:mode,empty:max')
    assert.deepEqual(cell, { x: '0', y: '0', pop: '3', age: '20', type: 'A', empty: '' })
    assert.equal(stderr, '')
})

test('CLI: default aggregation method, with an exception', () => {
    const { cell } = aggregated('-s', 'pop,age', '-A', 'max,pop:min')
    assert.deepEqual(cell, { x: '0', y: '0', pop: '1', age: '30' })
})

test('CLI: aggregated values are rounded, but not the mode', () => {
    const { cell } = withDir((dir, input) => {
        writeFileSync(input, 'x,y,a,b\n0,0,1,1.23456\n1000,0,2,1.23456\n0,1000,2,9\n')
        const out = join(dir, 'out') + '/'
        const r = run('-i', input, '-r', '1000', '-a', '2', '-o', out, '-A', 'a:mean,b:mode', '-R', '2')
        assert.equal(r.status, 0, r.stderr)
        const [header, row] = readFileSync(join(out, '0', '0.csv'), 'utf8').split('\n')
        const values = row.split(',')
        return { cell: Object.fromEntries(header.split(',').map((k, i) => [k, values[i]])) }
    })
    assert.equal(cell.a, '1.67')
    assert.equal(cell.b, '1.23456')
})

test('CLI: warning when a numerical method is applied on a non numerical column', () => {
    const { cell, stderr } = aggregated('-s', 'type')
    assert.equal(cell.type, 'NaN')
    assert.match(stderr, /Column type has non numerical values/)
})

test('CLI: unknown aggregation method or column', () => {
    withDir((dir, input) => {
        const out = join(dir, 'out') + '/'
        let r = run('-i', input, '-r', '1000', '-a', '2', '-o', out, '-A', 'near')
        assert.equal(r.status, 1)
        assert.match(r.stderr, /Unexpected aggregation method: 'near'/)
        r = run('-i', input, '-r', '1000', '-a', '2', '-o', out, '-A', 'nope:mean')
        assert.equal(r.status, 1)
        assert.match(r.stderr, /Unknown column in aggregationMethod parameter: nope/)
        assert.equal(existsSync(out), false)
    })
})

test('CLI: aggregation method without aggregation is ignored, with a warning', () => {
    withDir((dir, input) => {
        const r = run('-i', input, '-r', '1000', '-o', join(dir, 'out') + '/', '-A', 'mean')
        assert.equal(r.status, 0)
        assert.match(r.stderr, /aggregationMethod ignored/)
    })
})

test('CLI: empty values stay empty, and zero stays zero', () => {
    withDir((dir, input) => {
        writeFileSync(input, 'x,y,a,b\n0,0,,1\n1000,0,0,2\n2000,0, ,3.5\n')
        const out = join(dir, 'out') + '/'
        const r = run('-i', input, '-r', '1000', '-o', out)
        assert.equal(r.status, 0, r.stderr)
        assert.equal(readFileSync(join(out, '0', '0.csv'), 'utf8'), 'x,y,a,b\n0,0,,1\n1,0,0,2\n2,0,,3.5')
    })
})

test('CLI: output folder, with or without trailing slash', () => {
    withDir((dir, input) => {
        for (const out of [join(dir, 'with') + '/', join(dir, 'without')]) {
            const r = run('-i', input, '-r', '1000', '-o', out)
            assert.equal(r.status, 0, r.stderr)
            assert.ok(existsSync(join(out, 'info.json')), out)
            assert.ok(existsSync(join(out, '0', '0.csv')), out)
        }
        assert.equal(existsSync(join(dir, 'withoutinfo.json')), false)
    })
})

test('CLI: --version and --help, outside of npm', () => {
    assert.equal(run('--version').stdout.trim(), pkg.version)
    assert.match(run('--help').stdout, new RegExp(pkg.description))
})

test('CLI: unsupported parquet compression', () => {
    withDir((dir, input) => {
        const out = join(dir, 'out') + '/'
        const r = run('-i', input, '-r', '1000', '-e', 'parquet', '-z', 'LZO', '-o', out)
        assert.equal(r.status, 1)
        assert.match(r.stderr, /Unexpected parquet compression: 'LZO'/)
        assert.equal(existsSync(out), false)
    })
})

test('CLI: parquet compression without parquet output is ignored, with a warning', () => {
    withDir((dir, input) => {
        const r = run('-i', input, '-r', '1000', '-z', 'ZSTD', '-o', join(dir, 'out') + '/')
        assert.equal(r.status, 0)
        assert.match(r.stderr, /parquetCompression ignored/)
    })
})

test('CLI: error when duckdb is missing', { skip: noDuckdb ? false : 'duckdb is installed' }, () => {
    withDir((dir, input) => {
        const r = run('-i', input, '-r', '1000', '-e', 'parquet', '-o', join(dir, 'out') + '/')
        assert.equal(r.status, 1)
        assert.match(r.stderr, /requires the optional 'duckdb' package/)
    })
})

//read the rows and the compression modes of a parquet file.
//This is done in another process: with Database.all, duckdb keeps the file open, which prevents its deletion on Windows.
const READ_PARQUET = `
const duckdb = require('duckdb')
const f = process.argv[1]
const db = new duckdb.Database(':memory:')
db.all("SELECT * FROM read_parquet('" + f + "') ORDER BY x, y", (err, rows) => {
    if (err) throw err
    db.all("SELECT DISTINCT compression FROM parquet_metadata('" + f + "')", (err2, meta) => {
        if (err2) throw err2
        const toNumber = (k, v) => (typeof v === 'bigint' ? Number(v) : v)
        console.log(JSON.stringify({ rows, compressions: meta.map((m) => m.compression) }, toNumber))
    })
})`

const readParquet = (file) => {
    const r = spawnSync(process.execPath, ['-e', READ_PARQUET, file.split('\\').join('/')], {
        encoding: 'utf8',
        cwd: fileURLToPath(new URL('..', import.meta.url)),
    })
    assert.equal(r.status, 0, r.stderr)
    return JSON.parse(r.stdout)
}

const CODECS = [
    [undefined, 'GZIP'],
    ['UNCOMPRESSED', 'UNCOMPRESSED'],
    ['SNAPPY', 'SNAPPY'],
    ['GZIP', 'GZIP'],
    ['BROTLI', 'BROTLI'],
    ['LZ4', 'LZ4_RAW'],
    ['LZ4_RAW', 'LZ4_RAW'],
    ['ZSTD', 'ZSTD'],
    ['zstd', 'ZSTD'],
]

for (const [codec, expected] of CODECS)
    test('CLI: parquet output with compression ' + codec, { skip: noDuckdb }, () => {
        withDir((dir, input) => {
            const out = join(dir, 'out') + '/'
            const r = run('-i', input, '-r', '1000', '-e', 'parquet', '-o', out, '-s', 'pop,type', ...(codec ? ['-z', codec] : []))
            assert.equal(r.status, 0, r.stderr)
            assert.deepEqual(readdirSync(join(out, '0')), ['0.parquet'])
            const { rows, compressions } = readParquet(join(out, '0', '0.parquet'))
            assert.deepEqual(compressions, [expected])
            assert.deepEqual(rows.map((c) => [c.x, c.y, c.pop, c.type]), [
                [0, 0, 1, 'A'],
                [0, 1, 4, 'B'],
                [1, 0, 2, 'B'],
                [1, 1, 9, 'A'],
            ])
        })
    })
