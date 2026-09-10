from faust_plugins import speak, notify, send_telegram

# Vocalize with Faust acoustic core & auto-append to daily markdown transcript
speak("All systems nominal, Manager.")

# Dispatch direct HTML notification to the Manager's Telegram C2 link
notify("⚡ <b>Faust Alert:</b> Strategic directives synchronized.")
