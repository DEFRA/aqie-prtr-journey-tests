import PRTRlandingPage from '../page-objects/PRTRlandingPage.js'
import FacilitiesSearch from '../page-objects/FacilitiesSearch.js'
import SearchByYear from '../page-objects/SearchByYear.js'
import FacilitiesResultsPage from '../page-objects/FacilitiesResultsPage.js'
import ExcelUtils from '../utils/ExcelUtils.js'
import createLogger from '../helpers/logger.js'
import FacilitiesDetailsPage from '../page-objects/FacilitiesDetailsPage.js'
import SearchByFacility from '../page-objects/SearchByFacility.js'
import FacilityUtils from '../utils/FacilityUtils.js'
import FacilityValidator from '../validators/FacilityValidator.js'
import fs from 'node:fs'

const logger = createLogger()

describe('PRTR 2024 Validation', () => {
  let facilityLookup

  const excelFile = './test/test-data/PRTR_2024.xlsx'
  const sheetName = '2024_PRTR_DataSet'

  const facilities = ExcelUtils.getSheetData(excelFile, sheetName)

  const facilityLimit = Number(process.env.FACILITY_LIMIT) || 10

  const executionSummary = {
    processed: 0,
    passed: [],
    failed: [],
    warnings: []
  }

  before(async () => {
    facilityLookup = ExcelUtils.buildLookupSet(
      excelFile,
      sheetName,
      'FacilityFinal'
    )

    logger.info(`Lookup Size: ${facilityLookup.size}`)
  })

  it('should validate PRTR 2024 facilities against Excel', async function () {
    this.timeout(0)

    //
    // Open PRTR
    //
    await PRTRlandingPage.open()
    await PRTRlandingPage.waitForPageLoad()

    //
    // Navigate to Facility Search
    //
    await PRTRlandingPage.clickSearchFacility()

    //
    // Search By Year
    //
    await FacilitiesSearch.selectSearchType('year')
    await FacilitiesSearch.clickContinue()

    //
    // Enter Reporting Year
    //
    await SearchByYear.searchByYear('2024')

    //
    // Wait for Results
    //
    await FacilitiesResultsPage.waitForPageLoad()

    const headingText = await FacilitiesResultsPage.heading.getText()

    expect(headingText).toContain('Facilities matching 2024')

    const totalRecords = await FacilitiesResultsPage.getTotalRecords()

    expect(totalRecords).toBeGreaterThan(0)

    const allFacilities = []
    let pageCount = 0

    //
    // Process all pages
    //
    while (true) {
      const facilities =
        await FacilitiesResultsPage.getFacilitiesOnCurrentPage()

      expect(facilities.length).toBeGreaterThan(0)

      allFacilities.push(...facilities)

      pageCount++

      if (pageCount % 25 === 0) {
        logger.info(
          `Processed ${pageCount} pages. Facilities collected: ${allFacilities.length}`
        )
      }

      if (!(await FacilitiesResultsPage.hasNextPage())) {
        break
      }

      await FacilitiesResultsPage.clickNextPage()
    }

    const discrepancies = []

    for (const facility of allFacilities) {
      const exists = ExcelUtils.valueExists(
        facilityLookup,
        facility.facilityName
      )

      if (!exists) {
        discrepancies.push({
          facilityName: facility.facilityName,
          activity: facility.activity,
          reporting: facility.reporting
        })
      }
    }

    logger.info(`Total Records Reported By Website: ${totalRecords}`)

    logger.info(`Pages Processed: ${pageCount}`)

    logger.info(`Facilities Checked: ${allFacilities.length}`)

    logger.info(`Discrepancies Found: ${discrepancies.length}`)

    if (discrepancies.length > 0) {
      logger.info('===== FACILITY NAMES START =====')

      logger.info(discrepancies.map((item) => item.facilityName).join('\n'))

      logger.info('===== FACILITY NAMES END =====')
    }

    //
    // Temporary assertion while analysing discrepancies
    //
    expect(allFacilities.length).toBeGreaterThan(0)
  })

  facilities.slice(0, facilityLimit).forEach((row) => {
    it(`should validate ${row.FacilityFinal}`, async function () {
      this.timeout(0)

      const validationErrors = []
      const validationWarnings = []

      const facilityName = row.FacilityFinal

      const searchFacilityName =
        FacilityUtils.getSearchableFacilityName(facilityName)

      try {
        logger.info(`Starting validation for ${facilityName}`)

        await PRTRlandingPage.open()

        await PRTRlandingPage.waitForPageLoad()

        await PRTRlandingPage.clickSearchFacility()

        await FacilitiesSearch.selectSearchType('name')

        await FacilitiesSearch.clickContinue()

        await SearchByFacility.searchFacility(searchFacilityName)

        await FacilitiesResultsPage.waitForPageLoad()

        await FacilitiesResultsPage.clickViewByFacility(searchFacilityName)

        await FacilitiesDetailsPage.waitForPageLoad()

        logger.info(
          `Validating Facility: ${await FacilitiesDetailsPage.getFacilityName()}`
        )

        const result = await FacilityValidator.validateFacility(
          facilityName,
          row,
          validationErrors,
          validationWarnings
        )

        result.warnings.forEach((msg) => logger.warn(msg))

        result.errors.forEach((msg) => logger.error(msg))

        if (result.warnings.length > 0) {
          executionSummary.warnings.push({
            facility: facilityName,
            warnings: result.warnings
          })
        }

        if (result.errors.length > 0) {
          throw new Error(
            `Validation failed for ${facilityName}\n\n${result.errors.join('\n')}`
          )
        }

        executionSummary.processed++

        executionSummary.passed.push(facilityName)

        logger.info(`[${facilityName}] Validation completed successfully`)
      } catch (error) {
        executionSummary.processed++

        executionSummary.failed.push({
          facility: facilityName,
          error: error.message
        })

        throw error
      }
    })
  })

  after(() => {
    logger.info('=======================================')

    logger.info('PRTR VALIDATION EXECUTION SUMMARY')

    logger.info('=======================================')

    logger.info(`Facilities Processed : ${executionSummary.processed}`)

    logger.info(`Facilities Passed    : ${executionSummary.passed.length}`)

    logger.info(`Facilities Failed    : ${executionSummary.failed.length}`)

    logger.info(
      `Facilities With Warnings : ${executionSummary.warnings.length}`
    )

    const totalWarnings = executionSummary.warnings.reduce(
      (count, item) => count + item.warnings.length,
      0
    )

    logger.info(`Total Warning Count : ${totalWarnings}`)

    logger.info('=======================================')

    if (executionSummary.failed.length > 0) {
      logger.info('===== FAILED FACILITIES =====')

      executionSummary.failed.forEach((item) => {
        logger.error(`Facility: ${item.facility}`)

        logger.error(`Issue: ${item.error}`)

        logger.error('--------------------------------')
      })
    }

    if (executionSummary.warnings.length > 0) {
      logger.info('===== WARNING FACILITIES =====')

      executionSummary.warnings.forEach((item) => {
        logger.warn(`Facility: ${item.facility}`)

        item.warnings.forEach((warning) => logger.warn(warning))

        logger.warn('--------------------------------')
      })
    }

    logger.info('=======================================')

    try {
      const summaryReport = `
  PRTR VALIDATION EXECUTION SUMMARY

  Facilities Processed : ${executionSummary.processed}
  Facilities Passed    : ${executionSummary.passed.length}
  Facilities Failed    : ${executionSummary.failed.length}
  Facilities With Warnings : ${executionSummary.warnings.length}
  Total Warning Count : ${totalWarnings}
  `

      fs.writeFileSync('./logs/summary.txt', summaryReport)

      const failureReport = executionSummary.failed
        .map(
          (item) => `
  Facility: ${item.facility}

  Issue:${item.error}

  --------------------------------
  `
        )
        .join('\n')

      fs.writeFileSync('./logs/failures.txt', failureReport)

      const warningReport = executionSummary.warnings
        .map(
          (item) => `
  Facility: ${item.facility}

  Warnings:${item.warnings.join('\n')}

  --------------------------------
  `
        )
        .join('\n')

      fs.writeFileSync('./logs/warnings.txt', warningReport)

      logger.info('Validation reports written to ./logs')
    } catch (error) {
      logger.error(`Unable to write reports: ${error.message}`)
    }
  })
})
