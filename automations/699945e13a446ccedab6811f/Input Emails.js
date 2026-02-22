// This step accepts a list of sample customer emails for processing. Import fs to support file-based input as an option, but expects a required environment variable CUSTOMER_EMAILS or CUSTOMER_EMAILS_FILE.
const fs = require("fs")

const emailListEnv = process.env.CUSTOMER_EMAILS
const emailFileEnv = process.env.CUSTOMER_EMAILS_FILE

let emails = []

if (emailListEnv) {
  // Split ENV input by separator (\n or |), flexible for user input
  emails = emailListEnv
    .split(/\n|\|/)
    .map(e => e.trim())
    .filter(Boolean)
  console.log(`Loaded ${emails.length} emails from CUSTOMER_EMAILS env var.`)
} else if (emailFileEnv) {
  try {
    const text = fs.readFileSync(emailFileEnv, "utf-8")
    emails = text
      .split(/\n|\|/)
      .map(e => e.trim())
      .filter(Boolean)
    console.log(`Loaded ${emails.length} emails from file: ${emailFileEnv}`)
  } catch (err) {
    console.error("Failed to read emails file:", err)
    process.exit(1)
  }
} else {
  console.error("Please provide customer emails via CUSTOMER_EMAILS or CUSTOMER_EMAILS_FILE environment variable.")
  process.exit(1)
}

if (!Array.isArray(emails) || emails.length === 0) {
  console.error("No emails found. Aborting.")
  process.exit(1)
}

setContext("emails", emails)
console.log("Customer emails stored to context.")
