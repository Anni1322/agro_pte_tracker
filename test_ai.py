import urllib.request
import json
import http.cookiejar
cj = http.cookiejar.CookieJar()
opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))

# 1. Login to get session
login_data = json.dumps({'username': 'manager', 'password': 'agro1234'}).encode('utf-8')
req = urllib.request.Request('http://127.0.0.1:8000/api/auth/login/', data=login_data, headers={'Content-Type': 'application/json'})
resp = opener.open(req)
print("Login Status:", resp.status)

# 2. Query AI Assistant for tasks
ai_data = json.dumps({'prompt': 'what is my tasks?'}).encode('utf-8')
req2 = urllib.request.Request('http://127.0.0.1:8000/api/ai-assistant/', data=ai_data, headers={'Content-Type': 'application/json'})
resp2 = opener.open(req2)
print("AI Query Tasks Response:", json.loads(resp2.read().decode('utf-8'))['response'].encode('ascii', 'ignore').decode('ascii'))

# 3. Voice Command Create Task
ai_data3 = json.dumps({'prompt': 'task is :- check sprinkler valves'}).encode('utf-8')
req3 = urllib.request.Request('http://127.0.0.1:8000/api/ai-assistant/', data=ai_data3, headers={'Content-Type': 'application/json'})
resp3 = opener.open(req3)
print("AI Voice Task Create Response:", json.loads(resp3.read().decode('utf-8'))['response'].encode('ascii', 'ignore').decode('ascii'))

# 4. Voice Command Create Expense
ai_data4 = json.dumps({'prompt': 'expense is :- food 350'}).encode('utf-8')
req4 = urllib.request.Request('http://127.0.0.1:8000/api/ai-assistant/', data=ai_data4, headers={'Content-Type': 'application/json'})
resp4 = opener.open(req4)
print("AI Voice Expense Create Response:", json.loads(resp4.read().decode('utf-8'))['response'].encode('ascii', 'ignore').decode('ascii'))
