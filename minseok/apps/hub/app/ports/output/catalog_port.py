from abc import ABC, abstractmethod

from hub.app.dtos import ProjectFacts, SkillMatch


class ProjectCatalogPort(ABC):
    @abstractmethod
    def get_project(self, slug: str) -> ProjectFacts | None: ...

    @abstractmethod
    def find_by_skill(self, skill: str) -> list[SkillMatch]: ...

    @abstractmethod
    def slugs(self) -> list[str]: ...

    @abstractmethod
    def all_slide_urls(self) -> set[str]: ...
