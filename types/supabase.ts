export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          nome: string
          email: string
          role: 'admin' | 'user'
          secretaria: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          nome: string
          email: string
          role?: 'admin' | 'user'
          secretaria?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nome?: string
          email?: string
          role?: 'admin' | 'user'
          secretaria?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      criterios: {
        Row: {
          id: string
          nome: string
          descricao: string | null
          secretaria: string
          tipo: 'indicador' | 'meta' | 'processo'
          periodicidade: '15_dias' | '30_dias' | 'mensal' | 'bimestral' | 'semestral' | 'anual'
          valor: number
          meta: number
          status: 'ativo' | 'pendente' | 'vencido' | 'inativo'
          prazo: string | null
          responsavel: string | null
          observacoes: string | null
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          nome: string
          descricao?: string | null
          secretaria: string
          tipo: 'indicador' | 'meta' | 'processo'
          periodicidade: '15_dias' | '30_dias' | 'mensal' | 'bimestral' | 'semestral' | 'anual'
          valor?: number
          meta: number
          status?: 'ativo' | 'pendente' | 'vencido' | 'inativo'
          prazo?: string | null
          responsavel?: string | null
          observacoes?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          nome?: string
          descricao?: string | null
          secretaria?: string
          tipo?: 'indicador' | 'meta' | 'processo'
          periodicidade?: '15_dias' | '30_dias' | 'mensal' | 'bimestral' | 'semestral' | 'anual'
          valor?: number
          meta?: number
          status?: 'ativo' | 'pendente' | 'vencido' | 'inativo'
          prazo?: string | null
          responsavel?: string | null
          observacoes?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
      }
      alertas: {
        Row: {
          id: string
          titulo: string
          descricao: string
          tipo: 'info' | 'warning' | 'error' | 'success'
          criterio_id: string | null
          user_id: string | null
          lido: boolean
          created_at: string
        }
        Insert: {
          id?: string
          titulo: string
          descricao: string
          tipo: 'info' | 'warning' | 'error' | 'success'
          criterio_id?: string | null
          user_id?: string | null
          lido?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          titulo?: string
          descricao?: string
          tipo?: 'info' | 'warning' | 'error' | 'success'
          criterio_id?: string | null
          user_id?: string | null
          lido?: boolean
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}