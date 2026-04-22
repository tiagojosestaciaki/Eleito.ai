/**
 * Tipos do Postgres do elleito.ai.
 *
 * ⚠️ Este arquivo é mantido manualmente para a Fase 2. Quando o projeto
 * Supabase estiver disponível localmente, regenerar com:
 *
 *   npx supabase gen types typescript \
 *     --project-id <project-id> \
 *     --schema public > types/database.ts
 *
 * Cobre apenas as tabelas da Fase 1 (migrations 2026-04-21).
 * Tabelas das Fases 3-7 (chat_*, mentions, alerts, etc.) entram quando
 * chegarem.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Role =
  | "presidente"
  | "governador"
  | "senador"
  | "deputado_federal"
  | "deputado_estadual"
  | "prefeito"
  | "vereador";

export type ElectionScope = "federal" | "estadual" | "municipal";

export type CandidateStatus =
  | "deferido"
  | "indeferido"
  | "renuncia"
  | "falecido"
  | "outros";

export type UserRole = "owner" | "admin" | "analyst" | "viewer";

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          billing_email: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          billing_email?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["organizations"]["Insert"]>;
        Relationships: [];
      };
      users: {
        Row: {
          id: string;
          organization_id: string;
          email: string;
          full_name: string | null;
          role: UserRole;
          plan: string | null;
          preferences: Json;
          onboarded_at: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id: string;
          organization_id: string;
          email: string;
          full_name?: string | null;
          role?: UserRole;
          plan?: string | null;
          preferences?: Json;
        };
        Update: Partial<Database["public"]["Tables"]["users"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "users_organization_id_fkey";
            columns: ["organization_id"];
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      feature_flags: {
        Row: {
          id: string;
          organization_id: string;
          feature_name: string;
          enabled: boolean;
          limits: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          feature_name: string;
          enabled?: boolean;
          limits?: Json;
        };
        Update: Partial<Database["public"]["Tables"]["feature_flags"]["Insert"]>;
        Relationships: [];
      };
      elections: {
        Row: {
          id: number;
          year: number;
          round: number;
          scope: ElectionScope;
          role: Role;
          election_date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          year: number;
          round: number;
          scope: ElectionScope;
          role: Role;
          election_date: string;
        };
        Update: Partial<Database["public"]["Tables"]["elections"]["Insert"]>;
        Relationships: [];
      };
      candidates: {
        Row: {
          tse_id: number;
          election_id: number;
          name: string;
          ballot_name: string | null;
          ballot_number: number | null;
          party: string | null;
          coalition: string | null;
          role: Role;
          status: CandidateStatus | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          tse_id: number;
          election_id: number;
          name: string;
          ballot_name?: string | null;
          ballot_number?: number | null;
          party?: string | null;
          coalition?: string | null;
          role: Role;
          status?: CandidateStatus | null;
        };
        Update: Partial<Database["public"]["Tables"]["candidates"]["Insert"]>;
        Relationships: [];
      };
      municipalities: {
        Row: {
          ibge_code: number;
          tse_code: number | null;
          name: string;
          state: string;
          region: string | null;
          micro_region: string | null;
          area_km2: number | null;
          population: number | null;
          electorate: number | null;
          gdp_per_capita: number | null;
          idh: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          ibge_code: number;
          name: string;
          state: string;
          tse_code?: number | null;
          region?: string | null;
          micro_region?: string | null;
          population?: number | null;
          electorate?: number | null;
        };
        Update: Partial<Database["public"]["Tables"]["municipalities"]["Insert"]>;
        Relationships: [];
      };
      results_municipality: {
        Row: {
          id: number;
          election_id: number;
          candidate_id: number;
          ibge_code: number;
          votes: number;
          pct_valid: number | null;
          pct_total: number | null;
          rank_in_municipality: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          election_id: number;
          candidate_id: number;
          ibge_code: number;
          votes: number;
          pct_valid?: number | null;
          pct_total?: number | null;
          rank_in_municipality?: number | null;
        };
        Update: Partial<
          Database["public"]["Tables"]["results_municipality"]["Insert"]
        >;
        Relationships: [];
      };
      results_zone: {
        Row: {
          id: number;
          election_id: number;
          candidate_id: number;
          ibge_code: number;
          zone_number: number;
          section_count: number | null;
          votes: number;
          electorate: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          election_id: number;
          candidate_id: number;
          ibge_code: number;
          zone_number: number;
          votes: number;
          section_count?: number | null;
          electorate?: number | null;
        };
        Update: Partial<Database["public"]["Tables"]["results_zone"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
