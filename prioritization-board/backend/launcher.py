"""
Desktop launcher for the Prioritization Board.

This is the entry point used by PyInstaller to build the standalone executable.
It starts the FastAPI/uvicorn server and opens the browser automatically.
"""

import sys
import os
import threading
import time
import webbrowser

# ---------------------------------------------------------------------------
# When frozen by PyInstaller, sys._MEIPASS is the temp directory where bundled
# files are extracted.  Add it to sys.path so Python can find the app package.
# ---------------------------------------------------------------------------
if getattr(sys, "frozen", False):
    sys.path.insert(0, sys._MEIPASS)  # type: ignore[attr-defined]

import uvicorn  # noqa: E402  (import after path fix)

PORT = 8765
URL  = f"http://localhost:{PORT}"


def _open_browser():
    """Wait briefly for the server to start, then open the browser."""
    time.sleep(2)
    webbrowser.open(URL)


def main():
    print(f"Starting Prioritization Board on {URL}")
    print("Press Ctrl+C to stop.\n")

    t = threading.Thread(target=_open_browser, daemon=True)
    t.start()

    uvicorn.run(
        "app.main:app",
        host="127.0.0.1",
        port=PORT,
        log_level="warning",
    )


if __name__ == "__main__":
    main()
