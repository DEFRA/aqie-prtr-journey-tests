import fs from 'fs'
import allureReporter from '@wdio/allure-reporter'
import createLogger from '../helpers/logger.js'

const logger = createLogger()

export default class AllureUtils {
  static attachFile(filePath, attachmentName, mimeType) {
    try {
      if (!fs.existsSync(filePath)) {
        logger.warn(`Unable to attach file. File not found: ${filePath}`)
        return
      }

      allureReporter.addAttachment(
        attachmentName,
        fs.readFileSync(filePath),
        mimeType
      )

      logger.info(`Attached to Allure: ${attachmentName}`)
    } catch (error) {
      logger.error(
        `Failed to attach ${attachmentName} to Allure: ${error.message}`
      )
    }
  }

  static attachFiles(files) {
    files.forEach((file) => {
      this.attachFile(file.path, file.name, file.type)
    })
  }
}
