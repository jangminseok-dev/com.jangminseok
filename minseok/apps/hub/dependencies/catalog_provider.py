from hub.app.ports.output.catalog_port import ProjectCatalogPort


def get_catalog_port() -> ProjectCatalogPort:
    """main.py의 dependency_overrides로 catalog 스포크 구현을 주입한다."""
    raise NotImplementedError("main.py에서 catalog 게이트웨이를 주입해야 합니다")
