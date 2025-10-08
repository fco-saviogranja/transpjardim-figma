-- Script de Migração Inteligente - TranspJardim
-- Este script verifica o que existe e só cria o que está faltando

-- 1. Verificar e criar tabelas apenas se não existirem

-- Criar tabela usuarios se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'usuarios') THEN
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
        
        CREATE INDEX idx_usuarios_email ON usuarios(email);
        CREATE INDEX idx_usuarios_role ON usuarios(role);
        RAISE NOTICE 'Tabela usuarios criada com sucesso';
    ELSE
        RAISE NOTICE 'Tabela usuarios já existe';
    END IF;
END $$;

-- Criar tabela criterios se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'criterios') THEN
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
        
        CREATE INDEX idx_criterios_secretaria ON criterios(secretaria);
        CREATE INDEX idx_criterios_status ON criterios(status);
        RAISE NOTICE 'Tabela criterios criada com sucesso';
    ELSE
        RAISE NOTICE 'Tabela criterios já existe';
    END IF;
END $$;

-- Criar tabela criterio_conclusoes se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'criterio_conclusoes') THEN
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
        
        CREATE INDEX idx_conclusoes_criterio ON criterio_conclusoes(criterio_id);
        CREATE INDEX idx_conclusoes_usuario ON criterio_conclusoes(usuario_id);
        RAISE NOTICE 'Tabela criterio_conclusoes criada com sucesso';
    ELSE
        RAISE NOTICE 'Tabela criterio_conclusoes já existe';
    END IF;
END $$;

-- Criar tabela alertas se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'alertas') THEN
        CREATE TABLE alertas (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            titulo VARCHAR NOT NULL,
            descricao TEXT,
            tipo VARCHAR DEFAULT 'info' CHECK (tipo IN ('info', 'warning', 'error', 'success')),
            usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
            lido BOOLEAN DEFAULT false,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX idx_alertas_usuario ON alertas(usuario_id);
        CREATE INDEX idx_alertas_tipo ON alertas(tipo);
        RAISE NOTICE 'Tabela alertas criada com sucesso';
    ELSE
        RAISE NOTICE 'Tabela alertas já existe';
    END IF;
END $$;

-- 2. Configurar RLS (Row Level Security) apenas se não estiver configurado

-- Habilitar RLS nas tabelas
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE criterios ENABLE ROW LEVEL SECURITY;
ALTER TABLE criterio_conclusoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE alertas ENABLE ROW LEVEL SECURITY;

-- 3. Criar/Atualizar políticas de segurança (DROP IF EXISTS para recriar)

-- Políticas para usuarios
DROP POLICY IF EXISTS "usuarios_select_own" ON usuarios;
CREATE POLICY "usuarios_select_own" ON usuarios
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "usuarios_admin_all" ON usuarios;
CREATE POLICY "usuarios_admin_all" ON usuarios
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Políticas para criterios
DROP POLICY IF EXISTS "criterios_select_all" ON criterios;
CREATE POLICY "criterios_select_all" ON criterios
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "criterios_admin_manage" ON criterios;
CREATE POLICY "criterios_admin_manage" ON criterios
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Políticas para conclusões
DROP POLICY IF EXISTS "conclusoes_user_manage" ON criterio_conclusoes;
CREATE POLICY "conclusoes_user_manage" ON criterio_conclusoes
    FOR ALL USING (usuario_id = auth.uid());

DROP POLICY IF EXISTS "conclusoes_admin_select" ON criterio_conclusoes;
CREATE POLICY "conclusoes_admin_select" ON criterio_conclusoes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Políticas para alertas
DROP POLICY IF EXISTS "alertas_user_select" ON alertas;
CREATE POLICY "alertas_user_select" ON alertas
    FOR SELECT USING (usuario_id = auth.uid());

DROP POLICY IF EXISTS "alertas_admin_all" ON alertas;
CREATE POLICY "alertas_admin_all" ON alertas
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- 4. Criar função de trigger para updated_at (se não existir)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 5. Criar triggers para updated_at (DROP IF EXISTS para recriar)
DROP TRIGGER IF EXISTS update_usuarios_updated_at ON usuarios;
CREATE TRIGGER update_usuarios_updated_at 
    BEFORE UPDATE ON usuarios 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_criterios_updated_at ON criterios;
CREATE TRIGGER update_criterios_updated_at 
    BEFORE UPDATE ON criterios 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_conclusoes_updated_at ON criterio_conclusoes;
CREATE TRIGGER update_conclusoes_updated_at 
    BEFORE UPDATE ON criterio_conclusoes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. Verificar resultado final
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as num_columns
FROM information_schema.tables t
WHERE table_schema = 'public' 
AND table_name IN ('usuarios', 'criterios', 'criterio_conclusoes', 'alertas')
ORDER BY table_name;

RAISE NOTICE 'Migração inteligente concluída com sucesso!';