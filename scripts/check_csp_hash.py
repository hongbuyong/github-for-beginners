"""index.html의 CSP에 적힌 스크립트 해시가 실제 스크립트와 같은지 확인한다."""
import base64
import hashlib
import re
import sys

html = open("index.html", encoding="utf-8").read()

script = re.search(r"<script>(.*?)</script>", html, re.S)
declared = re.search(r"script-src 'sha256-([A-Za-z0-9+/=]+)'", html)
if not script or not declared:
    sys.exit("index.html에서 <script> 또는 CSP script-src 해시를 찾지 못했어요.")

actual = base64.b64encode(hashlib.sha256(script.group(1).encode()).digest()).decode()
if actual != declared.group(1):
    print(f"::error file=index.html,line=6::CSP 해시가 스크립트와 맞지 않아요. 6줄의 해시를 'sha256-{actual}'로 바꿔 주세요.")
    sys.exit(1)

print(f"CSP 해시가 일치해요: sha256-{actual}")
