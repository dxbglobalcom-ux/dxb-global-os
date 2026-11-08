"""Render a saved HTML page to plain text (block elements become newlines). Reads untrusted HTML as data only."""
import html.parser

BLOCK = {"p", "div", "li", "tr", "h1", "h2", "h3", "h4", "h5", "h6", "pre", "br", "section", "article", "td", "th", "blockquote"}
HIDDEN = ("script", "style", "noscript", "svg")


class _Text(html.parser.HTMLParser):
    def __init__(self):
        super().__init__()
        self.out = []
        self.skip = 0

    def handle_starttag(self, tag, attrs):
        if tag in HIDDEN:
            self.skip += 1
        if tag in BLOCK:
            self.out.append("\n")

    def handle_endtag(self, tag):
        if tag in HIDDEN:
            self.skip = max(0, self.skip - 1)
        if tag in BLOCK:
            self.out.append("\n")

    def handle_data(self, d):
        if not self.skip:
            self.out.append(d)


def render(path):
    t = _Text()
    t.feed(open(path, encoding="utf-8", errors="replace").read())
    res = []
    for line in "".join(t.out).splitlines():
        line = line.strip()
        if line or (res and res[-1]):
            res.append(line)
    return "\n".join(res)
