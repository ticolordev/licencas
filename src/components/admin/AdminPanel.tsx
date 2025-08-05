import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit, Trash2, Key, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: AdminUser | null;
  onSave: (userData: any) => Promise<void>;
}

function UserModal({ isOpen, onClose, user, onSave }: UserModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    is_active: true,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        password: '',
        is_active: user.is_active,
      });
    } else {
      setFormData({
        name: '',
        email: '',
        password: '',
        is_active: true,
      });
    }
  }, [user, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || (!user && !formData.password)) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(formData);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">
            {user ? 'Editar Usuário' : 'Novo Usuário'}
          </h2>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={onClose}
            disabled={isSubmitting}
          >
            ×
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Nome completo"
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="usuario@email.com"
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <Label htmlFor="password">
              {user ? 'Nova Senha (deixe em branco para manter)' : 'Senha *'}
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Digite a senha"
                required={!user}
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                disabled={isSubmitting}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
              disabled={isSubmitting}
            />
            <Label htmlFor="is_active">Usuário Ativo</Label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Salvando...' : (user ? 'Atualizar' : 'Criar')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: AdminUser | null;
  onSave: (password: string) => Promise<void>;
}

function PasswordModal({ isOpen, onClose, user, onSave }: PasswordModalProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password || password !== confirmPassword) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(password);
      onClose();
      setPassword('');
      setConfirmPassword('');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Alterar Senha</h2>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={onClose}
            disabled={isSubmitting}
          >
            ×
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-4">
              Alterando senha para: <strong>{user.name}</strong>
            </p>
          </div>

          <div>
            <Label htmlFor="password">Nova Senha *</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite a nova senha"
                required
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                disabled={isSubmitting}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <Label htmlFor="confirmPassword">Confirmar Senha *</Label>
            <Input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirme a nova senha"
              required
              disabled={isSubmitting}
            />
            {password && confirmPassword && password !== confirmPassword && (
              <p className="text-sm text-red-600 mt-1">As senhas não coincidem</p>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !password || password !== confirmPassword}
            >
              {isSubmitting ? 'Alterando...' : 'Alterar Senha'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function AdminPanel() {
  const { createUser, updateUser, deleteUser, changePassword, getAllUsers } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const usersData = await getAllUsers();
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleAddUser = () => {
    setEditingUser(null);
    setIsUserModalOpen(true);
  };

  const handleEditUser = (user: AdminUser) => {
    setEditingUser(user);
    setIsUserModalOpen(true);
  };

  const handleChangePassword = (user: AdminUser) => {
    setEditingUser(user);
    setIsPasswordModalOpen(true);
  };

  const handleDeleteUser = async (user: AdminUser) => {
    if (window.confirm(`Tem certeza que deseja excluir o usuário "${user.name}"?`)) {
      try {
        await deleteUser(user.id);
        await loadUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const handleSaveUser = async (userData: any) => {
    try {
      if (editingUser) {
        await updateUser(editingUser.id, userData);
        if (userData.password) {
          await changePassword(editingUser.id, userData.password);
        }
      } else {
        await createUser(userData);
      }
      await loadUsers();
    } catch (error) {
      console.error('Error saving user:', error);
      throw error;
    }
  };

  const handleSavePassword = async (password: string) => {
    if (editingUser) {
      try {
        await changePassword(editingUser.id, password);
        await loadUsers();
      } catch (error) {
        console.error('Error changing password:', error);
        throw error;
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Painel Administrativo</h1>
          <p className="text-gray-500">Gerencie usuários do sistema</p>
        </div>
        <Button onClick={handleAddUser} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Novo Usuário
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Usuários do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Carregando usuários...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Nenhum usuário encontrado</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left p-4 font-medium text-gray-700">Nome</th>
                    <th className="text-left p-4 font-medium text-gray-700">Email</th>
                    <th className="text-left p-4 font-medium text-gray-700">Status</th>
                    <th className="text-left p-4 font-medium text-gray-700">Criado em</th>
                    <th className="text-right p-4 font-medium text-gray-700">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <div className="font-medium text-gray-900">{user.name}</div>
                      </td>
                      <td className="p-4 text-gray-600">{user.email}</td>
                      <td className="p-4">
                        <Badge 
                          variant={user.is_active ? 'default' : 'secondary'}
                          className={user.is_active ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'}
                        >
                          {user.is_active ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </td>
                      <td className="p-4 text-gray-600 text-sm">
                        {formatDate(user.created_at)}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditUser(user)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleChangePassword(user)}
                          >
                            <Key className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteUser(user)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <UserModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        user={editingUser}
        onSave={handleSaveUser}
      />

      <PasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        user={editingUser}
        onSave={handleSavePassword}
      />
    </div>
  );
}