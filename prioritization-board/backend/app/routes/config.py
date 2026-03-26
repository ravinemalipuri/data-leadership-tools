import os
import json
from fastapi import APIRouter
from app.utils import resource_path

router = APIRouter()

_DEFAULT_CONFIG = {
    "roles": ["Developer", "Manager", "Leader"],
    "teams": ["Data Engineering", "Data Analytics", "Data Architecture",
              "Business Intelligence", "Platform Engineering", "Business"],
    "admin_users": [],
}


@router.get("/")
def get_config():
    # Prefer an explicit env var override, then the bundled/repo config file.
    path = os.getenv("ROLES_CONFIG") or resource_path("config/roles.json")
    try:
        with open(path) as f:
            return json.load(f)
    except FileNotFoundError:
        return _DEFAULT_CONFIG
