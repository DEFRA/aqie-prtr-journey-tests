import fs from 'fs'

export default class ReportWriter {
  static ensureDirectory(directory) {
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true })
    }
  }

  static writeTextFile(filePath, content) {
    this.ensureDirectory('./logs')

    fs.writeFileSync(filePath, content, 'utf8')

    return filePath
  }

  static writeCsvFile(filePath, rows) {
    this.ensureDirectory('./logs')

    const content = Array.isArray(rows) ? rows.join('\n') : rows

    fs.writeFileSync(filePath, content, 'utf8')

    return filePath
  }
}
