// Uses OpenAI to generate an auto-response draft for each email based on its analysis.
const emails = getContext("emails")
const categories = getContext("categories")
const sentiments = getContext("sentiments")
const urgency = getContext("urgency")

if (!emails || !categories || !sentiments || !urgency) {
  console.error("Missing context for response drafting.")
  process.exit(1)
}

;(async () => {
  const prompts = emails.map((email, idx) => ({
    role: "user",
    content: `A customer service AI must reply to the following email. \nCategory: ${categories[idx]}\n Sentiment: ${sentiments[idx]}\n Urgency: ${urgency[idx]}\nEmail: \"\"\"${email}\"\"\"\nReply as a polite, professional support agent. If urgent/complaint, apologize and escalate. For billing, clarify. Always thank the customer. Keep it short.`
  }))

  console.log("Requesting draft responses from OpenAI...")
  const result = await TurboticOpenAI(prompts, { model: "gpt-4.1", temperature: 0 })

  let drafts = []
  if (Array.isArray(result.content)) {
    drafts = result.content
  } else if (typeof result.content === "string") {
    drafts = result.content
      .split(/\n---\n|\n\n|\r/)
      .map(d => d.trim())
      .filter(Boolean)
  }
  if (drafts.length !== emails.length) {
    while (drafts.length < emails.length) drafts.push("Thank you for contacting us. We appreciate your message and will get back to you shortly.")
  }
  setContext("drafts", drafts)
  console.log("Drafts generated", drafts)
})()
