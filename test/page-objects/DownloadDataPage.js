import BasePage from './BasePage.js';

class DownloadDataPage extends BasePage {

    // ===== URL =====
    async open() {
        await super.open('/public/iteration-1/download');
    }
    // ===== Page Anchor =====
    get heading() {
        return $('h1=Download all data for a year');
    }

    // ===== All Download Buttons =====
    get downloadButtons() {
        return $$('a[role="button"]');
    }

    /**
     * ✅ Dynamic locator by year
     */
    downloadButtonByYear(year) {
        return $(`//a[@role='button']//span[contains(text(),'Download ${year} data')]/ancestor::a`);
    }

    // ===== Actions =====

    async waitForPageLoad() {
        await this.waitForVisible(this.heading);
    }

    /**
     * ✅ Click download for specific year
     */
    async clickDownloadByYear(year) {
        const button = this.downloadButtonByYear(year);
        await this.click(button);
    }

    /**
     * ✅ Verify year exists
     */
    async isYearAvailable(year) {
        return await this.downloadButtonByYear(year).isDisplayed();
    }

    /**
     * ✅ Get all available years (useful for validations)
     */
    async getAllAvailableYears() {
        const elements = await this.downloadButtons;
        const years = [];

        for (const el of elements) {
            const text = await el.getText();

            const match = text.match(/\d{4}/);
            if (match) {
                years.push(match[0]);
            }
        }

        return years;
    }
}

export default new DownloadDataPage();