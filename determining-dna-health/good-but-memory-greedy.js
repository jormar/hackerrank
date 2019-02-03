'use strict'

/**
 * It works. Offer good answers but take too much memory! (Over 700MB for test 02)
 * So, it don't pass the tests.
 */

process.stdin.resume()
process.stdin.setEncoding('utf-8')

let inputString = ''
let currentLine = 0

process.stdin.on('data', inputStdin => {
    inputString += inputStdin
})

process.stdin.on('end', _ => {
    inputString = inputString.replace(/\s*$/, '')
        .split('\n')
        .map(str => str.replace(/\s*$/, ''))

    main()
})

function readLine() {
    return inputString[currentLine++]
}


function main() {
    let min = Infinity
    let max = -Infinity

    const n = parseInt(readLine(), 10)

    const genes = readLine().split(' ')

    const health = readLine().split(' ').map(healthTemp => parseInt(healthTemp, 10))

    const s = parseInt(readLine(), 10)

    // Genes Map with accumulated health
    const genesAccMaps = [new Map([[genes[0], health[0]]])]
    for (let i = 1; i < genes.length; i++) {
        const gen = genes[i]
        genesAccMaps[i] = new Map(genesAccMaps[i - 1])
        genesAccMaps[i].set(gen, genesAccMaps[i].get(gen) + health[i] || health[i])
    }

    for (let sItr = 0; sItr < s; sItr++) {
        const firstLastd = readLine().split(' ')

        const first = parseInt(firstLastd[0], 10)

        const last = parseInt(firstLastd[1], 10)

        const d = firstLastd[2]

        let genMap = new Map()
        if (first !== 0) {
            genesAccMaps[last].forEach((health, gen) => {
                const accHealt = health - (genesAccMaps[first - 1].get(gen) || 0)
                if (accHealt > 0) {
                    genMap.set(gen, accHealt)
                }
            })
        } else {
            genMap = new Map(genesAccMaps[last])
        }

        let totalHealth = 0
        genMap.forEach((health, gen) => {
            const re = new RegExp(`(?=(${gen}))`, 'g')
            let match = null
            let findedCount = 0
            while ((match = re.exec(d)) !== null) {
                if (match.index === re.lastIndex) {
                    re.lastIndex++
                }
                findedCount++
            }
            totalHealth += health * findedCount
        })

        if (totalHealth < min) {
            min = totalHealth
        }

        if (totalHealth > max) {
            max = totalHealth
        }

        // console.log(sItr, s) // DEBUG time trace
    }

    // Print solution
    console.log(`${min} ${max}`)
}
