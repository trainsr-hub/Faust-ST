import json, urllib.request
token = '8886654932:AAGY1Fd9bbfWhKTsJPmBQpT3zpj65m7FQVY'
url = f'https://api.telegram.org/bot{token}/getUpdates'
try:
    with urllib.request.urlopen(url, timeout=10) as resp:
        data = resp.read().decode()
        print(data)
except Exception as e:
    print(e)