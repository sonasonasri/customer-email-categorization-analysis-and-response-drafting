// STEP: Send Priority 1 Alerts to Slack
const axios = require("axios")

;(async () => {
  try {
    // Retrieve the structured results (processed table) from context
    const table = getContext("table") || getContext("structuredResults")
    if (!Array.isArray(table) || table.length === 0) {
      console.error("Structured results table is not available or empty. Skipping Slack alert.")
      return
    }

    // Retrieve Slack webhook URL from environment variable
    const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL
    if (!slackWebhookUrl) {
      console.error("Slack webhook URL missing. Set SLACK_WEBHOOK_URL environment variable.")
      process.exit(1)
    }

    // Filter for priority 1 emails
    const priority1Emails = table.filter(row => row.priority === 1)
    if (priority1Emails.length === 0) {
      console.log("No priority 1 emails to send. Slack alert skipped.")
      return
    }

    // Format the alert message (list each priority email, one line per email)
    let slackMsg = `*Priority 1 Customer Email Alerts: ${priority1Emails.length}*\n`
    slackMsg += "Subject | Sentiment | Urgency | Summary\n"
    slackMsg += "--- | --- | --- | ---\n"
    priority1Emails.forEach(row => {
      slackMsg += `${row.email || "N/A"} | ${row.sentiment || "N/A"} | ${row.urgency || "N/A"} | ${row.summary || "N/A"}\n`
    })

    const payload = { text: slackMsg }

    // POST to Slack Incoming Webhook
    const response = await axios.post(slackWebhookUrl, payload, {
      headers: { "Content-Type": "application/json" },
      timeout: 10000
    })

    if (response.status === 200 && response.data === "ok") {
      console.log(`✅ Slack alert sent for ${priority1Emails.length} priority 1 emails.`)
      console.log("Slack message:", slackMsg)
    } else {
      console.error("Slack webhook did not return ok:", response.status, response.data)
      process.exit(1)
    }
  } catch (err) {
    console.error("Error sending Slack alert:", err)
    process.exit(1)
  }
})()
