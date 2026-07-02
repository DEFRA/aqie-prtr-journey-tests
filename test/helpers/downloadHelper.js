import fs from 'fs'
import path from 'path'

export const downloadDir = path.join(process.cwd(), 'downloads')

export function ensureDownloadDirectoryExists() {
  if (!fs.existsSync(downloadDir)) {
    fs.mkdirSync(downloadDir, { recursive: true })
  }
}

export function getDownloadedXmlCount() {
  ensureDownloadDirectoryExists()

  return fs.readdirSync(downloadDir).filter((file) => file.endsWith('.xml'))
    .length
}

export function hasTemporaryDownloadFile() {
  ensureDownloadDirectoryExists()

  return fs
    .readdirSync(downloadDir)
    .some(
      (file) =>
        file.endsWith('.crdownload') ||
        file.endsWith('.part') ||
        file.endsWith('.tmp')
    )
}

export async function waitForDownloadComplete(
  previousXmlCount,
  timeout = 10000
) {
  await browser.waitUntil(
    async () => {
      const currentXmlCount = getDownloadedXmlCount()
      const temporaryFileExists = hasTemporaryDownloadFile()

      return currentXmlCount > previousXmlCount && !temporaryFileExists
    },
    {
      timeout,
      interval: 500,
      timeoutMsg: `XML download did not complete within ${timeout}ms`
    }
  )
}
