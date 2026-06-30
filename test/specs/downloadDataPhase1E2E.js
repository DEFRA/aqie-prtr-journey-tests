import PRTRlandingPage from '../page-objects/PRTRlandingPage.js'
import DownloadDataPage from '../page-objects/DownloadDataPage.js'
import PageNotFoundPage from '../page-objects/PageNotFoundPage.js'

describe('E2E - Download PRTR Data against each year', () => {
  it('should download all data against specific year', async () => {
    // Expected years from 2024 down to 2007
    const expectedYears = [
      '2024',
      '2023',
      '2022',
      '2021',
      '2020',
      '2019',
      '2018',
      '2017',
      '2016',
      '2015',
      '2014',
      '2013',
      '2012',
      '2011',
      '2010',
      '2009',
      '2008',
      '2007'
    ]

    // Launch PRTR Landing page
    await PRTRlandingPage.open()
    await PRTRlandingPage.waitForPageLoad()
    await expect(
      PRTRlandingPage.heading.toBeDisplayed({
        message:
          'Heading text does not match expected value for PRTR landing Page'
      })
    )

    //Click on Download Data link and navigate to Download data page
    await PRTRlandingPage.goToDownloadData()
    //await PRTRlandingPage.downloadDataLink.click();

    //Download Data against chosen year. Navigate to Download Data Page and assert
    await DownloadDataPage.waitForPageLoad()
    await expect(
      DownloadDataPage.heading.toBeDisplayed({
        message:
          'Heading text does not match expected value for PRTR Download Data Page'
      })
    )

    //Get the value of all the years within variable years
    //array of strings containing available years.
    const years = await DownloadDataPage.getAllAvailableYears()

    // Display years in WDIO/spec report console output
    console.log(`Available download years are: ${years.join(', ')}`)

    // Assert total count
    expect(years.length).toBe(18)

    // Assert exact years and exact order
    expect(years).toEqual(expectedYears)

    // Assert each expected year exists
    for (const year of expectedYears) {
      expect(years).toContain(year)
      console.log(`Verified download year is available: ${year}`)
    }

    // Store current Download Data page URL before starting downloads
    const downloadPageUrl = await browser.getUrl()

    // Click download for each available year
    for (const year of years) {
      console.log(`Downloading data for year: ${year}`)

      // Ensure we are on the Download Data page before each click
      const currentUrl = await browser.getUrl()

      if (currentUrl !== downloadPageUrl) {
        await browser.url(downloadPageUrl)
      } else {
        await browser.refresh()
      }

      await DownloadDataPage.waitForPageLoad()
      await DownloadDataPage.clickDownloadByYear(year)

      //Give browser app a moment to navigate if document is missing
      await browser.pause(1000)

      // Fail test if 404 page appears
      await PageNotFoundPage.failIfDisplayed(year)
    }
  })
})
