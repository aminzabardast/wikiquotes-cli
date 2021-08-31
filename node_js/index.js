#!/usr/bin/env node

// Declaring program variable
const axios = require('axios').default
const { Command } = require('commander')
const { capitalize, map, clone, join, without } = require('lodash')
const cheerio = require('cheerio')

const generateAllCases = (numberOfWords, phrase, result, counter=0, arr=[]) => {
    {
        if (counter === numberOfWords) {
            phrase = phrase.split(' ')
            phrase = map(arr, (item, idx) => {
                return item ? capitalize(phrase[idx]) : phrase[idx]
            })
            phrase = join(phrase, ' ')
            result.push(phrase)
        } else {
            let arr1 = clone(arr)
            arr1.push(0)
            generateAllCases(numberOfWords, phrase, result, counter + 1, arr1)
            let arr2 = clone(arr)
            arr2.push(1);
            generateAllCases(numberOfWords, phrase, result, counter + 1, arr2)
        }
    }
}

const searchAuthor = async name => {
    let parts = name.toLowerCase().split(' ')
    const wordCount = parts.length
    const result = []
    generateAllCases(wordCount, name.toLowerCase(), result)
    return new Promise((resolve, reject) => {
        axios.get(`https://en.wikiquote.org/w/api.php?action=query&format=json&indexpageids=1&iwurl=1&titles=${join(result, '|')}&redirects=1&utf8=1`)
            .then( response => {
                const pageIds = response.data.query.pageids
                const targets = without(map(pageIds, item => parseInt(item) > 0 ? item : undefined), undefined)
                if (targets.length) {
                    resolve(targets)
                } else {
                    reject('Author not found!')
                }
            })
            .catch( error => {
                reject(error)
            })
    })
}

const getQuotes = async pageId => {
    return new Promise((resolve, reject) => {
        axios.get(`https://en.wikiquote.org/w/api.php?action=query&format=json&export=1&exportnowrap=1&pageids=${pageId}&utf8=1`)
            .then( response => {
                const data = response.data
                const $ = cheerio.load(data)
                resolve($('text').text())
            })
            .catch( error => {
                reject(error)
            })
    })
}

const program = new Command()

// Add Program Options and Version Information
program
    .version('0.1.0')
    .option('-j, --json-output', 'Output in JSON format')

// Add Commands
program
    .command('random')
    .alias('rand')
    .description('Load a random quote')
    .option('-a, --additional-information', 'Output Additional Information')
    .action((options) => {
        console.log('--random--')
        console.log(`Command Options: ${JSON.stringify(options)}`)
        console.log(`Program Options: ${JSON.stringify(program.opts())}`)
    })

program
    .command(' individual <name>')
    .alias('ind')
    .description('Load a random quote form a given individual')
    .option('-a, --additional-information', 'Output Additional Information')
    .action((name, options) => {
        console.log('--individual--')
        console.log(`name: ${name}`);
        searchAuthor(name)
            .then(pageIds => getQuotes(pageIds[0])
                .then(response => {
                    console.log('Wiki Content:')
                    console.log(response)
                })
            )
            .catch(error => console.log(error))
        console.log(`Command Options: ${JSON.stringify(options)}`)
        console.log(`Program Options: ${JSON.stringify(program.opts())}`)
    }).addHelpText('after', `\nExamples:\n  $ wikiquotes ind "Bill Gates"`
)

program.parse();
