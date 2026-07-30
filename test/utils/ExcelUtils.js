import XLSX from 'xlsx'

class ExcelUtils {
  static cache = new Map()

  static readWorkbook(filePath) {
    return XLSX.readFile(filePath)
  }

  static getSheetNames(filePath) {
    const workbook = this.readWorkbook(filePath)

    return workbook.SheetNames
  }

  static getSheetData(filePath, sheetName) {
    const cacheKey = `${filePath}_${sheetName}`

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)
    }

    const workbook = this.readWorkbook(filePath)

    const worksheet = workbook.Sheets[sheetName]

    const data = XLSX.utils.sheet_to_json(worksheet, {
      defval: ''
    })

    this.cache.set(cacheKey, data)

    return data
  }

  static getColumnNames(filePath, sheetName) {
    const data = this.getSheetData(filePath, sheetName)

    return data.length ? Object.keys(data[0]) : []
  }

  static getColumnValues(filePath, sheetName, columnName) {
    const data = this.getSheetData(filePath, sheetName)

    return data.map((row) => row[columnName])
  }

  static normalize(value) {
    return String(value ?? '')
      .trim()
      .replace(/\s+/g, ' ')
      .toLowerCase()
  }

  static getRecordByFacility(filePath, sheetName, facilityName) {
    const data = this.getSheetData(filePath, sheetName)

    const target = this.normalize(facilityName)

    return data.find((row) => this.normalize(row.FacilityFinal) === target)
  }

  static findRecord(filePath, sheetName, columnName, value) {
    const data = this.getSheetData(filePath, sheetName)

    const target = this.normalize(value)

    return data.find((row) => this.normalize(row[columnName]) === target)
  }

  static filterRecords(filePath, sheetName, columnName, value) {
    const data = this.getSheetData(filePath, sheetName)

    const target = this.normalize(value)

    return data.filter((row) => this.normalize(row[columnName]) === target)
  }

  static getValue(record, columnName) {
    return record?.[columnName]
  }

  static hasColumn(filePath, sheetName, columnName) {
    return this.getColumnNames(filePath, sheetName).includes(columnName)
  }

  static buildLookupSet(filePath, sheetName, columnName) {
    const data = this.getSheetData(filePath, sheetName)

    return new Set(
      data.map((row) => this.normalize(row[columnName])).filter(Boolean)
    )
  }

  static valueExists(lookupSet, value) {
    return lookupSet.has(this.normalize(value))
  }

  static getRowCount(filePath, sheetName) {
    return this.getSheetData(filePath, sheetName).length
  }

  static clearCache() {
    this.cache.clear()
  }
}

export default ExcelUtils
