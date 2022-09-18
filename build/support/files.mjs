/**
 * A scrip to automate routine file operations (e.g. handling external dependencies)
 */
import process from 'process'
import fs from 'fs-extra'
import path from 'path'
let operation = null
let filesIncluded = [] // Names of files to perform actions upon. If empty, will operate on all files in a directory
let filesExcluded = [] // Names of files to be excluded from file operations
let sourceDir = null // A source directory
let targetDir = null // A target directory
let cleanTarget = false // Whether to clean a target directory before cleaning the files
let overwriteTarget = false // Whether to overwrite files in a target directory with the ones from the source
let options = {
  sourceDir: '--s',
  targetDir: '--t',
  fileName: '--f',
  fileNameExcluded: '--fe',
  cleanTarget: '--clean',
  overwriteTarget: '--replace'
}
const operations = {
  clean: 'clean', // Clean target directory
  copy: 'copy', // Copy files to the target directory
  replace: 'replace' // Replace files to the target directory with copies from a source dir
}

const cleanFiles = (dirName, includedFiles = [], excludedFiles = []) => {
  let filesCount = 0
  let dirCount = 0
  let fsObjects = fs.readdirSync(dirName)
  for (const fsObject of fsObjects) {
    // If there is a list of included files provided then remove only those
    if (includedFiles.length > 0 && includedFiles.includes(fsObject)) { continue }
    // Skip files excluded from deletion
    if (excludedFiles.includes(fsObject)) { continue }
    const objectPath = path.join(dirName, fsObject)

    if (fs.lstatSync(objectPath).isDirectory()) {
      const results = cleanFiles(objectPath, includedFiles, excludedFiles)
      filesCount += results.filesCount
      dirCount += results.dirCount
    } else if (fs.lstatSync(objectPath).isFile()) {
      fs.unlinkSync(objectPath)
      filesCount++
    } else {
      console.error(`    Cannot remove an file system object of unknown type ${fsObject} into ${targetDir}`)
    }
  }
  fsObjects = fs.readdirSync(dirName)
  if (fsObjects.length === 0) {
    // Remove directory only if it is empty
    fs.rmdirSync(dirName)
    dirCount++
  }

  return { filesCount, dirCount }
}

const copyToDir = (sourceDir, targetDir, includedFiles = [], excludedFiles = [], overwrite = false) => {
  const { COPYFILE_EXCL } = fs.constants
  const flags = overwrite ? 0 : COPYFILE_EXCL
  let count = 0
  const fsObjects = fs.readdirSync(sourceDir)
  // Check if targetDir exists and if not, create it
  if (!fs.existsSync(targetDir)) { fs.mkdirSync(targetDir) }

  for (const fsObject of fsObjects) {
    // If there is a list of included files provided and a current file is not in it, skip it
    if (includedFiles.length > 0 && !includedFiles.includes(fsObject)) { continue }
    // Skip excluded files
    if (excludedFiles.includes(fsObject)) { continue }

    try {
      const sourcePath = path.join(sourceDir, fsObject)
      const targetPath = path.join(targetDir, fsObject)

      if (fs.lstatSync(sourcePath).isDirectory()) {
        count += copyToDir(sourcePath, targetPath, includedFiles, excludedFiles, overwrite)
      } else if (fs.lstatSync(sourcePath).isFile()) {
        fs.copyFileSync(sourcePath, targetPath, flags)
        count++
      } else {
        console.error(`    Cannot copy a file system object of unknown type ${fsObject} into ${targetDir}`)
      }
    } catch(error) {
      fs.exists(path.join(sourceDir, fsObject), exists => {
        if (!exists) {
          console.error(`    Source file ${fsObject} does not exist in ${sourceDir}`)
        } else {
          fs.exists(path.join(targetDir, fsObject), exists => {
            if (exists && !overwrite) {
              console.error(`    Cannot copy ${fsObject} because such file already exists in ${targetDir}`)
            } else {
              console.error(`    Cannot copy ${fsObject} into ${targetDir}`)
            }
          })
        }
      })

    }
  }
  return count
}

