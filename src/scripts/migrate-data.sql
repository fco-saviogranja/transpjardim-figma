-- Script de Migração de Dados para TranspJardim
-- Execute este script no SQL Editor do Supabase após criar as tabelas

-- 1. Inserir dados iniciais de usuários
INSERT INTO usuarios (email, nome, role, secretaria, ativo) VALUES
('admin@jardim.ce.gov.br', 'Administrador do Sistema', 'admin', 'Controladoria', true),
('secretario.saude@jardim.ce.gov.br', 'Secretário de Saúde', 'user', 'Secretaria de Saúde', true),
('secretario.educacao@jardim.ce.gov.br', 'Secretário de Educação', 'user', 'Secretaria de Educação', true),
('secretario.obras@jardim.ce.gov.br', 'Secretário de Obras', 'user', 'Secretaria de Obras', true),
('secretario.assistencia@jardim.ce.gov.br', 'Secretário de Assistência Social', 'user', 'Secretaria de Assistência Social', true),
('demo@jardim.ce.gov.br', 'Usuário Demonstração', 'user', 'Secretaria de Saúde', true);

-- 2. Inserir critérios iniciais baseados nos dados mock
INSERT INTO criterios (titulo, descricao, secretaria, periodicidade, valor, meta, status, data_vencimento) VALUES

-- Secretaria de Saúde
('Atendimentos Médicos Realizados', 'Número total de atendimentos médicos na rede municipal de saúde', 'Secretaria de Saúde', 'mensal', 850, 100, 'ativo', NOW() + INTERVAL '30 days'),
('Vacinas Aplicadas', 'Quantidade de vacinas aplicadas conforme cronograma nacional', 'Secretaria de Saúde', '15_dias', 920, 100, 'ativo', NOW() + INTERVAL '15 days'),
('Consultas Especializadas', 'Atendimentos em especialidades médicas (cardiologia, pediatria, etc.)', 'Secretaria de Saúde', 'mensal', 640, 100, 'pendente', NOW() + INTERVAL '30 days'),
('Cirurgias Eletivas Realizadas', 'Procedimentos cirúrgicos não urgentes realizados', 'Secretaria de Saúde', 'bimestral', 45, 100, 'ativo', NOW() + INTERVAL '60 days'),
('Exames Laboratoriais', 'Exames de laboratório realizados pela rede municipal', 'Secretaria de Saúde', '30_dias', 1200, 100, 'ativo', NOW() + INTERVAL '30 days'),

-- Secretaria de Educação  
('Alunos Matriculados', 'Total de estudantes matriculados na rede municipal de ensino', 'Secretaria de Educação', 'anual', 2850, 100, 'ativo', NOW() + INTERVAL '365 days'),
('Professores Capacitados', 'Docentes que participaram de cursos de capacitação', 'Secretaria de Educação', 'semestral', 180, 100, 'ativo', NOW() + INTERVAL '180 days'),
('Escolas com Internet', 'Unidades escolares com acesso à internet banda larga', 'Secretaria de Educação', 'anual', 95, 100, 'ativo', NOW() + INTERVAL '365 days'),
('Merenda Escolar Servida', 'Refeições escolares servidas diariamente', 'Secretaria de Educação', 'mensal', 4200, 100, 'ativo', NOW() + INTERVAL '30 days'),
('Livros Didáticos Distribuídos', 'Livros entregues aos estudantes no início do ano letivo', 'Secretaria de Educação', 'anual', 5700, 100, 'pendente', NOW() + INTERVAL '365 days'),

-- Secretaria de Obras
('Estradas Pavimentadas', 'Quilômetros de vias pavimentadas ou recuperadas', 'Secretaria de Obras', 'semestral', 12, 100, 'ativo', NOW() + INTERVAL '180 days'),
('Obras Públicas Concluídas', 'Projetos de infraestrutura finalizados no período', 'Secretaria de Obras', 'bimestral', 3, 100, 'ativo', NOW() + INTERVAL '60 days'),
('Sistemas de Drenagem', 'Metros lineares de drenagem pluvial instalados', 'Secretaria de Obras', 'anual', 2400, 100, 'pendente', NOW() + INTERVAL '365 days'),
('Praças Revitalizadas', 'Espaços públicos reformados e revitalizados', 'Secretaria de Obras', 'semestral', 2, 100, 'ativo', NOW() + INTERVAL '180 days'),
('Pontes e Pontilhões', 'Estruturas construídas ou reformadas para transposição', 'Secretaria de Obras', 'anual', 1, 100, 'ativo', NOW() + INTERVAL '365 days'),

