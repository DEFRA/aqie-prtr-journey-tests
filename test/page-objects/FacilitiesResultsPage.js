import BasePage from './BasePage.js'

class FacilitiesResultsPage extends BasePage {
  // ===== Page Anchors =====

  get heading() {
    return $('[data-testid="app-heading-title"]')
  }

  get facilitiesSummary() {
    return $('[data-testid="facilities-summary"]')
  }

  // ===== Table Elements =====

  get facilitiesTable() {
    return $('[data-testid="facilities-table"]')
  }

  get tableRows() {
    return $$('[data-testid="facilities-table"] tbody tr')
  }

  // ===== Pagination =====

  get nextLink() {
    return $('a[rel="next"]')
  }

  // ===== Actions =====

  async waitForPageLoad() {
    await this.facilitiesTable.waitForDisplayed({
      timeout: 10000,
      timeoutMsg: 'Facilities results page failed to load'
    })
  }

  /**
   * Get total records from:
   * Showing 21 to 30 of 6825 records
   */
  async getTotalRecords() {
    const text = await this.facilitiesSummary.getText()

    const match = text.match(/of\s+(\d+)\s+records/i)

    return match ? Number(match[1]) : 0
  }

  /**
   * Get all facility data on current page
   */
  async getCurrentPageFacilities() {
    const rows = await this.tableRows

    const facilities = []

    for (const row of rows) {
      const cells = await row.$$('td')

      facilities.push({
        facilityName: (await cells[0].getText()).trim(),
        activity: (await cells[1].getText()).trim(),
        mostRecentReporting: (await cells[2].getText()).trim()
      })
    }

    return facilities
  }

  /**
   * Determine if reporting contains valid PRTR 2024 data
   */
  has2024Reporting(reportingText) {
    const validReportingTypes = [
      'Pollutant transfers (2024)',
      'Pollutant releases (2024)',
      'Waste transfers (2024)'
    ]

    return validReportingTypes.some((type) => reportingText.includes(type))
  }

  /**
   * Check whether next page exists
   */
  async hasNextPage() {
    return await this.nextLink.isExisting()
  }

  /**
   * Navigate to next page
   */
  async clickNextPage() {
    await this.nextLink.waitForClickable({
      timeout: 10000
    })

    await this.nextLink.click()

    await browser.waitUntil(
      async () => await this.facilitiesTable.isDisplayed(),
      {
        timeout: 10000,
        timeoutMsg: 'Facilities table did not refresh after clicking Next'
      }
    )
  }

  /**
   * Get row by facility name (PRIMARY KEY approach)
   */
  async findRowByFacility(facilityName) {
    const rows = await this.tableRows

    for (const row of rows) {
      const firstCell = await row.$('td:first-child')
      const text = await firstCell.getText()

      if (text.includes(facilityName)) {
        return row
      }
    }

    throw new Error(`Facility '${facilityName}' not found`)
  }

  /**
   * Click "View" for a given facility
   */
  async clickViewByFacility(facilityName) {
    const row = await this.findRowByFacility(facilityName)

    const viewLink = await row.$('td:last-child a')

    await this.click(viewLink)
  }

  /**
   * Advanced: match using facility + activity
   */
  async clickViewByFacilityAndActivity(facilityName, activityName) {
    const rows = await this.tableRows

    for (const row of rows) {
      const facilityCell = await row.$('td:first-child')
      const activityCell = await row.$('td:nth-child(2)')

      const facilityText = await facilityCell.getText()
      const activityText = await activityCell.getText()

      if (
        facilityText.includes(facilityName) &&
        activityText.includes(activityName)
      ) {
        const viewLink = await row.$('td:last-child a')

        await this.click(viewLink)

        return
      }
    }

    throw new Error(
      `Row not found for Facility='${facilityName}', Activity='${activityName}'`
    )
  }

  /**
   * Extract all facility names
   */
  async getAllFacilities() {
    const rows = await this.tableRows

    const facilities = []

    for (const row of rows) {
      const text = await row.$('td:first-child').getText()

      facilities.push(text.split('\n')[0].trim())
    }

    return facilities
  }

  /**
   * Get all facility rows from current page
   */
  async getFacilitiesOnCurrentPage() {
    const rows = await this.tableRows

    const facilities = []

    for (const row of rows) {
      const cells = await row.$$('td')

      if (cells.length > 0) {
        facilities.push({
          facilityName: (await cells[0].getText()).trim(),
          activity: cells.length > 1 ? (await cells[1].getText()).trim() : '',
          reporting: cells.length > 2 ? (await cells[2].getText()).trim() : ''
        })
      }
    }

    return facilities
  }
}

export default new FacilitiesResultsPage()
