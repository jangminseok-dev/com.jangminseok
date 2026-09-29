import json
from pathlib import Path

from catalog.domain.models import CatalogData

CATALOG_PATH = Path(__file__).resolve().parents[4] / "data" / "catalog.json"


def load_catalog(site: str, path: Path = CATALOG_PATH) -> CatalogData:
    return CatalogData.from_dict(json.loads(path.read_text(encoding="utf-8")), site)
