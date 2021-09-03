#!/usr/bin/env node

import _ from 'lodash'
const { map, join, clone, without, capitalize, isNull, indexOf } = _
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

const detectIndividual = wikiText => {
    const regex = /{{DEFAULTSORT:(.*)}}/gis
    const result = regex.exec(wikiText)
    if (isNull(result)) {
        throw Error('No Individuals Found')
    }
    const name = result[1].trim()
    return name
}

const getQuotesSection = wikiText => {
    wikiText = removeFilesFromWikiText(wikiText)
    wikiText = removeInternalLinksFromWikiText(wikiText)
    wikiText = removeTypographyFromWikiText(wikiText)
    wikiText = removeHtmlFromWikiText(wikiText)
    wikiText = removeURLsFromWikiText(wikiText)
    const regex = /\n==([^=]+)==\n/gi
    let titles = []
    let title = null
    do {
        title = regex.exec(wikiText);
        if (title) {
            titles.push(replaceFilters(title[1].trim().toLowerCase()))
        }
    } while (title)
    const idx = indexOf(titles, 'quotes')
    if (idx < 0) {
        throw Error()
    }
    const sections = wikiText.split(/\n==[^=]+==\n/gi)
    console.log(sections[idx+1])
}

const replaceFilters = wikiText => {
    const regex = /\[(?:.*)\s+(.*)]/gi
    const matches = regex.exec(wikiText)
    return matches ? matches[1] : wikiText
}

const removeFilesFromWikiText = wikiText => {
    return wikiText.toString().replaceAll(/\[\[File:[^[\]]*(?:\[\[[^[\]]*]][^[\]]*)*]]/gi, '')
}

const removeFiltersFromWikiText = wikiText => {

}

const removeInternalLinksFromWikiText = wikiText => {
    wikiText = wikiText.toString().replaceAll(/\[\[[^[\]]*\|([^[\]]*)]]/gi, '$1')
    wikiText = wikiText.toString().replaceAll(/\[\[([^[\]]*)]]/gi, '$1')
    wikiText = wikiText.toString().replaceAll(/\[[^[\]]*\s([^[\]]*)]/gi, '$1')
    return wikiText
}

const removeTypographyFromWikiText = wikiText => {
    wikiText = wikiText.toString().replaceAll(/''+/gi, '')
    return wikiText
}

const removeHtmlFromWikiText = wikiText => {
    wikiText = wikiText.toString().replaceAll(/<ref>[^<]+<\/ref>/gi, '')
    wikiText = wikiText.toString().replaceAll(/<(\w+)>([^<]+)<\/\1>/gi, '$2')
    wikiText = wikiText.toString().replaceAll(/<!--[^\>]*>/gi, '')
    return wikiText
}

const removeURLsFromWikiText = wikiText => {
    wikiText = wikiText.toString().replaceAll(/\[https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&//=]*)\]/gi, '')
    return wikiText
}

export {
    generateAllCases,
    searchAuthor,
    getQuotes,
    detectIndividual,
    getQuotesSection
}
