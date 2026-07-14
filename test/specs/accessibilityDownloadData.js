import PRTRlandingPage from '../page-objects/PRTRlandingPage.js'
import DownloadDataPage from '../page-objects/DownloadDataPage.js'
import createLogger from '../helpers/logger.js'

import {
  initialiseAccessibilityChecking,
  analyseAccessibility,
  generateAccessibilityReports,
  generateAccessibilityReportIndex
} from '../accessibility-checking.js'

/* import {
  getDownloadedXmlCount,
  waitForDownloadComplete
} from '../helpers/downloadHelper.js' */

const logger = createLogger()

describe('Accessibility E2E - Download PRTR Data against each year', () => {
  before(async () => {
    await initialiseAccessibilityChecking()
  })

  it('Verify Accessibility against the PRTR Landing page ', async () => {
    logger.info('-------------Download PRTR Reports Journey Started--------')

    // Launch PRTR Landing page
    await PRTRlandingPage.open()
    await PRTRlandingPage.waitForPageLoad()
    await expect(
      PRTRlandingPage.heading.toBeDisplayed({
        message:
          'Heading text does not match expected value for PRTR landing Page'
      })
    )

    logger.info(
      'PRTR Landing page has been launched: ' +
        DownloadDataPage.heading.getText()
    )

    await analyseAccessibility('PRTR landing Page')
  })

  it('Verify Accessibility against the PRTR Download Data page ', async () => {
    await PRTRlandingPage.open()
    await PRTRlandingPage.waitForPageLoad()

    // Click on Download Data link and navigate to Download data page
    await PRTRlandingPage.goToDownloadData()

    // Download Data against chosen year. Navigate to Download Data Page and assert
    await DownloadDataPage.waitForPageLoad()
    await expect(
      DownloadDataPage.heading.toBeDisplayed({
        message:
          'Heading text does not match expected value for PRTR Download Data Page'
      })
    )

    logger.info(
      'PRTR Download Data page has been launched: ' +
        DownloadDataPage.heading.getText()
    )

    await analyseAccessibility('PRTR Download Data Page')
  })

  after(async () => {
    await generateAccessibilityReports('accessibility-tests')
    generateAccessibilityReportIndex()
  })
})
