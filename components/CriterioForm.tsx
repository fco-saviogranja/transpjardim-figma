import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Criterio } from '../types';
import { secretarias } from '../lib/mockData';

interface CriterioFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (criterio: Omit<Criterio, 'id'>) => void;
  editCriterio?: Criterio | null;
}

export const CriterioForm = ({ isOpen, onClose, onSubmit, editCriterio }: CriterioFormProps) => {
  const [formData, setFormData] = useState({
    nome: editCriterio?.nome || '',
    status: editCriterio?.status || 'ativo',
    valor: editCriterio?.valor || 0,
    meta: editCriterio?.meta || 100,
    dataVencimento: editCriterio?.dataVencimento || '',
    responsavel: editCriterio?.responsavel || '',
    secretaria: editCriterio?.secretaria || '',
    descricao: editCriterio?.descricao || '',
    periodicidade: editCriterio?.periodicidade || 'mensal'
  });

  const [loading, setLoading] = useState(false);



  const statusOptions = [
    { value: 'ativo', label: 'Ativo' },
    { value: 'pendente', label: 'Pendente' },
    { value: 'inativo', label: 'Inativo' },
    { value: 'vencido', label: 'Vencido' }
  ];

  const periodicidadeOptions = [
    { value: '15_dias', label: 'A cada 15 dias' },
    { value: '30_dias', label: 'A cada 30 dias' },
    { value: 'mensal', label: 'Mensal' },
    { value: 'bimestral', label: 'Bimestral' },
    { value: 'semestral', label: 'Semestral' },
    { value: 'anual', label: 'Anual' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validações básicas
      if (!formData.nome || !formData.responsavel || !formData.secretaria || !formData.periodicidade) {
        alert('Preencha todos os campos obrigatórios');
        return;
      }

      if (formData.valor < 0 || formData.valor > 100) {
        alert('O valor atual deve estar entre 0 e 100');
        return;
      }

      if (formData.meta < 0 || formData.meta > 100) {
        alert('A meta deve estar entre 0 e 100');
        return;
      }

      onSubmit({
        ...formData,
        status: formData.status as 'ativo' | 'inativo' | 'pendente' | 'vencido',
        periodicidade: formData.periodicidade as '15_dias' | '30_dias' | 'mensal' | 'bimestral' | 'semestral' | 'anual'
      });

      // Reset form
      setFormData({
        nome: '',
        status: 'ativo',
        valor: 0,
        meta: 100,
        dataVencimento: '',
        responsavel: '',
        secretaria: '',
        descricao: '',
        periodicidade: 'mensal'
      });

      onClose();
    } catch (error) {
      console.error('Erro ao salvar critério:', error);
      alert('Erro ao salvar critério. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editCriterio ? 'Editar Critério' : 'Novo Critério'}
          </DialogTitle>
          <DialogDescription>
            {editCriterio 
              ? 'Edite as informações do critério selecionado'
              : 'Preencha as informações para criar um novo critério'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome do Critério *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => handleChange('nome', e.target.value)}
                placeholder="Ex: Taxa de Escolarização Infantil"
                required
              />
            </div>



            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="secretaria">Secretaria *</Label>
              <Select value={formData.secretaria} onValueChange={(value) => handleChange('secretaria', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a secretaria" />
                </SelectTrigger>
                <SelectContent>
                  {secretarias.map(secretaria => (
                    <SelectItem key={secretaria} value={secretaria}>
                      {secretaria}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="responsavel">Responsável *</Label>
              <Input
                id="responsavel"
                value={formData.responsavel}
                onChange={(e) => handleChange('responsavel', e.target.value)}
                placeholder="Ex: João Silva"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="valor">Valor Atual (%)</Label>
              <Input
                id="valor"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formData.valor}
                onChange={(e) => handleChange('valor', parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="meta">Meta (%)</Label>
              <Input
                id="meta"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formData.meta}
                onChange={(e) => handleChange('meta', parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dataVencimento">Data de Vencimento</Label>
              <Input
                id="dataVencimento"
                type="date"
                value={formData.dataVencimento}
                onChange={(e) => handleChange('dataVencimento', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="periodicidade">Periodicidade *</Label>
              <Select value={formData.periodicidade} onValueChange={(value) => handleChange('periodicidade', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a periodicidade" />
                </SelectTrigger>
                <SelectContent>
                  {periodicidadeOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) => handleChange('descricao', e.target.value)}
                placeholder="Descreva os detalhes e objetivos do critério..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : (editCriterio ? 'Atualizar' : 'Criar Critério')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};