-- Secretaria de Assistência Social
('Famílias Cadastradas', 'Famílias inscritas no Cadastro Único (CadÚnico)', 'Secretaria de Assistência Social', 'mensal', 1250, 100, 'ativo', NOW() + INTERVAL '30 days'),
('Benefícios Concedidos', 'Auxílios e benefícios sociais distribuídos', 'Secretaria de Assistência Social', 'mensal', 850, 100, 'ativo', NOW() + INTERVAL '30 days'),
('Atendimentos CRAS', 'Atendimentos realizados no Centro de Referência de Assistência Social', 'Secretaria de Assistência Social', '15_dias', 420, 100, 'ativo', NOW() + INTERVAL '15 days'),
('Programas Sociais Ativos', 'Programas de assistência social em funcionamento', 'Secretaria de Assistência Social', 'bimestral', 8, 100, 'ativo', NOW() + INTERVAL '60 days'),
('Idosos Atendidos', 'Pessoas da terceira idade assistidas pelos programas municipais', 'Secretaria de Assistência Social', 'mensal', 320, 100, 'pendente', NOW() + INTERVAL '30 days');

-- 3. Inserir alguns alertas iniciais
INSERT INTO alertas (titulo, descricao, tipo, usuario_id, lido) VALUES
('Sistema Implantado com Sucesso', 'O TranspJardim foi migrado para produção e está funcionando normalmente.', 'success', 
 (SELECT id FROM usuarios WHERE email = 'admin@jardim.ce.gov.br'), false),
 
('Critérios Pendentes', 'Existem critérios com prazo próximo ao vencimento que precisam de atenção.', 'warning',
 (SELECT id FROM usuarios WHERE email = 'admin@jardim.ce.gov.br'), false),
 
('Bem-vindo ao TranspJardim', 'Sistema de transparência e monitoramento da Controladoria Municipal de Jardim/CE está ativo.', 'info',
 (SELECT id FROM usuarios WHERE email = 'admin@jardim.ce.gov.br'), false);

-- 4. Inserir algumas conclusões de exemplo (opcional)
-- Estas podem ser removidas se preferir começar com dados limpos
INSERT INTO criterio_conclusoes (criterio_id, usuario_id, concluido, data_conclusao, observacoes) VALUES
-- Marcar algumas conclusões para o usuário demo
((SELECT id FROM criterios WHERE titulo = 'Vacinas Aplicadas' LIMIT 1),
 (SELECT id FROM usuarios WHERE email = 'demo@jardim.ce.gov.br'), 
 true, NOW() - INTERVAL '2 days', 'Campanha de vacinação realizada com sucesso'),

((SELECT id FROM criterios WHERE titulo = 'Atendimentos Médicos Realizados' LIMIT 1),
 (SELECT id FROM usuarios WHERE email = 'demo@jardim.ce.gov.br'), 
 true, NOW() - INTERVAL '1 day', 'Meta atingida no período');

-- 5. Atualizar timestamps
UPDATE criterios SET updated_at = NOW();
UPDATE usuarios SET updated_at = NOW();

-- 6. Verificar dados inseridos
SELECT 'Usuários inseridos:' as tipo, COUNT(*) as quantidade FROM usuarios
UNION ALL
SELECT 'Critérios inseridos:', COUNT(*) FROM criterios  
UNION ALL
SELECT 'Alertas inseridos:', COUNT(*) FROM alertas
UNION ALL
SELECT 'Conclusões inseridas:', COUNT(*) FROM criterio_conclusoes;

-- Verificar distribuição por secretaria
SELECT secretaria, COUNT(*) as total_criterios 
FROM criterios 
GROUP BY secretaria 
ORDER BY secretaria;