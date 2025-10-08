-- Script para Criar Tabelas no Supabase - TranspJardim
-- Execute este script PRIMEIRO no SQL Editor do Supabase

-- 1. Criar tabela de usuários
CREATE TABLE usuarios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  nome VARCHAR NOT NULL,
  role VARCHAR DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  secretaria VARCHAR,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Criar tabela de critérios
CREATE TABLE criterios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo VARCHAR NOT NULL,
  descricao TEXT,
  secretaria VARCHAR NOT NULL,
  periodicidade VARCHAR NOT NULL CHECK (periodicidade IN ('15_dias', '30_dias', 'mensal', 'bimestral', 'semestral', 'anual')),
  valor NUMERIC DEFAULT 0,
  meta NUMERIC DEFAULT 100,
  status VARCHAR DEFAULT 'ativo' CHECK (status IN ('ativo', 'pendente', 'vencido')),
  data_vencimento TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Criar tabela de conclusões por usuário
CREATE TABLE criterio_conclusoes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  criterio_id UUID REFERENCES criterios(id) ON DELETE CASCADE,
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  concluido BOOLEAN DEFAULT false,
  data_conclusao TIMESTAMP WITH TIME ZONE,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(criterio_id, usuario_id)
);

-- 4. Criar tabela de alertas
CREATE TABLE alertas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo VARCHAR NOT NULL,
  descricao TEXT,
  tipo VARCHAR DEFAULT 'info' CHECK (tipo IN ('info', 'warning', 'error', 'success')),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  lido BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Criar índices para performance
CREATE INDEX idx_criterios_secretaria ON criterios(secretaria);
CREATE INDEX idx_criterios_status ON criterios(status);
CREATE INDEX idx_alertas_usuario ON alertas(usuario_id);
CREATE INDEX idx_conclusoes_criterio ON criterio_conclusoes(criterio_id);
CREATE INDEX idx_conclusoes_usuario ON criterio_conclusoes(usuario_id);

-- 6. Habilitar Row Level Security (RLS)
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE criterios ENABLE ROW LEVEL SECURITY;
ALTER TABLE criterio_conclusoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE alertas ENABLE ROW LEVEL SECURITY;

-- 7. Criar políticas de segurança

-- Políticas para usuários
CREATE POLICY "Usuários podem ver próprio perfil" ON usuarios
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins podem gerenciar todos os usuários" ON usuarios
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Políticas para critérios
CREATE POLICY "Todos podem ver critérios" ON criterios
  FOR SELECT USING (true);

CREATE POLICY "Admins podem gerenciar critérios" ON criterios
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Políticas para conclusões
CREATE POLICY "Usuários podem gerenciar próprias conclusões" ON criterio_conclusoes
  FOR ALL USING (usuario_id = auth.uid());

CREATE POLICY "Admins podem ver todas as conclusões" ON criterio_conclusoes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Políticas para alertas
CREATE POLICY "Usuários podem ver próprios alertas" ON alertas
  FOR SELECT USING (usuario_id = auth.uid());

CREATE POLICY "Admins podem gerenciar todos os alertas" ON alertas
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 8. Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 9. Criar triggers para atualizar updated_at
CREATE TRIGGER update_usuarios_updated_at 
    BEFORE UPDATE ON usuarios 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_criterios_updated_at 
    BEFORE UPDATE ON criterios 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conclusoes_updated_at 
    BEFORE UPDATE ON criterio_conclusoes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 10. Confirmar criação das tabelas
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE tablename IN ('usuarios', 'criterios', 'criterio_conclusoes', 'alertas')
ORDER BY tablename;