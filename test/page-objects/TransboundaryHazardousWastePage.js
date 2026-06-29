import BasePage from './BasePage.js'

class TransboundaryHazardousWastePage extends BasePage {
  // ===== Page Anchor =====
  get heading() {
    return $('h1')
  }

  // ===== Summary List =====
  get summaryRows() {
    return $$('.govuk-summary-list__row')
  }

  // ===== Info Sections =====
  get transboundaryInfoHeading() {
    return $('h2=What is a transboundary hazardous waste transfer?')
  }

  get hazardousWasteHeading() {
    return $('h2=What is hazardous waste?')
  }

  get disposalHeading() {
    return $('h2=What does disposal mean?')
  }

  // ===== Actions =====

  async waitForPageLoad() {
    await this.waitForVisible(this.heading)
  }

  /**
   * ✅ Header validation
   */
  async validateHeader(expectedText) {
    const actual = await this.heading.getText()

    if (!actual.toLowerCase().includes(expectedText.toLowerCase())) {
      throw new Error(
        `Header mismatch: expected '${expectedText}' but got '${actual}'`
      )
    }
  }

  /**
   * ✅ Generic key-value extractor
   */
  async getValueByKey(keyName) {
    const rows = await this.summaryRows

    for (const row of rows) {
      const key = await row.$('.govuk-summary-list__key').getText()

      if (key.trim().toLowerCase() === keyName.toLowerCase()) {
        return await row.$('.govuk-summary-list__value').getText()
      }
    }

    throw new Error(`Key '${keyName}' not found`)
  }

  /**
   * ✅ Validate key-value
   */
  async validateKeyValue(key, expectedValue) {
    const actual = await this.getValueByKey(key)

    if (!actual.includes(expectedValue)) {
      throw new Error(
        `Validation failed for '${key}'. Expected '${expectedValue}', found '${actual}'`
      )
    }
  }

  /**
   * ✅ Special handling for multi-line values (Receiver / Site)
   */
  async getMultilineValue(keyName) {
    const rawText = await this.getValueByKey(keyName)

    // split by line break and clean
    return rawText.split('\n').map((line) => line.trim())
  }

  /**
   * ✅ Validate receiver company details
   */
  async validateReceiverCompany(expectedLines) {
    const actualLines = await this.getMultilineValue('Receiver company')

    for (const line of expectedLines) {
      if (!actualLines.includes(line)) {
        throw new Error(`Receiver validation failed. Missing line: '${line}'`)
      }
    }
  }

  /**
   * ✅ Validate site details
   */
  async validateSite(expectedLines) {
    const actualLines = await this.getMultilineValue('Site')

    for (const line of expectedLines) {
      if (!actualLines.includes(line)) {
        throw new Error(`Site validation failed. Missing line: '${line}'`)
      }
    }
  }

  /**
   * ✅ Validate all info sections present
   */
  async validateInfoSections() {
    await this.waitForVisible(this.transboundaryInfoHeading)
    await this.waitForVisible(this.hazardousWasteHeading)
    await this.waitForVisible(this.disposalHeading)
  }

  /**
   * ✅ Extract all details
   */
  async getAllDetails() {
    const rows = await this.summaryRows
    const data = {}

    for (const row of rows) {
      const key = await row.$('.govuk-summary-list__key').getText()
      const value = await row.$('.govuk-summary-list__value').getText()

      data[key.trim()] = value.trim()
    }

    return data
  }
}

export default new TransboundaryHazardousWastePage()
