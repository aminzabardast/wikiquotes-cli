#!/usr/bin/env node

// Declaring program variable
const { Command } = require('commander');
const program = new Command();

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
    });

program
    .command('author <name>')
    .description('Load a random quote form a given author')
    .option('-a, --additional-information', 'Output Additional Information')
    .action((name, options) => {
        console.log('--author--')
        console.log(`Name: ${name}`);
        console.log(`Command Options: ${JSON.stringify(options)}`)
        console.log(`Program Options: ${JSON.stringify(program.opts())}`)
    }).addHelpText('after', `\nExamples:\n  $ wikiquotes author "Bill Gates"`
);

program.parse();
