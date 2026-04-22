"""Mapeamentos canônicos entre nomenclaturas externas e o schema interno."""

from __future__ import annotations

# -----------------------------------------------------------------------------
# Cargo TSE -> role canônico do schema elleito.ai
# Os códigos/descrições do TSE variam levemente por ano. Incluímos as formas
# mais comuns; o ETL deve lançar erro se encontrar algo não mapeado.
# -----------------------------------------------------------------------------
ROLE_FROM_TSE: dict[str, str] = {
    "PRESIDENTE":           "presidente",
    "VICE-PRESIDENTE":      "presidente",          # fica agrupado na chapa
    "GOVERNADOR":           "governador",
    "VICE-GOVERNADOR":      "governador",
    "SENADOR":              "senador",
    "1 SUPLENTE":           "senador",
    "2 SUPLENTE":           "senador",
    "1º SUPLENTE":          "senador",
    "2º SUPLENTE":          "senador",
    "DEPUTADO FEDERAL":     "deputado_federal",
    "DEPUTADO ESTADUAL":    "deputado_estadual",
    "DEPUTADO DISTRITAL":   "deputado_estadual",   # não se aplica a PR, mantido por segurança
    "PREFEITO":             "prefeito",
    "VICE-PREFEITO":        "prefeito",
    "VEREADOR":             "vereador",
}


# -----------------------------------------------------------------------------
# Situação de candidatura TSE -> status canônico
# -----------------------------------------------------------------------------
STATUS_FROM_TSE: dict[str, str] = {
    "DEFERIDO":              "deferido",
    "DEFERIDO COM RECURSO":  "deferido",
    "INDEFERIDO":            "indeferido",
    "INDEFERIDO COM RECURSO":"indeferido",
    "RENUNCIA":              "renuncia",
    "RENÚNCIA":              "renuncia",
    "CASSADO":               "outros",
    "FALECIDO":              "falecido",
}


def normalize_role(raw: str | None) -> str | None:
    if raw is None:
        return None
    key = raw.strip().upper()
    return ROLE_FROM_TSE.get(key)


def normalize_status(raw: str | None) -> str | None:
    if raw is None:
        return None
    key = raw.strip().upper()
    return STATUS_FROM_TSE.get(key, "outros")
