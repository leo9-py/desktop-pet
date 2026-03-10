# Pip — Desktop Pet

A floating pixel sprite that lives on your Windows desktop, watches what you're up to, and comments on it using a local LLM via [Ollama](https://ollama.com).

Pip observes your active window, tracks whether you're busy or idle, and generates short personality-driven quips — all running locally, no cloud required.

---

## Features

- Transparent, frameless, always-on-top sprite window
- Personality-driven commentary via Ollama (fully local, no API keys)
- Watches your active window title in real time
- Detects idle vs. busy state
- Tone adapts to time of day — sleepy mornings, dramatic nights
- Click Pip to prompt a reflection on what you've been up to
- Mute toggle and model selector in the system tray
- Window position saved between sessions
- Gracefully silent when Ollama is unavailable

---

## Requirements

- **Windows** (primary target)
- **[Ollama](https://ollama.com)** running locally on `localhost:11434`
- At least one compatible model pulled (see below)

### Recommended Models

| Model | Notes |
|---|---|
| `phi4-mini` | Best quality/speed tradeoff |
| `qwen2.5:1.5b` | Fast, low resource usage (default) |
| `llama3.2:1b` | Meta's 1B, good alternative |

Pull a model before starting:

```bash
ollama pull qwen2.5:1.5b
```

---

## Getting Started

### Install dependencies

```bash
npm install
```

### Run in development

```bash
npm run dev
```

### Build for Windows

```bash
npm run build:win
```

---

## Tech Stack

| Concern | Choice |
|---|---|
| App framework | Electron + electron-vite |
| UI | React 18 + TypeScript |
| LLM | Ollama REST API (`localhost:11434`) |
| Active window | PowerShell + Win32 API (`GetForegroundWindow`) |
| Idle detection | Electron `powerMonitor.getSystemIdleTime()` |
| State persistence | `electron-store` |
| Renderer state | Zustand |

---

## Project Structure

```
src/
├── main/
│   ├── index.ts              # App entry point
│   ├── petWindow.ts          # Transparent frameless window
│   ├── trayManager.ts        # System tray icon and menu
│   ├── windowTracker.ts      # Active window polling (PowerShell)
│   ├── idleDetector.ts       # Idle state detection
│   ├── commentaryEngine.ts   # Trigger logic, cooldowns, generation
│   ├── ollamaClient.ts       # Ollama REST API client
│   ├── contextBuilder.ts     # Assembles prompt context
│   ├── settingsStore.ts      # Persistent settings
│   └── ipcHandlers.ts        # IPC channel registrations
├── preload/index.ts          # Context bridge API surface
├── renderer/src/
│   ├── App.tsx
│   ├── components/
│   │   ├── PetSprite.tsx     # SVG pixel cat with animation states
│   │   ├── SpeechBubble.tsx  # Speech bubble with fade in/out
│   │   └── TypingDots.tsx    # Three-dot loading indicator
│   └── store/petStore.ts     # Zustand state
└── shared/types.ts           # Shared TypeScript interfaces
```

---

## Commentary Engine

Pip comments based on three triggers:

| Trigger | Condition |
|---|---|
| `window_change` | Active window switches (debounced 2s) |
| `timer_busy` | Every 5 minutes while you're active |
| `timer_idle` | Every 90 seconds while idle (60s+ no input) |
| `user_click` | Clicking Pip directly |

A 45-second cooldown prevents spam. After 3 consecutive Ollama errors, Pip backs off for 2 minutes. If Ollama is unreachable, Pip stays silent and retries every 60 seconds.

---

## IDE Setup

[VSCode](https://code.visualstudio.com/) with the following extensions:

- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
