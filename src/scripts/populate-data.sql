-- Script de População de Dados - TranspJardim
-- Este script insere dados apenas se não existirem (UPSERT seguro)

-- 1. Inserir usuários padrão (usando ON CONFLICT para evitar duplicatas)
INSERT INTO usuarios (email, nome, role, secretaria, ativo) VALUES
('admin@jardim.ce.gov.br', 'Administrador do Sistema', 'admin', 'Controladoria', true),
('secretario.saude@jardim.ce.gov.br', 'Secretário de Saúde', 'user', 'Secretaria de Saúde', true),
('secretario.educacao@jardim.ce.gov.br', 'Secretário de Educação', 'user', 'Secretaria de Educação', true),
('secretario.obras@jardim.ce.gov.br', 'Secretário de Obras', 'user', 'Secretaria de Obras', true),
('secretario.assistencia@jardim.ce.gov.br', 'Secretário de Assistência Social', 'user', 'Secretaria de Assistência Social', true),
('demo@jardim.ce.gov.br', 'Usuário Demonstração', 'user', 'Secretaria de Saúde', true)
ON CONFLICT (email) 
DO UPDATE SET 
    nome = EXCLUDED.nome,
    role = EXCLUDED.role,
    secretaria = EXCLUDED.secretaria,
    ativo = EXCLUDED.ativo,
    updated_at = NOW();

-- 2. Inserir critérios padrão (usando título como identificador único)
-- Primeiro, garantir que não existem critérios duplicados por título
DO $$
DECLARE
    criterio_data RECORD;
    criterios_to_insert CURSOR FOR
        SELECT * FROM (VALUES
            -- Secretaria de Saúde
            ('Atendimentos Médicos Realizados', 'Número total de atendimentos médicos na rede municipal de saúde', 'Secretaria de Saúde', 'mensal', 850, 100, 'ativo'),
            ('Vacinas Aplicadas', 'Quantidade de vacinas aplicadas conforme cronograma nacional', 'Secretaria de Saúde', '15_dias', 920, 100, 'ativo'),
            ('Consultas Especializadas', 'Atendimentos em especialidades médicas (cardiologia, pediatria, etc.)', 'Secretaria de Saúde', 'mensal', 640, 100, 'pendente'),
            ('Cirurgias Eletivas Realizadas', 'Procedimentos cirúrgicos não urgentes realizados', 'Secretaria de Saúde', 'bimestral', 45, 100, 'ativo'),
            ('Exames Laboratoriais', 'Exames de laboratório realizados pela rede municipal', 'Secretaria de Saúde', '30_dias', 1200, 100, 'ativo'),
            
            -- Secretaria de Educação
            ('Alunos Matriculados', 'Total de estudantes matriculados na rede municipal de ensino', 'Secretaria de Educação', 'anual', 2850, 100, 'ativo'),
            ('Professores Capacitados', 'Docentes que participaram de cursos de capacitação', 'Secretaria de Educação', 'semestral', 180, 100, 'ativo'),
            ('Escolas com Internet', 'Unidades escolares com acesso à internet banda larga', 'Secretaria de Educação', 'anual', 95, 100, 'ativo'),
            ('Merenda Escolar Servida', 'Refeições escolares servidas diariamente', 'Secretaria de Educação', 'mensal', 4200, 100, 'ativo'),
            ('Livros Didáticos Distribuídos', 'Livros entregues aos estudantes no início do ano letivo', 'Secretaria de Educação', 'anual', 5700, 100, 'pendente'),
            
            -- Secretaria de Obras
            ('Estradas Pavimentadas', 'Quilômetros de vias pavimentadas ou recuperadas', 'Secretaria de Obras', 'semestral', 12, 100, 'ativo'),
            ('Obras Públicas Concluídas', 'Projetos de infraestrutura finalizados no período', 'Secretaria de Obras', 'bimestral', 3, 100, 'ativo'),
            ('Sistemas de Drenagem', 'Metros lineares de drenagem pluvial instalados', 'Secretaria de Obras', 'anual', 2400, 100, 'pendente'),
            ('Praças Revitalizadas', 'Espaços públicos reformados e revitalizados', 'Secretaria de Obras', 'semestral', 2, 100, 'ativo'),
            ('Pontes e Pontilhões', 'Estruturas construídas ou reformadas para transposição', 'Secretaria de Obras', 'anual', 1, 100, 'ativo'),
            
            -- Secretaria de Assistência Social
            ('Famílias Cadastradas', 'Famílias inscritas no Cadastro Único (CadÚnico)', 'Secretaria de Assistência Social', 'mensal', 1250, 100, 'ativo'),
            ('Benefícios Concedidos', 'Auxílios e benefícios sociais distribuídos', 'Secretaria de Assistência Social', 'mensal', 850, 100, 'ativo'),
            ('Atendimentos CRAS', 'Atendimentos realizados no Centro de Referência de Assistência Social', 'Secretaria de Assistência Social', '15_dias', 420, 100, 'ativo'),
            ('Programas Sociais Ativos', 'Programas de assistência social em funcionamento', 'Secretaria de Assistência Social', 'bimestral', 8, 100, 'ativo'),
            ('Idosos Atendidos', 'Pessoas da terceira idade assistidas pelos programas municipais', 'Secretaria de Assistência Social', 'mensal', 320, 100, 'pendente')
        ) AS criterios_data(titulo, descricao, secretaria, periodicidade, valor, meta, status);
