import { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Users, Edit, Trash2, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from './ui/dialog';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Alert, AlertDescription } from './ui/alert';
import { toast } from '../utils/toast';
import { useSupabase } from '../hooks/useSupabase';
import { User } from '../types';
import { secretarias, mockUsers } from '../lib/mockData';

interface UserFormData {
  name: string;
  username: string;
  password: string;
  role: 'admin' | 'padrão';
  secretaria?: string;
}

export const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [backendAvailable, setBackendAvailable] = useState(true);
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    username: '',
    password: '',
    role: 'padrão',
    secretaria: ''
  });

  const supabase = useSupabase();

  // Carregar usuários
  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await supabase.getUsers();
      if (response.success && response.data) {
        setUsers(response.data);
        setBackendAvailable(true);
      } else {
        console.error('Erro ao carregar usuários:', response.error);
        
        // Se o backend não está disponível, usar dados mock
        if (response.error?.includes('Failed to fetch') || 
            response.error?.includes('NetworkError')) {
          setBackendAvailable(false);
          setUsers(mockUsers);
          toast.error('Backend indisponível. Usando dados de demonstração.');
        } else {
          toast.error('Erro ao carregar usuários');
        }
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      setBackendAvailable(false);
      setUsers(mockUsers);
      toast.error('Servidor indisponível. Modo demonstração ativado.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Filtrar usuários baseado na busca
  const filteredUsers = useMemo(() => {
    return users.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.secretaria && user.secretaria.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [users, searchTerm]);

  const handleOpenDialog = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        username: user.username,
        password: '', // Não pré-preencher senha para edição
        role: user.role,
        secretaria: user.secretaria || ''
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        username: '',
        password: '',
        role: 'padrão',
        secretaria: ''
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingUser(null);
    setShowPassword(false);
    setFormData({
      name: '',
      username: '',
      password: '',
      role: 'padrão',
      secretaria: ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação
    if (!formData.name.trim() || !formData.username.trim()) {
      toast.error('Nome e usuário são obrigatórios');
      return;
    }

    if (!editingUser && !formData.password.trim()) {
      toast.error('Senha é obrigatória para novos usuários');
      return;
    }

    if (formData.role === 'padrão' && !formData.secretaria) {
      toast.error('Usuários padrão devem ter uma secretaria associada');
      return;
    }

    setLoading(true);

    try {
      if (!backendAvailable) {
        // Modo demonstração - simular operação
        if (editingUser) {
          setUsers(prev => prev.map(user => 
            user.id === editingUser.id 
              ? { 
                  ...user, 
                  name: formData.name,
                  username: formData.username,
                  role: formData.role,
                  secretaria: formData.role === 'admin' ? undefined : formData.secretaria
                }
              : user
          ));
          toast.success('Usuário atualizado (modo demonstração)');
        } else {
          const newUser: User = {
            id: `demo_${Date.now()}`,
            name: formData.name,
            username: formData.username,
            role: formData.role,
            secretaria: formData.role === 'admin' ? undefined : formData.secretaria
          };
          setUsers(prev => [...prev, newUser]);
          toast.success('Usuário criado (modo demonstração)');
        }
        handleCloseDialog();
        return;
      }

      if (editingUser) {
        // Atualizar usuário
        const response = await supabase.updateUser(editingUser.id, {
          name: formData.name,
          username: formData.username,
          ...(formData.password && { password: formData.password }),
          role: formData.role,
          secretaria: formData.role === 'admin' ? undefined : formData.secretaria
        });

        if (response.success) {
          toast.success('Usuário atualizado com sucesso');
          loadUsers();
          handleCloseDialog();
        } else {
          toast.error(response.error || 'Erro ao atualizar usuário');
        }
      } else {
        // Criar novo usuário
        const response = await supabase.createUser({
          name: formData.name,
          username: formData.username,
          password: formData.password,
          role: formData.role,
          secretaria: formData.role === 'admin' ? undefined : formData.secretaria
        });

        if (response.success) {
          toast.success('Usuário criado com sucesso');
          loadUsers();
          handleCloseDialog();
        } else {
          toast.error(response.error || 'Erro ao criar usuário');
        }
      }
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
      toast.error('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Tem certeza que deseja excluir o usuário "${userName}"?`)) {
      return;
    }

    setLoading(true);
    try {
      if (!backendAvailable) {
        // Modo demonstração
        setUsers(prev => prev.filter(user => user.id !== userId));
        toast.success('Usuário excluído (modo demonstração)');
        return;
      }

      const response = await supabase.deleteUser(userId);
      
      if (response.success) {
        toast.success('Usuário excluído com sucesso');
        loadUsers();
      } else {
        toast.error(response.error || 'Erro ao excluir usuário');
      }
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      toast.error('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-[var(--jardim-green)] p-2 rounded-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-[var(--jardim-green)]">Gerenciamento de Usuários</CardTitle>
                <CardDescription>
                  Gerencie usuários do sistema TranspJardim
                </CardDescription>
              </div>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => handleOpenDialog()} className="bg-[var(--jardim-green)] hover:bg-[var(--jardim-green-light)]">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Usuário
                </Button>
              </DialogTrigger>
              
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>
                    {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingUser ? 'Edite as informações do usuário' : 'Preencha os dados do novo usuário'}
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ex: João Silva"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username">Nome de Usuário</Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                      placeholder="Ex: joao.silva"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">
                      {editingUser ? 'Nova Senha (deixe vazio para não alterar)' : 'Senha'}
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                        placeholder={editingUser ? "Digite apenas se quiser alterar" : "Digite a senha"}
                        required={!editingUser}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">Nível de Acesso</Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value: 'admin' | 'padrão') => 
                        setFormData(prev => ({ 
                          ...prev, 
                          role: value,
                          secretaria: value === 'admin' ? '' : prev.secretaria
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="padrão">Usuário Padrão</SelectItem>
                        <SelectItem value="admin">Administrador</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.role === 'padrão' && (
                    <div className="space-y-2">
                      <Label htmlFor="secretaria">Secretaria</Label>
                      <Select
                        value={formData.secretaria}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, secretaria: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a secretaria" />
                        </SelectTrigger>
                        <SelectContent>
                          {secretarias.map((secretaria) => (
                            <SelectItem key={secretaria} value={secretaria}>
                              {secretaria}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {formData.role === 'admin' && (
                    <Alert>
                      <AlertDescription>
                        Administradores têm acesso a todos os critérios e funcionalidades do sistema.
                      </AlertDescription>
                    </Alert>
                  )}

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCloseDialog}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="bg-[var(--jardim-green)] hover:bg-[var(--jardim-green-light)]"
                    >
                      {loading ? 'Salvando...' : editingUser ? 'Atualizar' : 'Criar'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {/* Aviso sobre modo demonstração */}
            {!backendAvailable && (
              <Alert className="border-amber-200 bg-amber-50">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  <strong>Modo Demonstração:</strong> O backend não está disponível. 
                  As alterações são temporárias e serão perdidas ao recarregar a página.
                </AlertDescription>
              </Alert>
            )}

            {/* Barra de pesquisa */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por nome, usuário ou secretaria..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg border">
                <div className="text-2xl font-bold text-blue-600">{users.length}</div>
                <div className="text-sm text-blue-600">Total de Usuários</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border">
                <div className="text-2xl font-bold text-green-600">
                  {users.filter(u => u.role === 'admin').length}
                </div>
                <div className="text-sm text-green-600">Administradores</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg border">
                <div className="text-2xl font-bold text-purple-600">
                  {users.filter(u => u.role === 'padrão').length}
                </div>
                <div className="text-sm text-purple-600">Usuários Padrão</div>
              </div>
            </div>

            {/* Tabela de usuários */}
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Nível</TableHead>
                    <TableHead>Secretaria</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <div className="flex items-center justify-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[var(--jardim-green)]"></div>
                          <span>Carregando usuários...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                        {searchTerm ? 'Nenhum usuário encontrado' : 'Nenhum usuário cadastrado'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell className="font-mono text-sm">{user.username}</TableCell>
                        <TableCell>
                          <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                            {user.role === 'admin' ? 'Administrador' : 'Usuário Padrão'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.secretaria ? (
                            <span className="text-sm">{user.secretaria}</span>
                          ) : (
                            <span className="text-sm text-gray-400">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenDialog(user)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteUser(user.id, user.name)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};