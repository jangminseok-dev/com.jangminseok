from hub.app.ports.output.search_port import KnowledgeSearchPort


def get_search_port() -> KnowledgeSearchPort:
    """main.py의 dependency_overrides로 knowledge 스포크 구현을 주입한다."""
    raise NotImplementedError("main.py에서 knowledge 게이트웨이를 주입해야 합니다")
