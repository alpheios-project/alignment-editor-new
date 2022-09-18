import fs from 'fs-extra'
import path from 'path'
import archiver from 'archiver'
let sourceDir
let targetDir
let fileName

let options = {
  sourceDir: '--s',
  targetDir: '--t',
  fileName: '--f',
}

const main = () => {
  if (process.argv.length > 4) {
    // Parsing arguments
    for (let i = 2; i < process.argv.length; i++) {
      let param = process.argv[i]
      if (param.startsWith(`${options.sourceDir}=`)) {
        sourceDir = param.replace(`${options.sourceDir}=`, '')
      } else if (param.startsWith(`${options.targetDir}=`)) {
        targetDir = param.replace(`${options.targetDir}=`, '')
      } else if (param.startsWith(`${options.fileName}=`)) {
        fileName = param.replace(`${options.fileName}=`, '')
      }
    }

    const projectRoot = process.cwd()
    const sourcePath = path.join(projectRoot, sourceDir)
    const targetPath = path.join(projectRoot, targetDir)
    if (!fs.existsSync(targetPath)) { fs.mkdirSync(targetPath) }

    createArchive(sourcePath, fileName, targetPath)
      .then(() => {
        console.log(`${fileName} archive was created successfully`)
      }).catch(error => {
        console.error(`Unable to create ${fileName}:`, error)
    })
  } else { printHelp() }
}

const createArchive = (sourceDir, fileName, targetDir) => {
  return new Promise((resolve, reject) => {
    let output = fs.createWriteStream(path.join(targetDir, fileName));
    let zipArchive = archiver('zip', {
      zlib: { level: 9 } // Sets the compression level.
    })

    output.on('close', function() {
      resolve()
    })

    zipArchive.pipe(output)
    zipArchive.directory(sourceDir, false)
    zipArchive.finalize()
  })
}

const printHelp = () => {
  console.log(`\nPlease run ${path.basename(process.argv[1])} with one of the following parameters: --s=sourceDir --f=zipArchiveFileName --t=targetDir`)
}

main()


