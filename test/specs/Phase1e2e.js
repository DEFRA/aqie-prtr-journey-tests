import locationSearchPage from '../page-objects/LocationSearchPage.js'
import locationResultsPage from '../page-objects/LocationResultsPage.js'
import facilitiesResultsPage from '../page-objects/FacilitiesResultsPage.js'
import facilityDetailsPage from '../page-objects/FacilitiesDetailsPage.js'
import additionalDetailsPage from '../page-objects/AdditionalDetailsPage.js'
import wastePage from '../page-objects/WasteTransferDetailsPage.js'
import transboundaryPage from '../page-objects/TransboundaryHazardousWastePage.js'
import notFoundPage from '../page-objects/LocationNotFoundPage.js'
import downloadPage from '../page-objects/DownloadDataPage.js'
import createLogger from '../helpers/logger.js'

const logger = createLogger()

describe('E2E - PRTR User Journey', () => {
  it('should search location and validate air pollutant details', async () => {
    // ===== Step 1: Search for location =====
    await locationSearchPage.open()

    logger.info('After search URL:', await browser.getUrl())
    // enter password
    await $('#password').setValue('release')

    // click Continue button
    await $('button[type="submit"]').click()

    await locationSearchPage.searchForLocation('New Castle')

    // ===== Step 2: Select location =====
    await locationResultsPage.waitForPageLoad()
    await locationResultsPage.selectLocation(
      'Newcastle upon Tyne, Newcastle upon Tyne'
    )

    // ===== Step 3: Select a facility =====
    await facilitiesResultsPage.waitForPageLoad()
    await facilitiesResultsPage.clickViewByFacility(
      'Brunswick Waste Reception Site'
    )

    // ===== Step 4: Select reporting year =====
    await facilityDetailsPage.waitForPageLoad()
    await facilityDetailsPage.selectYear('2024')

    // ===== Step 5: Open air pollutant details =====
    await facilityDetailsPage.clickViewDetailsByPollutant(
      'Pollutant releases to air in 2024',
      'Lead and compounds (as Pb)'
    )

    // ===== Step 6: Validate additional details =====
    await additionalDetailsPage.waitForPageLoad()

    await additionalDetailsPage.validateHeader('release to air')

    await additionalDetailsPage.validateKeyValue('Total released', '612kg')

    await additionalDetailsPage.validateKeyValue(
      'Threshold / Safe level',
      '200kg'
    )
  })
})

it('should validate non hazardous waste transfer details', async () => {
  // ===== Step 1: Search for location =====
  await locationSearchPage.open()

  // eslint-disable-next-line
  logger.info('After search URL:', await browser.getUrl()) 
  // enter password
  await $('#password').setValue('release')

  // click Continue button
  await $('button[type="submit"]').click()

  await locationSearchPage.searchForLocation('New Castle')

  // ===== Step 2: Select location =====
  await locationResultsPage.waitForPageLoad()
  await locationResultsPage.selectLocation(
    'Newcastle upon Tyne, Newcastle upon Tyne'
  )

  // ===== Step 3: Select a facility =====
  await facilitiesResultsPage.waitForPageLoad()
  await facilitiesResultsPage.clickViewByFacility(
    'Brunswick Waste Reception Site'
  )

  // ===== Step 4: Select reporting year =====
  await facilityDetailsPage.waitForPageLoad()
  await facilityDetailsPage.selectYear('2024')

  await facilityDetailsPage.clickViewDetailsByWasteType('Non hazardous waste')

  await wastePage.waitForPageLoad()

  await wastePage.validateHeader('non hazardous waste transfer')

  await wastePage.validateKeyValue('Quantity', '134,982 TONNE')
  await wastePage.validateKeyValue('Treatment', 'Recovery')

  await wastePage.validateInfoSections()
})

it('should validate transboundary hazardous waste details', async () => {
  // ===== Step 1: Search for location =====
  await locationSearchPage.open()

  logger.info('After search URL:', await browser.getUrl())
  // enter password
  // await $('#password').setValue('release');

  // click Continue button
  await $('button[type="submit"]').click()

  await locationSearchPage.searchForLocation('New Castle')

  // ===== Step 2: Select location =====
  await locationResultsPage.waitForPageLoad()
  await locationResultsPage.selectLocation(
    'Newcastle upon Tyne, Newcastle upon Tyne'
  )

  // ===== Step 3: Select a facility =====
  await facilitiesResultsPage.waitForPageLoad()
  await facilitiesResultsPage.clickViewByFacility(
    'Brunswick Waste Reception Site'
  )

  // ===== Step 4: Select reporting year =====
  await facilityDetailsPage.waitForPageLoad()
  await facilityDetailsPage.selectYear('2024')

  await facilityDetailsPage.clickViewDetailsByWasteType(
    'Transboundary hazardous waste'
  )

  await wastePage.waitForPageLoad()
  await transboundaryPage.validateHeader(
    'transboundary hazardous waste transfer'
  )

  await transboundaryPage.validateKeyValue('Quantity', '5,788 TONNE')
  await transboundaryPage.validateKeyValue('Treatment', 'Disposal')

  await transboundaryPage.validateReceiverCompany(['Portoesme s.r.l', 'Italy'])

  await transboundaryPage.validateInfoSections()
})

it('should verify download options for all years', async () => {
  // ===== Step 1: Search for location =====
  await downloadPage.open()

  logger.info('After search URL:', await browser.getUrl())
  // enter password
  await $('#password').setValue('release')

  // click Continue button
  await $('button[type="submit"]').click()

  await downloadPage.waitForPageLoad()

  // ✅ Validate specific year
  await expect(await downloadPage.isYearAvailable('2024')).toBe(true)

  // ✅ Fetch all years
  const years = await downloadPage.getAllAvailableYears()

  expect(years).toContain('2023')
  expect(years).toContain('2022')
})

describe('E2E - Invalid Search', () => {
  it('should show error for invalid location', async () => {
    await locationSearchPage.open()
    logger.info('After search URL:', await browser.getUrl())
    // enter password
    await $('#password').setValue('release')

    // click Continue button
    await $('button[type="submit"]').click()

    await locationSearchPage.searchForLocation('someplace')

    await notFoundPage.waitForPageLoad()

    // ✅ Validate dynamic error
    await notFoundPage.validateErrorMessage('someplace')

    // ✅ Validate guidance exists
    await notFoundPage.validateSuggestions()

    // ✅ Recover flow
    await notFoundPage.clickSearchAgain()
  })
})
