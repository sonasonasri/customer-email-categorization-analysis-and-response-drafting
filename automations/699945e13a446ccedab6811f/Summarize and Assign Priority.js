// Uses OpenAI to summarize all emails, and assigns priority score to each based on category, sentiment, urgency.

const emails = getContext("emails")
const categories = getContext("categories")
const sentiments = getContext("sentiments")
const urgency = getContext("urgency")

if (!emails || !categories || !sentiments || !urgency || emails.length === 0) {
  console.error("Missing input data for summarization/prioritization.")
  process.exit(1)
}

;(async () => {
  // Step 1: Summarize all emails collectively
  const summaryPrompt = [{ role: "user", content: `Summarize the following customer emails as a short, professional team briefing. Emails: \"\"\"${emails.join("\n---\n")}\"\"\"` }]

  const summaryResult = await TurboticOpenAI(summaryPrompt, { model: "gpt-4.1", temperature: 0, max_tokens: 256 })
  const summary = summaryResult && summaryResult.content ? summaryResult.content.trim() : ""
  setContext("summaries", [summary])
  console.log("Summary:", summary)

  // Step 2: Assign numeric priority for each email
  // Priority formula: Lower number = HIGHER priority (1 = urgent), based on rules:
  // Urgent Complaint OR (Negative + High/Urgent) = 1
  // Technical Issue + High/Urgent = 2
  // Billing + Negative = 2
  // Account Access or General Query + Low/Medium = 4/5
  // Default = 3
  const priorities = emails.map((_, idx) => {
    const cat = (categories[idx] || "").toLowerCase()
    const sent = (sentiments[idx] || "").toLowerCase()
    const urg = (urgency[idx] || "").toLowerCase()
    if (cat === "urgent complaint") return 1
    if ((cat === "technical issue" && (urg === "high" || urg === "urgent")) || (cat === "billing" && sent === "negative")) return 2
    if (cat === "account access") return 3
    if (cat === "general query" && (urg === "low" || urg === "medium")) return 4
    if (sent === "negative" && (urg === "high" || urg === "urgent")) return 1
    return 3
  })
  setContext("priority", priorities)
  console.log("Priorities:", priorities)
})()
