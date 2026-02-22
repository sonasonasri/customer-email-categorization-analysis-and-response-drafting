// Uses OpenAI (via TurboticOpenAI) to classify each customer email into defined categories.
// Categories: Billing, Technical Issue, Account Access, General Query, Urgent Complaint.

const emails = getContext("emails")

if (!Array.isArray(emails) || emails.length === 0) {
  console.error("No emails loaded. Aborting classification.")
  process.exit(1)
}

;(async () => {
  const categories = []
  const prompts = emails.map(email => ({
    role: "user",
    content: `Classify the following email into one of: Billing, Technical Issue, Account Access, General Query, Urgent Complaint. \nEmail: \"\"\"${email}\"\"\" \nReturn only the category as answer.`
  }))

  console.log("Sending email classification batch to OpenAI...")

  // Group into a single batch request, if token limits permit
  const result = await TurboticOpenAI(prompts, { model: "gpt-4.1", temperature: 0 })

  if (!result || !result.content) {
    console.error("OpenAI classification failed. No result content.")
    process.exit(1)
  }

  // result.content may be string or array; parse as array of categories
  let categoryArr
  if (Array.isArray(result.content)) {
    categoryArr = result.content
  } else if (typeof result.content === "string") {
    // Try to split into lines/categories
    categoryArr = result.content
      .split(/\n|\r|,/)
      .map(c => c.trim())
      .filter(Boolean)
  } else {
    categoryArr = []
  }

  if (categoryArr.length !== emails.length) {
    console.warn("Mismatch between email count and classified count. Filling missing values with 'General Query'.")
    while (categoryArr.length < emails.length) categoryArr.push("General Query")
  }

  setContext("categories", categoryArr)
  console.log("Categories assigned:", categoryArr)
})()
