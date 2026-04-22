"""Testes dos normalizadores de cargo e status (sem dependência externa)."""

from elleito_ingestion.common.mappings import normalize_role, normalize_status


class TestNormalizeRole:
    def test_common_majoritarian(self) -> None:
        assert normalize_role("PRESIDENTE") == "presidente"
        assert normalize_role("GOVERNADOR") == "governador"
        assert normalize_role("PREFEITO") == "prefeito"

    def test_common_proportional(self) -> None:
        assert normalize_role("DEPUTADO FEDERAL") == "deputado_federal"
        assert normalize_role("DEPUTADO ESTADUAL") == "deputado_estadual"
        assert normalize_role("VEREADOR") == "vereador"

    def test_vice_goes_to_main_role(self) -> None:
        assert normalize_role("VICE-PRESIDENTE") == "presidente"
        assert normalize_role("VICE-GOVERNADOR") == "governador"
        assert normalize_role("VICE-PREFEITO") == "prefeito"

    def test_handles_whitespace_and_case(self) -> None:
        assert normalize_role("  deputado federal  ") == "deputado_federal"

    def test_unknown_returns_none(self) -> None:
        assert normalize_role("CONSELHEIRO TUTELAR") is None

    def test_none_returns_none(self) -> None:
        assert normalize_role(None) is None


class TestNormalizeStatus:
    def test_deferred(self) -> None:
        assert normalize_status("DEFERIDO") == "deferido"
        assert normalize_status("DEFERIDO COM RECURSO") == "deferido"

    def test_rejected(self) -> None:
        assert normalize_status("INDEFERIDO") == "indeferido"

    def test_renuncia_with_accent(self) -> None:
        assert normalize_status("RENÚNCIA") == "renuncia"
        assert normalize_status("RENUNCIA") == "renuncia"

    def test_unknown_bucket(self) -> None:
        assert normalize_status("QUALQUER COISA") == "outros"

    def test_none(self) -> None:
        assert normalize_status(None) is None
