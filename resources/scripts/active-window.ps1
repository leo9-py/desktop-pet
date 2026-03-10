# Persistent active window server — reads "get" from stdin, writes JSON to stdout
# Spawned once by the Electron main process to avoid repeated compilation overhead

Add-Type @"
using System;
using System.Runtime.InteropServices;
using System.Text;

public class WindowUtils {
    [DllImport("user32.dll")]
    public static extern IntPtr GetForegroundWindow();

    [DllImport("user32.dll", CharSet = CharSet.Unicode)]
    public static extern int GetWindowText(IntPtr hWnd, StringBuilder text, int count);

    [DllImport("user32.dll")]
    public static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint processId);
}
"@

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::InputEncoding  = [System.Text.Encoding]::UTF8

while ($true) {
    $line = [Console]::ReadLine()
    if ($null -eq $line -or $line -eq 'exit') { break }

    if ($line -eq 'get') {
        try {
            $hwnd = [WindowUtils]::GetForegroundWindow()
            $sb = New-Object System.Text.StringBuilder 512
            [WindowUtils]::GetWindowText($hwnd, $sb, 512) | Out-Null

            $processId = [uint32]0
            [WindowUtils]::GetWindowThreadProcessId($hwnd, [ref]$processId) | Out-Null

            $proc = Get-Process -Id ([int]$processId) -ErrorAction SilentlyContinue

            $appName = ''
            $processName = ''
            if ($proc) {
                $processName = $proc.ProcessName
                try {
                    $desc = $proc.MainModule.FileVersionInfo.FileDescription
                    $appName = if ($desc) { $desc } else { $processName }
                } catch {
                    $appName = $processName
                }
            }

            $result = [PSCustomObject]@{
                title       = $sb.ToString()
                appName     = $appName
                processName = $processName
                pid         = [int]$processId
            } | ConvertTo-Json -Compress

            [Console]::WriteLine($result)
        } catch {
            [Console]::WriteLine('{"title":"","appName":"","processName":"","pid":0}')
        }
        [Console]::Out.Flush()
    }
}
