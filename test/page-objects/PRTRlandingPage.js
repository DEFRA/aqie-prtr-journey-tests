import BasePage from './BasePage.js'

class PrtrLandingPage extends BasePage {
  // ===== Navigation =====
  async open() {
    await super.open('')
  }

  // ===== Page Anchor =====
  get heading() {
    return $('h1=Search industrial pollutant emissions')
  }

  // ===== Header =====
  get serviceLink() {
    return $('a.govuk-service-navigation__link')
  }

  get skipLink() {
    return $('a.govuk-skip-link')
  }

  // ===== Main Links =====

  get searchFacilityLink() {
    return $('a[href="/search-facility"]')
  }

  get downloadDataLink() {
    return $('a[href="/download-all-data-for-a-year/en"]')
  }

  // ===== Footer =====
  get clearDataLink() {
    return $('footer a=Clear data')
  }

  // ===== Page Actions =====
  async waitForPageLoad() {
    await this.waitForVisible(this.heading)
  }

  async clickSearchFacility() {
    await this.searchFacilityLink.waitForClickable({
      timeout: 10000
    })
    await this.searchFacilityLink.click()
  }

  async goToSearchByLocation() {
    await this.click(this.searchLocationLink)
  }

  async goToDownloadData() {
    await this.click(this.downloadDataLink)
  }

  async clearSessionData() {
    await this.click(this.clearDataLink)
  }

  async navigateFromHeader() {
    await this.click(this.serviceLink)
  }
}

// ✅ Singleton export (standard WDIO pattern)
export default new PrtrLandingPage()
