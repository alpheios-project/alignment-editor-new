import pkg from './package.json'
import Builder from 'alpheios-node-build'
import generateBuildInfo from './node_modules/alpheios-node-build/dist/support/build-info.mjs'
import { execFileSync, execSync } from 'child_process'
import * as core from '@actions/core'

(async function() {
  const buildDT = Date.now()
  const buildInfo = generateBuildInfo(buildDT)
  const npmTag = buildInfo.branch === 'production' ? 'rc' : buildInfo.branch
  console.log(`Starting build ${buildInfo.name}`)

  const baseVersion = pkg.version.split('-')[0]
  const version = `${baseVersion}-${buildInfo.name}`
  console.log(`Setting a package version to ${version}`)
  let output
  try {
    output = execSync(`npm version ${version} --no-git-tag-version --force`, { encoding: 'utf8' })
  } catch (e) {
    console.error('Cannot execute npm version:', e)
    process.exit(2)
  }

  console.log('Rebuilding an alignment editor. This may take a while')
  try {
    let builder = new Builder({
      module: 'all',
      mode: 'all',
      preset: 'vue',
      codeAnalysis: false,
      outputLevel: Builder.outputLevels.MIN,
      buildTime: buildDT
    })
    await builder.importConfig('config-output.mjs', 'build')
    await builder.runModules()

    builder = new Builder({
      module: 'all',
      mode: 'all',
      preset: 'vue',
      codeAnalysis: false,
      outputLevel: Builder.outputLevels.MIN,
      buildTime: buildDT
    })
    await builder.importConfig('config.mjs', 'build')
    await builder.runModules()

    builder = new Builder({
      module: 'all',
      mode: 'all',
      preset: 'vue',
      codeAnalysis: false,
      outputLevel: Builder.outputLevels.MIN,
      buildTime: buildDT
    })
    await builder.importConfig('config-pages.mjs', 'build')
    await builder.runModules()
  } catch (error) {
    console.error('Build process failed:', error)
    process.exit(3)
  }

  console.log('Rebuilding an alignment editor has been completed')

  try {
    console.info(core)
    core.default.setOutput('buildName',buildInfo.name)
    core.default.setOutput('npmTag',npmTag)
  } catch (error) {
    console.error('Failed to set output variable:', error)
    process.exit(4)
  }

})()