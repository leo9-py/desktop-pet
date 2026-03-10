const OLLAMA_BASE = 'http://127.0.0.1:11434'
const TIMEOUT_MS = 15_000

async function fetchWithTimeout(url: string, init: RequestInit): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    return await fetch(url, { ...init, signal: controller.signal })
  } finally {
    clearTimeout(timer)
  }
}

export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetchWithTimeout(`${OLLAMA_BASE}/api/tags`, { method: 'GET' })
    return res.ok
  } catch {
    return false
  }
}

export async function listModels(): Promise<string[]> {
  try {
    const res = await fetchWithTimeout(`${OLLAMA_BASE}/api/tags`, { method: 'GET' })
    if (!res.ok) return []
    const data = (await res.json()) as { models: { name: string }[] }
    return data.models.map((m) => m.name)
  } catch {
    return []
  }
}

export async function generate(model: string, prompt: string): Promise<string> {
  const body = JSON.stringify({
    model,
    prompt,
    stream: false,
    options: {
      temperature: 0.85,
      num_predict: 60
    },
    system: `You are Pip, a tiny magical pixel sprite who lives on the user's desktop.
You have a cheerful, curious, occasionally snarky personality.
Speak in short punchy bursts — 1-2 sentences, never more than 25 words.
Do NOT ask questions back. Make observations, quips, or encouraging remarks.
Tone shifts by time: morning=warm/sleepy, afternoon=energetic, evening=reflective, night=reflective and sleepy.
No markdown. Just plain casual text.`
  })

  const res = await fetchWithTimeout(`${OLLAMA_BASE}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body
  })

  if (!res.ok) {
    throw new Error(`Ollama HTTP ${res.status}`)
  }

  const data = (await res.json()) as { response: string }
  return data.response.trim()
}
