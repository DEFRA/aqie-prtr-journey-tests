import BasePage from './BasePage.js';

class PrtrLandingPage extends BasePage {

    // ===== Navigation =====
    async open() {
        await super.open('/');
    }

    // ===== Page Anchor =====
    get heading() {
        return $('h1=UK Pollutant Release and Transfer Register (PRTR)');
    }

    // ===== Header =====
    get serviceLink() {
        return $('a.govuk-service-navigation__link');
    }

    get skipLink() {
        return $('a.govuk-skip-link');
    }

    // ===== Main Links =====
    get searchLocationLink() {
        return $('a[href="location-search"]');
    }

    get downloadDataLink() {
        return $('a[href="download"]');
    }

    // ===== Footer =====
    get clearDataLink() {
        return $('footer a=Clear data');
    }

    // ===== Page Actions =====
    async waitForPageLoad() {
        await this.waitForVisible(this.heading);
    }

    async goToSearchByLocation() {
        await this.click(this.searchLocationLink);
    }

    async goToDownloadData() {
        await this.click(this.downloadDataLink);
    }

    async clearSessionData() {
        await this.click(this.clearDataLink);
    }

    async navigateFromHeader() {
        await this.click(this.serviceLink);
    }
}

// ✅ Singleton export (standard WDIO pattern)
export default new PrtrLandingPage();
