const fs = require("fs")

;(async () => {
  try {
    // Retrieve structured table from context
    const table = getContext("table") || getContext("structuredResults")

    if (!Array.isArray(table) || table.length === 0) {
      console.error("Structured table is missing or empty. CSV export skipped.")
      return
    }

    // CSV header fields
    const headers = ["email", "category", "sentiment", "urgency", "priority", "summary", "processedAt", "readableTime"]
    const csvRows = [headers.join(",")]

    for (const row of table) {
      const csvRow = headers.map(h => {
        let val = row[h]
        // Escape quotes, replace line breaks
        if (typeof val === "string") {
          val = val.replace(/"/g, '""').replace(/\n/g, " ")
          // Wrap in quotes if contains comma
          if (val.includes(",")) {
            val = `"${val}"`
          }
        }
        return val !== undefined && val !== null ? val : ""
      })
      csvRows.push(csvRow.join(","))
    }

    // Filename with timestamp
    const now = new Date()
    const timestamp = now.toISOString().replace(/[-:]/g, "").replace(/T/, "_").substring(0, 15)
    const filename = `processed_emails_${timestamp}.csv`

    // Write CSV file in working directory
    fs.writeFileSync(filename, csvRows.join("\n"), "utf8")
    console.log(`✅ CSV export complete. Filename: ${filename}`)
    setContext("csvFilename", filename)
  } catch (err) {
    console.error("Error exporting table to CSV:", err)
    process.exit(1)
  }
})()
