# -*- mode: python ; coding: utf-8 -*-
# PyInstaller spec for the Prioritization Board desktop executable.
# Run from the backend/ directory:
#   pyinstaller board.spec --noconfirm

import os

block_cipher = None

# Paths relative to backend/ (where this spec file lives)
REPO_ROOT = os.path.abspath(os.path.join(SPECPATH, ".."))

a = Analysis(
    ["launcher.py"],
    pathex=[SPECPATH],
    binaries=[],
    datas=[
        # React production build (created by build_desktop.bat)
        (os.path.join(SPECPATH, "static"),          "static"),
        # SQLite schema for first-run database initialisation
        (os.path.join(REPO_ROOT, "db", "schema_sqlite.sql"), "db"),
        # Default roles / teams / admin config
        (os.path.join(REPO_ROOT, "config", "roles.json"),    "config"),
    ],
    hiddenimports=[
        # SQLite async driver
        "aiosqlite",
        # SQLAlchemy SQLite dialect
        "sqlalchemy.dialects.sqlite",
        "sqlalchemy.dialects.sqlite.aiosqlite",
        # uvicorn internals (not always auto-detected)
        "uvicorn.logging",
        "uvicorn.loops",
        "uvicorn.loops.asyncio",
        "uvicorn.protocols",
        "uvicorn.protocols.http",
        "uvicorn.protocols.http.auto",
        "uvicorn.protocols.websockets",
        "uvicorn.protocols.websockets.auto",
        "uvicorn.lifespan",
        "uvicorn.lifespan.on",
        # FastAPI / Starlette
        "fastapi.staticfiles",
        "fastapi.responses",
    ],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=["asyncpg", "psycopg2", "tkinter"],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    [],
    name="PrioritizationBoard",
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=True,       # Show a console window so users can see startup/errors
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    icon=None,          # Set to a .ico file path to add a custom icon
)
