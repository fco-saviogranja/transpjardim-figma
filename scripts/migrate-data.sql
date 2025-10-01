-- Script para migrar dados mock para produção
-- Execute no Supabase SQL Editor após deploy

-- Inserir critérios de exemplo
INSERT INTO public.criterios (nome, descricao, secretaria, tipo, periodicidade, valor, meta, status, prazo, responsavel) VALUES
('Transparência Orçamentária', 'Publicação mensal de relatórios orçamentários detalhados', 'Secretaria de Finanças', 'indicador', 'mensal', 85, 100, 'ativo', '2024-12-31', 'João Silva'),
('Atendimento ao Cidadão', 'Meta de atendimento em até 30 minutos', 'Secretaria de Administração', 'meta', '30_dias', 78, 90, 'ativo', '2024-12-15', 'Maria Santos'),
('Obras Públicas', 'Acompanhamento de cronograma de obras', 'Secretaria de Infraestrutura', 'processo', 'bimestral', 65, 80, 'pendente', '2024-11-30', 'Carlos Lima'),
('Saúde Básica', 'Cobertura de vacinação infantil', 'Secretaria de Saúde', 'indicador', 'mensal', 92, 95, 'ativo', '2024-12-10', 'Ana Costa'),
('Educação Fundamental', 'Taxa de aprovação escolar', 'Secretaria de Educação', 'meta', 'semestral', 88, 95, 'ativo', '2024-12-20', 'Pedro Oliveira');

-- Inserir alertas de exemplo
INSERT INTO public.alertas (titulo, descricao, tipo, lido) VALUES
('Relatório Mensal Pendente', 'O relatório orçamentário de outubro ainda não foi publicado', 'warning', false),
('Meta de Atendimento Atingida', 'Parabéns! A meta de atendimento foi superada este mês', 'success', false),
('Obra com Atraso', 'A obra da Praça Central apresenta 15 dias de atraso', 'error', true),
('Campanha de Vacinação', 'Nova campanha de vacinação iniciada com sucesso', 'info', false);