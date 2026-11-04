#!/usr/bin/env python3
"""Local test site: HEAD /sitemap.xml says 200, GET /sitemap.xml drops the connection.
That is the failed sitemap request the SEOnaut hang report describes. No outside traffic."""
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer


class H(BaseHTTPRequestHandler):
    def reply(self, code, body, ctype="text/html"):
        self.send_response(code)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        if self.command != "HEAD":
            self.wfile.write(body)

    def do_HEAD(self):
        self.reply(200, b"", "application/xml")

    def do_GET(self):
        if self.path == "/sitemap.xml":
            print("DROPPED GET /sitemap.xml", flush=True)
            self.connection.close()
            return
        if self.path == "/robots.txt":
            return self.reply(200, b"User-agent: *\nDisallow:\nSitemap: http://trap:8000/sitemap.xml\n", "text/plain")
        if self.path == "/":
            return self.reply(200, b"<html><head><title>home</title></head><body><a href='/a'>a</a><img src='/i.jpg'><a href='http://trap:8000/x.pdf'>p</a></body></html>")
        if self.path == "/js":
            return self.reply(200, b"<html><head><title>js</title></head><body><script>var h=document.createElement('h1');h.textContent='rendered';document.body.appendChild(h);</script></body></html>")
        return self.reply(200, b"<html><head><title>a</title></head><body>a</body></html>")


ThreadingHTTPServer(("0.0.0.0", 8000), H).serve_forever()
