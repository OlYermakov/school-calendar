from pathlib import Path
import re

path = Path("index.html")
html = path.read_text(encoding="utf-8")

html = re.sub(r'\n?<link\s+rel=["\'](?:apple-touch-icon|icon|shortcut icon)["\'][^>]*>', '', html, flags=re.I)

tags = """
<link rel="apple-touch-icon" sizes="180x180" href="apple-touch-icon.png">
<link rel="icon" type="image/png" sizes="180x180" href="apple-touch-icon.png">
<link rel="shortcut icon" type="image/png" href="apple-touch-icon.png">
""".strip()

if "</head>" not in html:
    raise SystemExit("No </head> tag found in index.html")

html = html.replace("</head>", tags + "\n</head>", 1)

if 'name="mobile-web-app-capable"' not in html:
    html = html.replace("</head>", '<meta name="mobile-web-app-capable" content="yes">\n</head>', 1)

path.write_text(html, encoding="utf-8")
