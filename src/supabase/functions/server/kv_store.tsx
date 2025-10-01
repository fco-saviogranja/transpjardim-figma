import { createClient } from 'npm:@supabase/supabase-js@2';

// Cliente Supabase para operações de KV
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables for KV store');
}

const supabase = createClient(supabaseUrl || '', supabaseKey || '');

// Nome da tabela KV
const KV_TABLE = 'kv_store_225e1157';

// Função para obter um valor por chave
export async function get(key: string): Promise<any> {
  try {
    const { data, error } = await supabase
      .from(KV_TABLE)
      .select('value')
      .eq('key', key)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // Não encontrado
        return null;
      }
      throw error;
    }
    
    return data?.value || null;
  } catch (error) {
    console.error(`Erro ao buscar chave ${key}:`, error);
    return null;
  }
}

// Função para definir um valor
export async function set(key: string, value: any): Promise<void> {
  try {
    const { error } = await supabase
      .from(KV_TABLE)
      .upsert({ key, value }, { onConflict: 'key' });
    
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error(`Erro ao definir chave ${key}:`, error);
    throw error;
  }
}

// Função para deletar uma chave
export async function del(key: string): Promise<void> {
  try {
    const { error } = await supabase
      .from(KV_TABLE)
      .delete()
      .eq('key', key);
    
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error(`Erro ao deletar chave ${key}:`, error);
    throw error;
  }
}

// Função para buscar múltiplas chaves
export async function mget(keys: string[]): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from(KV_TABLE)
      .select('key, value')
      .in('key', keys);
    
    if (error) {
      throw error;
    }
    
    // Retornar na mesma ordem das chaves solicitadas
    return keys.map(key => {
      const found = data?.find(item => item.key === key);
      return found ? found.value : null;
    });
  } catch (error) {
    console.error('Erro ao buscar múltiplas chaves:', error);
    return keys.map(() => null);
  }
}

// Função para definir múltiplas chaves
export async function mset(keyValues: Record<string, any>): Promise<void> {
  try {
    const entries = Object.entries(keyValues).map(([key, value]) => ({
      key,
      value
    }));
    
    const { error } = await supabase
      .from(KV_TABLE)
      .upsert(entries, { onConflict: 'key' });
    
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Erro ao definir múltiplas chaves:', error);
    throw error;
  }
}

// Função para deletar múltiplas chaves
export async function mdel(keys: string[]): Promise<void> {
  try {
    const { error } = await supabase
      .from(KV_TABLE)
      .delete()
      .in('key', keys);
    
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Erro ao deletar múltiplas chaves:', error);
    throw error;
  }
}

// Função para buscar chaves por prefixo
export async function getByPrefix(prefix: string): Promise<Array<{key: string, value: any}>> {
  try {
    console.log(`Buscando chaves com prefixo: ${prefix}`);
    
    const { data, error } = await supabase
      .from(KV_TABLE)
      .select('key, value')
      .like('key', `${prefix}%`);
    
    if (error) {
      console.error('Erro na query getByPrefix:', error);
      throw error;
    }
    
    console.log(`Encontradas ${data?.length || 0} chaves com prefixo ${prefix}`);
    return data || [];
  } catch (error) {
    console.error(`Erro ao buscar chaves por prefixo ${prefix}:`, error);
    return [];
  }
}

// Função para limpar todas as chaves (use com cuidado!)
export async function clear(): Promise<void> {
  try {
    const { error } = await supabase
      .from(KV_TABLE)
      .delete()
      .neq('key', ''); // Deletar todos os registros
    
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Erro ao limpar todas as chaves:', error);
    throw error;
  }
}

// Função para contar chaves
export async function count(): Promise<number> {
  try {
    const { count, error } = await supabase
      .from(KV_TABLE)
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      throw error;
    }
    
    return count || 0;
  } catch (error) {
    console.error('Erro ao contar chaves:', error);
    return 0;
  }
}

console.log('KV Store inicializado para TranspJardim');