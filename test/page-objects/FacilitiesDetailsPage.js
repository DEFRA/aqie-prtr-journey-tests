import BasePage from './BasePage.js'
import createLogger from '../helpers/logger.js'

const logger = createLogger()

class FacilityDetailsPage extends BasePage {
  // ==========================================
  // Page Elements
  // ==========================================

  get heading() {
    return $('h1')
  }

  get tables() {
    return $$('table.govuk-table')
  }

  // ==========================================
  // Page Load
  // ==========================================

  async waitForPageLoad() {
    await this.waitForVisible(this.heading)
  }

  // ==========================================
  // Facility Details
  // ==========================================

  async getFacilityName() {
    return (await this.heading.getText()).trim()
  }

  async validateFacilityName(expectedName) {
    const actualName = await this.getFacilityName()

    expect(actualName).toContain(expectedName)
  }

  // ==========================================
  // Year Navigation
  // ==========================================

  selectedYear(year) {
    return $(
      `//nav[@data-testid='year-tabs']//span[normalize-space()='${year}']`
    )
  }

  yearLink(year) {
    return $(`//nav[@data-testid='year-tabs']//a[normalize-space()='${year}']`)
  }

  async selectYear(year) {
    const selectedYear = await this.selectedYear(year)

    if (await selectedYear.isExisting()) {
      logger.info(`Year ${year} is the last reporting year for this facility`)
      return
    }

    const yearLink = await this.yearLink(year)

    if (await yearLink.isExisting()) {
      await this.click(yearLink)

      logger.info(`Year ${year} selected`)
      return
    }

    throw new Error(`Year ${year} is not listed for this facility`)
  }

  // ==========================================
  // Section Availability
  // ==========================================

  async hasAirReleases() {
    return (
      (await $$('//h3[contains(.,"Pollutant releases to air")]')).length > 0
    )
  }

  async hasWaterReleases() {
    return (
      (await $$('//h3[contains(.,"Pollutant releases to water")]')).length > 0
    )
  }

  async hasSoilReleases() {
    return (
      (await $$('//h3[contains(.,"Pollutant releases to soil")]')).length > 0
    )
  }

  async hasPollutantTransfers() {
    return (
      (await $$('//h3[contains(.,"Pollutant transfers to waste water")]'))
        .length > 0
    )
  }

  async hasWasteTransfers() {
    return (await $$('//h3[contains(.,"Waste transfers")]')).length > 0
  }

  // ==========================================
  // Helpers
  // ==========================================

  parseQuantityAndUnit(text) {
    const cleaned = text.replace(/\u00A0/g, ' ').trim()

    const match = cleaned.match(/^([\d,.]+)\s*([A-Za-z]+)$/i)

    if (!match) {
      return {
        quantity: 0,
        unit: null
      }
    }

    return {
      quantity: Number(match[1].replace(/,/g, '')),
      unit: match[2]
    }
  }

  async getTableAfterHeading(headingText) {
    const table = await $(
      `//h3[contains(normalize-space(), "${headingText}")]
       /following-sibling::table[1]`
    )

    await table.waitForDisplayed()

    return table
  }

  async getPollutantTableData(headingText) {
    const table = await this.getTableAfterHeading(headingText)

    const rows = await table.$$('tbody tr')

    const data = []

    for (const row of rows) {
      const cells = await row.$$('td')

      const pollutant = await cells[0].getText()

      const quantityText = await cells[1].getText()

      const parsed = this.parseQuantityAndUnit(quantityText)

      data.push({
        pollutant,
        quantity: parsed.quantity,
        unit: parsed.unit
      })
    }

    return data
  }

  // ==========================================
  // Air Releases
  // ==========================================

  async getAirReleases() {
    if (!(await this.hasAirReleases())) {
      return []
    }

    return this.getPollutantTableData('Pollutant releases to air')
  }

  // ==========================================
  // Water Releases
  // ==========================================

  async getWaterReleases() {
    if (!(await this.hasWaterReleases())) {
      return []
    }

    return this.getPollutantTableData('Pollutant releases to water')
  }

  // ==========================================
  // Soil Releases
  // ==========================================

  async getSoilReleases() {
    if (!(await this.hasSoilReleases())) {
      return []
    }

    return this.getPollutantTableData('Pollutant releases to soil')
  }

  // ==========================================
  // Pollutant Transfers
  // ==========================================

  async getPollutantTransfers() {
    if (!(await this.hasPollutantTransfers())) {
      return []
    }

    return this.getPollutantTableData('Pollutant transfers to waste water')
  }

  // ==========================================
  // Waste Transfers
  // ==========================================

  async getWasteTransfers() {
    if (!(await this.hasWasteTransfers())) {
      return []
    }

    const table = await $('table[data-testid="waste-table"]')

    const rows = await table.$$('tbody tr')

    const data = []

    for (const row of rows) {
      const cells = await row.$$('td')

      const quantityText = await cells[0].getText()

      const wasteType = await cells[1].getText()

      const treatment = await cells[2].getText()

      const parsed = this.parseQuantityAndUnit(quantityText)

      data.push({
        wasteType,
        treatment,
        quantity: parsed.quantity,
        unit: parsed.unit
      })
    }

    return data
  }

  // ==========================================
  // Totals & Utilities
  // ==========================================

  getTotalQuantity(records) {
    return records.reduce((total, row) => total + row.quantity, 0)
  }

  getUnit(records) {
    return records.length > 0 ? records[0].unit : null
  }

  getWasteTransferQuantity(records, wasteType, treatment) {
    const record = records.find(
      (item) => item.wasteType === wasteType && item.treatment === treatment
    )

    return record ? record.quantity : null
  }
}

export default new FacilityDetailsPage()
