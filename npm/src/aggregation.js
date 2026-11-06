
//The aggregation methods. Each one computes the aggregated value from the list of values of the cells.

const isEmpty = (v) => v === undefined || v === null || String(v).trim() === ""
const numbers = (vs) => vs.filter((v) => !isEmpty(v)).map((v) => +v)

const sum = (vs) => { let s = 0; for (let v of vs) s += +v; return s }

const mean = (vs) => {
    const ns = numbers(vs)
    return ns.length ? sum(ns) / ns.length : undefined
}

const median = (vs) => {
    const ns = numbers(vs)
    if (!ns.length) return undefined
    if (ns.some(Number.isNaN)) return NaN
    ns.sort((a, b) => a - b)
    const m = Math.floor(ns.length / 2)
    return ns.length % 2 ? ns[m] : (ns[m - 1] + ns[m]) / 2
}

const extreme = (better) => (vs) => {
    const ns = numbers(vs)
    if (!ns.length) return undefined
    let e = ns[0]
    for (let n of ns) {
        if (Number.isNaN(n)) return NaN
        if (better(n, e)) e = n
    }
    return e
}

//the most frequent value. In case of a tie, the first one found among the most frequent ones.
const mode = (vs) => {
    const counts = new Map()
    for (let v of vs)
        if (!isEmpty(v)) counts.set(v, (counts.get(v) || 0) + 1)

    //a map is iterated in the order the values were first found
    let best, bestCount = 0
    for (let [v, count] of counts)
        if (count > bestCount) { best = v; bestCount = count }
    return best
}

const methods = {
    sum,
    mean,
    average: mean,
    median,
    min: extreme((a, b) => a < b),
    max: extreme((a, b) => a > b),
    mode,
}

const getMethod = (name) => {
    if (!Object.prototype.hasOwnProperty.call(methods, name))
        throw new Error("Unexpected aggregation method: '" + name + "'. Supported methods: " + Object.keys(methods).join(", "))
    return name
}

/**
 * Parse an aggregation method specification, which is a comma separated list of:
 *  - "method", the method to use for all columns not listed otherwise. It is "sum" by default.
 *  - "column:method", the method to use for a specific column.
 *
 * @param {string|undefined} spec For example "mean" or "mean,pop:sum,type:mode"
 * @returns {{ defaultMethod:string, columns:Object.<string,string> }}
 */
export const parseAggregationMethod = (spec) => {
    const out = { defaultMethod: "sum", columns: {} }
    if (spec === undefined || spec === null) return out

    let defaultSet = false
    for (let item of String(spec).split(",")) {
        item = item.trim()
        const i = item.lastIndexOf(":")
        if (i < 0) {
            if (defaultSet) throw new Error("Several default aggregation methods specified: " + spec)
            out.defaultMethod = getMethod(item)
            defaultSet = true
        } else {
            const column = item.substring(0, i).trim()
            if (!column) throw new Error("Missing column name in aggregation method: '" + item + "'")
            out.columns[column] = getMethod(item.substring(i + 1).trim())
        }
    }
    return out
}

/**
 * Aggregate some values.
 * For all methods but "sum", the empty values are ignored. The result is undefined if all values are empty.
 * For "sum", the empty values count as 0.
 * The numerical methods return NaN if a value is not numerical. Only "mode" supports non numerical values.
 *
 * @param {string} method The method name.
 * @param {Array} vs The values to aggregate.
 * @returns {number|string|undefined}
 */
export const aggregate = (method, vs) => methods[getMethod(method)](vs)