BEGIN
    FOR criterio_data IN criterios_to_insert LOOP
        -- Verificar se critério já existe
        IF NOT EXISTS (SELECT 1 FROM criterios WHERE titulo = criterio_data.titulo) THEN
            -- Calcular data de vencimento baseada na periodicidade
            INSERT INTO criterios (titulo, descricao, secretaria, periodicidade, valor, meta, status, data_vencimento) 
            VALUES (
                criterio_data.titulo,
                criterio_data.descricao,
                criterio_data.secretaria,
                criterio_data.periodicidade,
                criterio_data.valor,
                criterio_data.meta,
                criterio_data.status,
                CASE criterio_data.periodicidade
                    WHEN '15_dias' THEN NOW() + INTERVAL '15 days'
                    WHEN '30_dias' THEN NOW() + INTERVAL '30 days'
                    WHEN 'mensal' THEN NOW() + INTERVAL '30 days'
                    WHEN 'bimestral' THEN NOW() + INTERVAL '60 days'
                    WHEN 'semestral' THEN NOW() + INTERVAL '180 days'
                    WHEN 'anual' THEN NOW() + INTERVAL '365 days'
                    ELSE NOW() + INTERVAL '30 days'
                END
            );
            RAISE NOTICE 'Critério inserido: %', criterio_data.titulo;
        ELSE
            RAISE NOTICE 'Critério já existe: %', criterio_data.titulo;
        END IF;
    END LOOP;
END $$;

-- 3. Inserir alertas iniciais (evitando duplicatas)
DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Buscar ID do admin
    SELECT id INTO admin_user_id FROM usuarios WHERE email = 'admin@jardim.ce.gov.br';
    
    IF admin_user_id IS NOT NULL THEN
        -- Inserir alertas apenas se não existirem
        INSERT INTO alertas (titulo, descricao, tipo, usuario_id, lido) 
        SELECT titulo, descricao, tipo, usuario_id, lido
        FROM (VALUES
            ('Sistema Migrado com Sucesso', 'O TranspJardim foi migrado para produção e está funcionando normalmente.', 'success', admin_user_id, false),
            ('Dados Importados', 'Todos os critérios e usuários foram importados do sistema anterior.', 'info', admin_user_id, false),
            ('Configuração Concluída', 'Base de dados configurada e pronta para uso em produção.', 'success', admin_user_id, false)
        ) AS alertas_data(titulo, descricao, tipo, usuario_id, lido)
        WHERE NOT EXISTS (
            SELECT 1 FROM alertas a WHERE a.titulo = alertas_data.titulo
        );
        
        RAISE NOTICE 'Alertas iniciais inseridos para admin';
    ELSE
        RAISE NOTICE 'Usuário admin não encontrado, alertas não inseridos';
    END IF;
END $$;

-- 4. Verificar resultados da migração
SELECT 
    'usuarios' as tabela,
    COUNT(*) as total_registros
FROM usuarios
UNION ALL
SELECT 
    'criterios' as tabela,
    COUNT(*) as total_registros
FROM criterios
UNION ALL
SELECT 
    'alertas' as tabela,
    COUNT(*) as total_registros
FROM alertas
ORDER BY tabela;

-- 5. Mostrar distribuição de critérios por secretaria
SELECT 
    secretaria,
    COUNT(*) as total_criterios,
    COUNT(CASE WHEN status = 'ativo' THEN 1 END) as ativos,
    COUNT(CASE WHEN status = 'pendente' THEN 1 END) as pendentes
FROM criterios
GROUP BY secretaria
ORDER BY secretaria;

RAISE NOTICE 'População de dados concluída com sucesso!';