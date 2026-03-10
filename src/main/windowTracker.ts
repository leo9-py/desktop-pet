import { spawn, ChildProcessWithoutNullStreams } from 'child_process'
import { join } from 'path'
import { app } from 'electron'
import type { WindowInfo } from '../shared/types'

type ChangeCallback = (info: WindowInfo) => void

let ps: ChildProcessWithoutNullStreams | null = null
let buffer = ''
let current: WindowInfo | null = null
let changeCallback: ChangeCallback | null = null
let pollTimer: ReturnType<typeof setInterval> | null = null
let ownProcessName = ''

function getScriptPath(): string {
  if (app.isPackaged) {
    return join(process.resourcesPath, 'scripts', 'active-window.ps1')
  }
  return join(app.getAppPath(), 'resources', 'scripts', 'active-window.ps1')
}

function spawnPs(): void {
  const script = getScriptPath()
  ps = spawn('powershell.exe', [
    '-NoProfile',
    '-NonInteractive',
    '-ExecutionPolicy',
    'Bypass',
    '-File',
    script
  ])

  ps.stdout.setEncoding('utf8')
  ps.stdout.on('data', (chunk: string) => {
    buffer += chunk
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed) continue
      try {
        const info: WindowInfo = JSON.parse(trimmed)
        handleNewWindow(info)
      } catch {
        // ignore malformed output
      }
    }
  })

  ps.on('exit', () => {
    ps = null
    // Restart after 2s unless app is quitting
    if (!app.isQuitting) {
      setTimeout(spawnPs, 2000)
    }
  })
}

function handleNewWindow(info: WindowInfo): void {
  // Filter out our own window and empty titles
  if (!info.title && !info.appName) return
  if (info.processName.toLowerCase() === ownProcessName.toLowerCase()) return

  const changed =
    !current ||
    current.title !== info.title ||
    current.processName !== info.processName

  current = info

  if (changed && changeCallback) {
    changeCallback(info)
  }
}

export function startWindowTracker(onChange: ChangeCallback): void {
  ownProcessName = app.getName()
  changeCallback = onChange
  spawnPs()

  // Poll every 5 seconds
  pollTimer = setInterval(() => {
    if (ps && ps.stdin.writable) {
      ps.stdin.write('get\n')
    }
  }, 5000)

  // Initial poll after ps starts (give it 1s to compile the C# type)
  setTimeout(() => {
    if (ps && ps.stdin.writable) {
      ps.stdin.write('get\n')
    }
  }, 1200)
}

export function stopWindowTracker(): void {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
  if (ps) {
    try { ps.stdin.write('exit\n') } catch { /* ignore */ }
    ps.kill()
    ps = null
  }
}

export function getCurrentWindow(): WindowInfo | null {
  return current
}
