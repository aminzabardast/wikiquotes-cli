#!/usr/bin/env node

import _ from 'lodash'
const { map, join, clone, without, capitalize, isNull } = _
import axios from 'axios'
import cheerio from 'cheerio'


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

const detectIndividual = loadedContent => {
    const regex = /{{DEFAULTSORT:(.*)}}/gis
    const result = regex.exec(loadedContent)
    if (isNull(result)) {
        throw Error('No Individuals Found')
    }
    const name = result[1].trim()
    return name
}


export {
    generateAllCases,
    searchAuthor,
    getQuotes,
    detectIndividual
}
