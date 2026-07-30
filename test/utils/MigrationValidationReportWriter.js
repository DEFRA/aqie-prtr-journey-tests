import createLogger from '../helpers/logger.js'
import ReportWriter from './ReportWriter.js'
import AllureUtils from './AllureUtils.js'

const logger = createLogger()

export default class MigrationValidationReportWriter {
  static writeExecutionSummary(executionSummary, reportPrefix) {
    try {
      const totalWarnings = executionSummary.warnings.reduce(
        (count, item) => count + item.warnings.length,
        0
      )

      const summaryReport = `
PRTR VALIDATION EXECUTION SUMMARY

Facilities Processed : ${executionSummary.processed}
Facilities Passed    : ${executionSummary.passed.length}
Facilities Failed    : ${executionSummary.failed.length}
Facilities With Warnings : ${executionSummary.warnings.length}
Total Warning Count : ${totalWarnings}
`

      const summaryFile = `./logs/${reportPrefix}_Summary.txt`

      const failuresFile = `./logs/${reportPrefix}_Failures.csv`

      const warningsFile = `./logs/${reportPrefix}_Warnings.csv`

      ReportWriter.writeTextFile(summaryFile, summaryReport)

      const failureRows = ['Facility,Issue']

      executionSummary.failed.forEach((item) => {
        failureRows.push(
          `"${String(item.facility).replace(/"/g, '""')}","${String(item.error).replace(/"/g, '""')}"`
        )
      })

      ReportWriter.writeCsvFile(failuresFile, failureRows)

      const warningRows = ['Facility,Warning']

      executionSummary.warnings.forEach((item) => {
        item.warnings.forEach((warning) => {
          warningRows.push(
            `"${String(item.facility).replace(/"/g, '""')}","${String(warning).replace(/"/g, '""')}"`
          )
        })
      })

      ReportWriter.writeCsvFile(warningsFile, warningRows)

      AllureUtils.attachFiles([
        {
          path: summaryFile,
          name: `${reportPrefix} Summary`,
          type: 'text/plain'
        },
        {
          path: failuresFile,
          name: `${reportPrefix} Failures`,
          type: 'text/csv'
        },
        {
          path: warningsFile,
          name: `${reportPrefix} Warnings`,
          type: 'text/csv'
        }
      ])

      logger.info(`${reportPrefix} validation reports created`)
    } catch (error) {
      logger.error(`Unable to create validation reports: ${error.message}`)
    }
  }

  static attachDiscrepancyReport(csvPath, reportPrefix, reportName) {
    AllureUtils.attachFile(csvPath, `${reportPrefix} ${reportName}`, 'text/csv')
  }
}
