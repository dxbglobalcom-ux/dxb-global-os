#!/usr/bin/env python3
"""The real Gemini API on the flash clip: does it see 0.2 s events, does it hear?
The key is read from ~/.config/dxb/.env.daemon and goes only into a request header; it is never printed.
Usage: gemini-api-test.py <clip.mp4> <model> <fps|default> <runs>"""
import json, os, re, sys, time, urllib.error, urllib.request

clip, model, fps, runs = sys.argv[1], sys.argv[2], sys.argv[3], int(sys.argv[4])
key = None
for line in open(os.path.expanduser("~/.config/dxb/.env.daemon")):
    m = re.match(r"\s*(?:export\s+)?(?:GEMINI|GOOGLE)_API_KEY=(.*)", line)
    if m:
        key = m.group(1).strip().strip("'\"")
assert key, "no key line"
B = "https://generativelanguage.googleapis.com"


def call(url, data=None, headers=None, method=None):
    h = {"x-goog-api-key": key, **(headers or {})}
    r = urllib.request.Request(url, data=data, headers=h, method=method)
    for attempt in range(6):
        try:
            return json.load(urllib.request.urlopen(r, timeout=170))
        except urllib.error.HTTPError as e:
            if e.code == 503 and attempt < 5:
                print("503, waiting", flush=True)
                time.sleep(25)
                continue
            print("HTTP", e.code, e.read().decode()[:400])
            sys.exit(1)


f = call(B + "/upload/v1beta/files?uploadType=media", open(clip, "rb").read(), {"Content-Type": "video/mp4"}, "POST")["file"]
for _ in range(30):
    s = call(B + "/v1beta/" + f["name"])
    if s.get("state") == "ACTIVE":
        break
    time.sleep(2)
print("file state", s.get("state"))
part = {"file_data": {"file_uri": f["uri"], "mime_type": "video/mp4"}}
if fps != "default":
    part["video_metadata"] = {"fps": float(fps)}
q = ("List every large code that appears on screen in this video, each with its exact time. "
     "Then describe the sound track: what you hear and at which seconds.")
body = json.dumps({"contents": [{"parts": [part, {"text": q}]}]}).encode()
for i in range(runs):
    r = call(f"{B}/v1beta/models/{model}:generateContent", body, {"Content-Type": "application/json"}, "POST")
    t = "".join(p.get("text", "") for p in r["candidates"][0]["content"]["parts"])
    print(f"--- {model} fps={fps} run {i + 1} tokens={r.get('usageMetadata', {}).get('promptTokenCount')}\n{t[:900]}")
