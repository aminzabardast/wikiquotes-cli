#!/usr/bin/env node

// Declaring program variable
import { Command } from 'commander'
import { searchAuthor, getQuotes, detectIndividual, getQuotesSection } from './utils.mjs'

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
                    try {
                        const name = detectIndividual(response)
                        console.log(`Quote From: ${name}`)
                        getQuotesSection(response)
                    } catch (e) {
                        console.log(`No Individual Found!`)
                    }
                })
            )
            .catch(error => console.log(error))
        console.log(`Command Options: ${JSON.stringify(options)}`)
        console.log(`Program Options: ${JSON.stringify(program.opts())}`)
    }).addHelpText('after', `\nExamples:\n  $ wikiquotes ind "Bill Gates"`
)

program.parse();
