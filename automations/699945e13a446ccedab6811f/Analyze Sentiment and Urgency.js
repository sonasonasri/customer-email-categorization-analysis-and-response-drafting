// Uses OpenAI (via TurboticOpenAI) to analyze sentiment and urgency for each email.
// Sentiment: Positive, Neutral, Negative. Urgency: Low, Medium, High, Urgent.

const emails = getContext("emails")

if (!Array.isArray(emails) || emails.length === 0) {
  console.error("No emails loaded for sentiment/urgency analysis. Aborting.")
  process.exit(1)
}

;(async () => {
  const prompts = emails.map(email => ({
    role: "user",
    content: `Analyze the sentiment and urgency of the following customer email. \nReturn in the following format: Sentiment: <Positive/Neutral/Negative>, Urgency: <Low/Medium/High/Urgent>. \nEmail: \"\"\"${email}\"\"\"`
  }))

  console.log("Sending sentiment & urgency batch to OpenAI...")

  const result = await TurboticOpenAI(prompts, { model: "gpt-4.1", temperature: 0 })

  if (!result || !result.content) {
    console.error("OpenAI sentiment/urgency batch failed.")
    process.exit(1)
  }

  let sentiments = [],
    urgency = []
  if (Array.isArray(result.content)) {
    result.content.forEach(resp => {
      // Extract sentiment and urgency from response
      const match = resp.match(/Sentiment: (\w+)[,\n\r]? Urgency: (\w+)/i)
      if (match) {
        sentiments.push(match[1])
        urgency.push(match[2])
      } else {
        sentiments.push("Neutral")
        urgency.push("Medium")
      }
    })
  } else if (typeof result.content === "string") {
    // Parse multiple lines
    const lines = result.content.split(/\n|\r|;/)
    lines.forEach(line => {
      const match = line.match(/Sentiment: (\w+)[,\n\r]? Urgency: (\w+)/i)
      if (match) {
        sentiments.push(match[1])
        urgency.push(match[2])
      }
    })
    // Fallback
    if (sentiments.length === 0) {
      for (let i = 0; i < emails.length; i++) {
        sentiments.push("Neutral")
        urgency.push("Medium")
      }
    }
  }

  if (sentiments.length !== emails.length) {
    console.warn("Sentiment/urgency array count mismatch. Filling remaining values with defaults.")
    while (sentiments.length < emails.length) sentiments.push("Neutral")
    while (urgency.length < emails.length) urgency.push("Medium")
  }

  setContext("sentiments", sentiments)
  setContext("urgency", urgency)
  console.log("Sentiments:", sentiments)
  console.log("Urgency:", urgency)
})()
