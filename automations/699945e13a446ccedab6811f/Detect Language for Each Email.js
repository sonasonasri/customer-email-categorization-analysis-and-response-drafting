const emails = getContext("emails")
if (!Array.isArray(emails) || !emails.length) {
  console.error("No emails found in context for language detection.")
  process.exit(1)
}
console.log("Detecting language for each email...")

async function detectLanguage(email) {
  // Simple OpenAI prompt for language detection: English, Hindi, Spanish
  const prompt = `Detect if this text is English, Hindi, or Spanish. Respond only with one word.\nText: ${email}`
  try {
    const response = await TurboticOpenAI([{ role: "user", content: prompt }], {
      model: "gpt-4.1",
      temperature: 0
    })
    if (typeof response.content === "string") return response.content.trim()
    return "Unknown"
  } catch (err) {
    console.error("Language detection error:", err)
    return "Unknown"
  }
}

;(async () => {
  const languages = []
  for (let i = 0; i < emails.length; i++) {
    const lang = await detectLanguage(emails[i])
    languages.push(lang)
    console.log(`Email #${i + 1}: Detected language -> ${lang}`)
  }
  setContext("languages", languages)
  console.log("Language detection completed:", languages)
})()
