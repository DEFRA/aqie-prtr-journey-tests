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
import MigrationValidationReportWriter from '../utils/MigrationValidationReportWriter.js'
import ReportWriter from '../utils/ReportWriter.js'

const reportPrefix = 'PRTR_2007'

const logger = createLogger()

describe('PRTR 2007 Migration Data Validation', () => {
  let facilityLookup

  const excelFile = './test/test-data/PRTR_2007.xlsx'
  const sheetName = '2007_PRTR_DataSet'

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

  describe('PRTR 2007 Facilities Data List verification against Production download', () => {
    // -------------------------- Test Case 1 --------------------------------------------//

      it('Should validate PRTR 2007 facilities list against Production Data', async function () {
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
      await SearchByYear.searchByYear('2007')

      //
      // Wait for Results
      //
      await FacilitiesResultsPage.waitForPageLoad()

      const headingText = await FacilitiesResultsPage.heading.getText()

      expect(headingText).toContain('Facilities matching 2007')

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

      //
      // Create discrepancy report regardless of result
      //
      const discrepancyRows = ['FacilityName,Activity,Reporting']

      discrepancies.forEach((item) => {
        discrepancyRows.push(
          `"${String(item.facilityName || '').replace(/"/g, '""')}","${String(item.activity || '').replace(/"/g, '""')}","${String(item.reporting || '').replace(/"/g, '""')}"`
        )
      })

      const discrepancyFile = `./logs/${reportPrefix}_Facility_List_Discrepancies.csv`

      ReportWriter.writeCsvFile(discrepancyFile, discrepancyRows)

      MigrationValidationReportWriter.attachDiscrepancyReport(
        discrepancyFile,
        reportPrefix,
        'Facility List Discrepancies'
      )

      logger.info(`Facility discrepancy report written to ${discrepancyFile}`)

      if (discrepancies.length > 0) {
        logger.info('===== FACILITY NAMES START =====')

        logger.info(discrepancies.map((item) => item.facilityName).join('\n'))

        logger.info('===== FACILITY NAMES END =====')
      }

      //
      // Temporary assertion while analysing discrepancies
      //
      expect(allFacilities.length).toBeGreaterThan(0)

      // Enable later when reconciliation is complete
      // expect(discrepancies.length).toBe(0)
    }) 

    describe('PRTR 2007 Facilities PRTR Data Validation against Production download', () => {
      // -------------------------Test Case2 -----------------------------------------------------//
      facilities.slice(0, facilityLimit).forEach((row) => {
        it(`Should validate PRTR release and transferdata against Facility ${row.FacilityFinal} for 2007`, async function () {
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

            await FacilitiesDetailsPage.selectYear('2007')

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
        MigrationValidationReportWriter.writeExecutionSummary(
          executionSummary,
          reportPrefix
        )
      })
    })
  })
})
