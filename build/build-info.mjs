import branch from 'git-branch'

/**
 * Returns a timestamp in YYYYMMDDCCC format.
 *
 * @param {number} datetime - A date and time that will be used to generate a timestamp.
 *        Represented by a number of milliseconds elapsed since January 1, 1970 00:00:00 UTC.
 *        If omitted, a current date and time value will be used.
 * @returns {string} - A timestamp in a string format
 */
const generateTimestamp = (datetime = Date.now()) => {
  const now = new Date(datetime)
  const year = now.getFullYear()
  const month = (now.getMonth() + 1).toString(10).padStart(2, '0')
  const day = now.getDate().toString(10).padStart(2, '0')
  // Counter is a number of two-minute intervals elapsed since midnight
  const counter = Math.round((now.getHours() * 60 + now.getMinutes()) / 2).toString(10).padStart(3, '0')
  return `${year}${month}${day}${counter}`
}

/**
 * Generates a build number string.
 *
 * @param {number} datetime - A date and time that will be used to generate a timestamp.
 *        Represented by the number of milliseconds elapsed since January 1, 1970 00:00:00 UTC.
 *        If omitted, a current date and time value will be used.
 * @returns {object} - A build number in the following format: branch-name.YYYYMMDDCCC
 */
const generateBuildInfo = (datetime = Date.now()) => {
  let branchName
  try {
    branchName = branch.sync()
  } catch (err) {
    /*
    If build is running not from a git directory, as in the case of a zipped distributable,
    no branch info will be available. It will result in `branch` throwing an error.
    In that case we'll use a placeholder specified below instead of an actual branch name.
     */
    branchName = 'headless'
  }
  if (branchName === 'master') {
    branchName = 'dev'
  }
  let branchPart = (branchName === 'production') ? '' : branchName + '.'
  const timestamp = generateTimestamp(datetime)
  return {
    branch: branchName,
    number: timestamp,
    name: `${branchPart}${timestamp}`.replace(' ','.')
  }
}

export default generateBuildInfo