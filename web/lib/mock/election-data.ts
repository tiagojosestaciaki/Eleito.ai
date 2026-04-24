/**
 * Mock de resultados eleitorais para desenvolvimento do dashboard.
 *
 * Representa 20 municípios reais do PR com percentuais fictícios
 * (0-100) de votos válidos. Substituído por dados reais assim que o
 * ETL da Fase 1 rodar e popular `results_municipality`.
 *
 * Códigos IBGE verificados (7 dígitos, formato oficial).
 */

export type MockResult = {
  ibge_code: number;
  name: string;
  pct_valid: number;
};

export const MOCK_ELECTION_RESULTS: MockResult[] = [
  { ibge_code: 4106902, name: "Curitiba", pct_valid: 42.3 },
  { ibge_code: 4113700, name: "Londrina", pct_valid: 38.7 },
  { ibge_code: 4115200, name: "Maringá", pct_valid: 35.2 },
  { ibge_code: 4119905, name: "Ponta Grossa", pct_valid: 28.9 },
  { ibge_code: 4104808, name: "Cascavel", pct_valid: 31.5 },
  { ibge_code: 4108304, name: "Foz do Iguaçu", pct_valid: 24.8 },
  { ibge_code: 4125506, name: "São José dos Pinhais", pct_valid: 29.1 },
  { ibge_code: 4105805, name: "Colombo", pct_valid: 22.6 },
  { ibge_code: 4109401, name: "Guarapuava", pct_valid: 19.4 },
  { ibge_code: 4118204, name: "Paranaguá", pct_valid: 26.3 },
  { ibge_code: 4127700, name: "Toledo", pct_valid: 33.8 },
  { ibge_code: 4101804, name: "Araucária", pct_valid: 27.5 },
  { ibge_code: 4101408, name: "Apucarana", pct_valid: 36.2 },
  { ibge_code: 4119962, name: "Pinhais", pct_valid: 20.7 },
  { ibge_code: 4104253, name: "Campo Largo", pct_valid: 23.4 },
  { ibge_code: 4101606, name: "Arapongas", pct_valid: 41.9 },
  { ibge_code: 4100400, name: "Almirante Tamandaré", pct_valid: 17.3 },
  { ibge_code: 4128104, name: "Umuarama", pct_valid: 45.6 },
  { ibge_code: 4107652, name: "Fazenda Rio Grande", pct_valid: 15.8 },
  { ibge_code: 4128205, name: "União da Vitória", pct_valid: 52.1 },
];

/** Lookup rápido por código IBGE para uso na renderização do mapa. */
export const MOCK_RESULTS_BY_CODE: Map<number, MockResult> = new Map(
  MOCK_ELECTION_RESULTS.map((r) => [r.ibge_code, r]),
);
