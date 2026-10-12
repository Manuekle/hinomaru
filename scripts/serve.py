#!/usr/bin/env python3
"""Preview the static site locally, including its extensionless HTML routes."""

import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


SITE_ROOT = Path(__file__).resolve().parents[1] / "app"


class SiteServer(ThreadingHTTPServer):
    # The landing requests many screenshots and SVGs at once. The default queue
    # holds only five connections and can reset downloads during that burst.
    request_queue_size = 128


class SiteHandler(SimpleHTTPRequestHandler):
    def translate_path(self, path):
        resolved = Path(super().translate_path(path))
        if not resolved.exists() and not resolved.suffix:
            document = resolved.with_suffix(".html")
            if document.is_file():
                return str(document)
        return str(resolved)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("port", type=int, nargs="?", default=4181)
    parser.add_argument("--bind", default="127.0.0.1")
    args = parser.parse_args()

    handler = partial(SiteHandler, directory=str(SITE_ROOT))
    with SiteServer((args.bind, args.port), handler) as server:
        print(f"KanaGO! preview: http://{args.bind}:{args.port}", flush=True)
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            pass


if __name__ == "__main__":
    main()
