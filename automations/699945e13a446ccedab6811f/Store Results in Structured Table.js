// Aggregate all analysis results into a structured array - one object per email.
const emails = getContext("emails")
const categories = getContext("categories")
const sentiments = getContext("sentiments")
const urgency = getContext("urgency")
const priorities = getContext("priority")
const summaries = getContext("summaries")

if (!emails || !categories || !sentiments || !urgency || !priorities) {
  console.error("Missing analysis data for creating structured table.")
  process.exit(1)
}

;(async () => {
  // Get current timestamp for all emails
  const now = new Date();
  const timestamp = now.toISOString();
  const readableTime = now.toLocaleString();
  
  // Create enhanced table with timestamp
  const table = emails.map((email, idx) => ({
    email,
    category: categories[idx] || "",
    sentiment: sentiments[idx] || "",
    urgency: urgency[idx] || "",
    priority: priorities[idx] || 3,
    summary: summaries?.[0] || "",
    // NEW: Add timestamp fields
    processedAt: timestamp,
    readableTime: readableTime,
    // NEW: Add escalation flag (will be updated later)
    escalated: false,
    escalationLevel: "None"
  }))

  // Store in context
  setContext("structuredResults", table)  // Use this name for consistency
  setContext("table", table)               // Keep original for backward compatibility
  
  console.log("=".repeat(50))
  console.log("📋 STRUCTURED TABLE CREATED")
  console.log("=".repeat(50))
  console.log(`✅ Total rows: ${table.length} emails`)
  console.log(`🕐 Processing time: ${readableTime}`)
  console.log(`📊 Fields: Email, Category, Sentiment, Urgency, Priority, Summary, Timestamp`)
  console.log("=".repeat(50))
  
  // Optional: Preview first row
  if (table.length > 0) {
    console.log("\n📧 Sample first email:")
    console.log(`  From: ${table[0].email?.substring(0, 50)}...`)
    console.log(`  Category: ${table[0].category}`)
    console.log(`  Priority: ${table[0].priority}`)
  }
})()