import re
import threading
import unittest
from pathlib import Path
from urllib.request import urlopen
from urllib.parse import urlsplit
import hashlib
from unittest.mock import patch

import server


class StaticAssetTests(unittest.TestCase):
    def test_every_local_script_is_served(self):
        handler = server.Handler
        with patch.object(server.Handler, "authorized", return_value=True):
            httpd = server.ThreadingHTTPServer(("127.0.0.1", 0), handler)
            thread = threading.Thread(target=httpd.serve_forever, daemon=True)
            thread.start()
            try:
                html = (server.ROOT / "index.html").read_text(encoding="utf-8")
                assets = re.findall(r'<script src="\./([^"]+)"', html)
                assets += re.findall(r'<link rel="stylesheet" href="\./([^"]+)"', html)
                for asset in assets:
                    with self.subTest(asset=asset):
                        with urlopen(f"http://127.0.0.1:{httpd.server_port}/{asset}") as response:
                            self.assertEqual(response.status, 200)
                            contents = (server.ROOT / urlsplit(asset).path).read_bytes()
                            self.assertEqual(response.read(), contents)
                            self.assertEqual(response.headers.get("Cache-Control"), "no-cache")
                            self.assertEqual(urlsplit(asset).query, "v=" + hashlib.sha256(contents.replace(b'\r\n', b'\n')).hexdigest()[:12])
                with urlopen(f"http://127.0.0.1:{httpd.server_port}/cozy.png") as response:
                    self.assertEqual(response.headers.get_content_type(), "image/png")
                    self.assertEqual(response.read(), (server.ROOT / "cozy.png").read_bytes())
            finally:
                httpd.shutdown()
                httpd.server_close()
                thread.join()
