import BasePage from './BasePage.js';

class FacilityDetailsPage extends BasePage {

    // ===== Page Anchor =====
    get heading() {
        return $('h1');
    }

    // ===== Year Navigation =====
    get yearLinks() {
        return $$('.moj-sub-navigation__link');
    }

    yearLink(year) {
        return $(`.moj-sub-navigation__link=${year}`);
    }

    // ===== Tables =====
    get tables() {
        return $$('table.govuk-table');
    }

    tableByCaption(captionText) {
        return $(`table.govuk-table caption=${captionText}`);
    }

    // ===== Actions =====

    async waitForPageLoad() {
        await this.waitForVisible(this.heading);
    }

    /**
     * ✅ Validate facility name (VERY IMPORTANT)
     */
    async validateFacilityName(expectedName) {
        const text = await this.heading.getText();

        if (!text.includes(expectedName)) {
            throw new Error(
                `Expected facility '${expectedName}' but found '${text}'`
            );
        }
    }

    /**
     * ✅ Select year dynamically
     */
    async selectYear(year) {
        const yearElement = this.yearLink(year);
        await this.click(yearElement);
    }

    /**
     * ✅ Get table by caption text
     */
   async getTableByCaption(captionText) {
    // wait until at least one table is present
    await browser.waitUntil(async () => (await this.tables).length > 0, {
        timeout: 10000,
        timeoutMsg: 'No tables found on page'
    });

    const tables = await this.tables;

    for (const table of tables) {
        const captionEl = await table.$('caption');

        if (await captionEl.isExisting()) {
            const caption = (await captionEl.getText()).trim().toLowerCase();

            if (caption.includes(captionText.toLowerCase())) {
                return table;
            }
        }
    }

    // ✅ Debug output
    console.log('--- Available captions ---');
    const allCaptions = await $$('caption');
    for (const cap of allCaptions) {
        console.log(await cap.getText());
    }

    throw new Error(`Table with caption '${captionText}' not found`);
  }

    /**
     * ✅ Click "View details" inside table row (pollutant-based)
     */
    async clickViewDetailsByPollutant(captionText, pollutantName) {
    const table = await this.getTableByCaption(captionText);

    const rows = await table.$$('tbody tr');

    for (const row of rows) {
        const pollutantCell = await row.$('td:first-child');

        if (!(await pollutantCell.isExisting())) continue;

        const text = (await pollutantCell.getText()).trim().toLowerCase();

        if (text.includes(pollutantName.toLowerCase())) {
            const viewLink = await row.$('td:last-child a');

            await viewLink.waitForClickable({ timeout: 5000 });
            await viewLink.click();
            return;
        }
    }

    throw new Error(
        `Pollutant '${pollutantName}' not found in table '${captionText}'`
    );
   }

    /**
     * ✅ Click "View details" for Waste Transfers table
     */
    async clickViewDetailsByWasteType(wasteType) {
        const table = await this.getTableByCaption('Waste transfers');
        const rows = await table.$$('tbody tr');

        for (const row of rows) {
            const wasteCell = await row.$('td:nth-child(2)');
            const text = await wasteCell.getText();

            if (text.includes(wasteType)) {
                const viewLink = await row.$('td:last-child a');
                await this.click(viewLink);
                return;
            }
        }

        throw new Error(`Waste type '${wasteType}' not found`);
    }

    /**
     * ✅ Download data button
     */
    get downloadButton() {
        return $('a[role="button"]');
    }

    async downloadData() {
        await this.click(this.downloadButton);
    }
}

export default new FacilityDetailsPage();