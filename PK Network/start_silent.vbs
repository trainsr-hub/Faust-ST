Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName)

' 1. Start fullstack dev servers completely in the background (0 = hidden)
WshShell.Run "cmd.exe /c npm run dev", 0, False

' 2. Wait 2 seconds for server to bind ports and automatically open the browser on port 20150
WScript.Sleep 2000
WshShell.Run "http://localhost:20150"