const printHelp = () => {
  console.log(`\nPlease run ${path.basename(process.argv[1])} with one of the following parameters:`)
  console.log()
  console.log(`    clean      Removes specified file(s) from a target directory and a target directory itself (if it will contain no files).`)
  console.log(`               If file names are specified then only those files will be removed.`)
  console.log(`               If some files are listed as excluded, they will not be removed.`)
  console.log(`               The following parameters are available:`)
  console.log(`               --t=tareget/dir - a name of a directory to clean`)
  console.log(`               --f=fileName - if provided, only files listed with this flag will be removed`)
  console.log(`               --fe=fileName - if provided, files listed with this flag will not be removed`)
  console.log(`               Example (remove file_one.txt and file_two.txt): ${path.basename(process.argv[1])} clean --t=target/dir --f=file_one.txt --f=file_two.txt`)
  console.log(`               Example (remove all files in a target directory): ${path.basename(process.argv[1])} clean --t=target/dir`)
  console.log()
  console.log(`    copy       Copy specified file(s) from a source directory to a target directory. If file already exist, they will not be overwritten.`)
  console.log(`               If no file names are specified, all files from a source directory will be copied to target. If files are listed as excluded, they will not be copied.`)
  console.log(`               The following parameters are available:`)
  console.log(`               --s=source/dir - a name of a directory from where files will be copied`)
  console.log(`               --t=tareget/dir - a name of a directory where files will be copied`)
  console.log(`               --f=fileName - if provided, only files listed with this flag will be copied`)
  console.log(`               --fe=fileName - if provided, files listed with this flag will not be copied`)
  console.log(`               --clean - if present, will clean a target directory before copying the files`)
  console.log(`               Example (copy file_one.txt and file_two.txt from source to target): ${path.basename(process.argv[1])} copy --s=source/dir --t=target/dir --f=file_one.txt --f=file_two.txt`)
  console.log(`               Example (copy all files from source to target): ${path.basename(process.argv[1])} copy --s=source/dir --t=target/dir`)
  console.log()
  console.log(`    replace    Same as "copy", but will overwrite specified files in a target directory`)
}

const main = () => {
  if (process.argv.length > 2) {
    operation = process.argv[2]

    if (process.argv.length > 3) {
      // Parsing arguments
      for (let i = 3; i < process.argv.length; i++) {
        let param = process.argv[i]
        if (param.startsWith(`${options.sourceDir}=`)) {
          sourceDir = param.replace(`${options.sourceDir}=`, '')
        } else if (param.startsWith(`${options.targetDir}=`)) {
          targetDir = param.replace(`${options.targetDir}=`, '')
        } else if (param.startsWith(`${options.fileNameExcluded}=`)) {
          // Excluded files parameter should go before file names because `--fe` is a subset of `--f`
          filesExcluded.push(param.replace(`${options.fileNameExcluded}=`, ''))
        } else if (param.startsWith(`${options.fileName}=`)) {
          filesIncluded.push(param.replace(`${options.fileName}=`, ''))
        } else if (param === options.cleanTarget) {
          cleanTarget = true
        } else if (param === options.overwriteTarget) {
          overwriteTarget = true
        }
      }
    }

    if (
      !operation ||
      !Array.from(Object.values(operations)).includes(operation) ||
      (operation === operations.clean && !targetDir) ||
      (operation !== operations.clean && !sourceDir && !targetDir)
    ) {
      printHelp()
    }

    let cleaned = 0
    let copied = 0
    const projectRoot = process.cwd()
    const sourcePath = sourceDir ? path.join(projectRoot, sourceDir) : ''
    const targetPath = path.join(projectRoot, targetDir)

    switch (operation) {
      case operations.clean:
        cleaned = cleanFiles(targetPath, filesIncluded, filesExcluded)
        console.log(`Removed ${cleaned.filesCount} files and ${cleaned.dirCount} directories from ${targetPath}`)
        break
      case operations.copy:
        if (cleanTarget && fs.existsSync(targetDir)) {
          cleanFiles(targetPath)
        }
        copied = copyToDir(sourcePath, targetPath, filesIncluded, filesExcluded, overwriteTarget)
        console.log(`Copied ${copied} files into ${targetPath}`)
        break
      case operations.replace:
        copied = copyToDir(sourcePath, targetPath, filesIncluded, filesExcluded, true)
        console.log(`Updated ${copied} file(s) within ${targetPath}`)
        break
    }
  } else { printHelp() }
}

main()