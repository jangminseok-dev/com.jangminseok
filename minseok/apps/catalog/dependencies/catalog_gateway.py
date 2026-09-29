from functools import lru_cache

from catalog.adapter.outbound.json_catalog import load_catalog
from catalog.app.use_cases import CatalogInteractor
from core.config import SITE_URL
from hub.app.ports.output.catalog_port import ProjectCatalogPort


@lru_cache
def get_catalog_gateway() -> ProjectCatalogPort:
    return CatalogInteractor(load_catalog(SITE_URL))
