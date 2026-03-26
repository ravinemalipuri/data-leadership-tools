import sys
import os


def resource_path(relative_path: str) -> str:
    """Return absolute path to a bundled resource.

    Works both in normal development (paths relative to the repo root)
    and when frozen by PyInstaller (paths relative to sys._MEIPASS).
    """
    if getattr(sys, "frozen", False):
        # PyInstaller extracts bundled files to a temp folder at runtime
        base = sys._MEIPASS  # type: ignore[attr-defined]
    else:
        # Development: repo root is two levels above this file (backend/app/utils.py)
        base = os.path.normpath(os.path.join(os.path.dirname(__file__), "..", ".."))
    return os.path.normpath(os.path.join(base, relative_path))


def get_data_dir() -> str:
    """Return a writable directory for user data (SQLite DB file, etc.)."""
    import platform
    if platform.system() == "Windows":
        base = os.environ.get("LOCALAPPDATA", os.path.expanduser("~"))
    elif platform.system() == "Darwin":
        base = os.path.expanduser("~/Library/Application Support")
    else:
        base = os.environ.get("XDG_DATA_HOME", os.path.expanduser("~/.local/share"))
    data_dir = os.path.join(base, "PrioritizationBoard")
    os.makedirs(data_dir, exist_ok=True)
    return data_dir
