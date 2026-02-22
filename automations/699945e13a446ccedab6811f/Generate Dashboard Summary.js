;(async () => {
  try {
    // Retrieve the processed structured table from previous step
    const table = getContext("table")

    if (!table || !Array.isArray(table) || table.length === 0) {
      console.log("No email results available to summarize; dashboard step will exit.")
      setContext("dashboardSummary", { error: "No data available for dashboard." })
      return
    }

    // 1. Total emails processed
    const totalEmails = table.length

    // 2. Category distribution (count of emails per category)
    const categoryCounts = {}
    for (const row of table) {
      const cat = row.category || "Uncategorized"
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1
    }

    // 3. Priority breakdown (count per priority value)
    const priorityCounts = {}
    for (const row of table) {
      const prio = typeof row.priority === "undefined" || row.priority === null ? "Not assigned" : row.priority
      priorityCounts[prio] = (priorityCounts[prio] || 0) + 1
    }

    // 4. Urgent alerts (filter emails with high urgency)
    // Assume urgency can be a string ('high') or a score/label - adjust threshold if needed
    let urgentAlerts = []
    for (const row of table) {
      if (
        (typeof row.urgency === "string" && row.urgency.toLowerCase() === "high") ||
        (typeof row.urgency === "number" && row.urgency >= 8) // Adjust threshold as needed
      ) {
        urgentAlerts.push(row)
      }
    }

    // Format dashboard summary object
    const dashboardSummary = {
      totalEmails,
      categoryCounts,
      priorityCounts,
      urgentAlertCount: urgentAlerts.length,
      urgentAlerts // Full email objects for urgent cases
    }

    setContext("dashboardSummary", dashboardSummary)

    // Output readable dashboard to console
    console.log("===== EMAIL DASHBOARD SUMMARY =====")
    console.log(`Total Emails: ${totalEmails}`)

    console.log("\nCategory Distribution:")
    Object.entries(categoryCounts).forEach(([cat, count]) => {
      console.log(`- ${cat}: ${count}`)
    })

    console.log("\nPriority Breakdown:")
    Object.entries(priorityCounts).forEach(([prio, count]) => {
      console.log(`- Priority ${prio}: ${count}`)
    })

    console.log(`\nUrgent Alerts: ${urgentAlerts.length}`)
    if (urgentAlerts.length > 0) {
      urgentAlerts.forEach((alert, idx) => {
        console.log(`  [${idx + 1}] Email: ${alert.email || "(unknown)"} | Category: ${alert.category || "(none)"} | Subject: ${alert.subject || "(no subject)"}`)
      })
    }
    console.log("===================================")
  } catch (err) {
    console.error("Error in dashboard summary step:", err)
    setContext("dashboardSummary", { error: err && err.message ? err.message : String(err) })
    process.exit(1)
  }
})()
