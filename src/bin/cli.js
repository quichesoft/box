#!/usr/bin/env node
'use strict'

const program = require('commander')
const Liftoff = require('liftoff')
const interpret = require('interpret')
const argv = require('minimist')(process.argv.slice(2))
const path = require('path')
const fs = require('fs')

function invoke (env) {
  program
      .version('0.0.1')
      .command('reloadScheme <nodeEnv> <name>')
      .description('insert new data to db')
      .option('-p, --path <path>', 'path to scheme file')
      .option('-k, --knex <pathToKnexfile>', 'relative path to knexfile')
      .action((nodeEnv, name, options) => {
        nodeEnv = nodeEnv || 'local'

        console.log('Using env: ' + nodeEnv)
        const knex = require('knex')(require(knexPath(env.cwd, options.knex))[nodeEnv])
        const schemeData = fs.readFileSync(options.path || path.join(env.cwd, `./schemes/${name}`), 'utf-8')

        return knex
            .raw(schemeData)
            .then(() => {
              console.log('Scheme reloaded')
              process.exit(0)
            })
            .catch((err) => {
              console.error(err)
              process.exit(1)
            })
      })

  program
      .command('seed <nodeEnv>')
      .description('seed data to DB')
      .option('-p, --path <path>', 'path to seed files')
      .option('-k, --knex <pathToKnexfile>', 'relative path to knexfile')
      .action((nodeEnv, options) => {
        nodeEnv = nodeEnv || 'local'

        const knex = require('knex')(require(knexPath(env.cwd, options.knex))[nodeEnv])

        return knex
            .seed
            .run({directory: options.path || path.join(env.cwd, `./seeds`)})
            .then(() => {
              process.exit(0)
            })
            .catch((err) => {
              console.error(err)
              process.exit(1)
            })
      })

  program
      .command('migrate <nodeEnv>')
      .description('migrate db')
      .option('-p, --path <path>', 'path to migration files')
      .option('-k, --knex <pathToKnexfile>', 'relative path to knexfile')
      .action((nodeEnv, options) => {
        nodeEnv = nodeEnv || 'local'

        console.log('Using env: ' + nodeEnv)
        console.log('Migrate scheme')

        const knex = require('knex')(require(knexPath(env.cwd, options.knex))[nodeEnv])

        return knex
            .migrate
            .latest({directory: options.path || path.join(env.cwd, `./migrations`)})
            .then(() => {
              process.exit(0)
            })
            .catch((err) => {
              console.error(err)
              process.exit(1)
            })
      })

  program
      .command('rollback <nodeEnv>')
      .description('rollback DB')
      .option('-p, --path <path>', 'path to migration files')
      .option('-k, --knex <pathToKnexfile>', 'relative path to knexfile')
      .action((nodeEnv, options) => {
        nodeEnv = nodeEnv || 'local'

        console.log('Using env: ' + nodeEnv)
        console.log('Rollback scheme')

        const knex = require('knex')(require(knexPath(env.cwd, options.knex))[nodeEnv])

        return knex
            .migrate
            .rollback({directory: options.path || path.join(env.cwd, `./migrations`)})
            .then(() => {
              process.exit(0)
            })
            .catch((err) => {
              console.error(err)
              process.exit(1)
            })
      })

  program.parse(process.argv)
}

function knexPath (cwd, input) {
  let knexPath = null
  if (input == null) {
    knexPath = path.join(cwd, `knexfile.js`)
    console.log('no knexfile, using: ' + knexPath)
  } else {
    knexPath = path.join(cwd, input)
    console.log('knex configuration file: ' + knexPath)
  }

  return knexPath
}

const cli = new Liftoff({
  name: 'box',
  extensions: interpret.jsVariants,
  v8flags: require('v8flags')
})

cli.launch({
  cwd: argv.cwd,
  configPath: argv.config,
  require: argv.require,
  completion: argv.completion
}, invoke)
