import React, { useState, useEffect } from 'react';
import {
  X,
  UserPlus,
  Users,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Edit2,
  Trash2,
  Search,
  CheckCircle2,
  AlertCircle,
  Lock,
  UserCheck,
  Mail,
  CreditCard,
  User,
  Filter,
  RefreshCw,
} from 'lucide-react';
import { AppUser, UserRole } from '../types';
import { fetchDbUsers, createDbUser, updateDbUser, deleteDbUser } from '../services/apiService';

interface UserCrudModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AppUser | null;
  onUserChanged?: () => void;
}

export const UserCrudModal: React.FC<UserCrudModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserChanged,
}) => {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'cliente'>('all');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form State
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [formData, setFormData] = useState<{
    fullName: string;
    name: string;
    email: string;
    cpf: string;
    role: UserRole;
    status: 'ativo' | 'inativo';
  }>({
    fullName: '',
    name: '',
    email: '',
    cpf: '',
    role: 'cliente',
    status: 'ativo',
  });
  const [formSubmitting, setFormSubmitting] = useState<boolean>(false);

  // Load users from PostgreSQL
  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await fetchDbUsers();
      setUsers(data);
    } catch (err) {
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadUsers();
      setFeedback(null);
    }
  }, [isOpen]);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => {
      setFeedback(null);
    }, 4500);
  };

  const handleOpenAddForm = () => {
    setEditingUserId(null);
    setFormData({
      fullName: '',
      name: '',
      email: '',
      cpf: '',
      role: 'cliente',
      status: 'ativo',
    });
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (user: AppUser) => {
    setEditingUserId(user.id);
    setFormData({
      fullName: user.fullName || user.displayName || '',
      name: user.name || '',
      email: user.email || '',
      cpf: user.cpf || '',
      role: user.role || 'cliente',
      status: user.status || 'ativo',
    });
    setIsFormOpen(true);
  };

  const handleFormatCpf = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.email.trim()) {
      showNotification('error', 'Nome Completo e Email são campos obrigatórios.');
      return;
    }

    setFormSubmitting(true);
    try {
      if (editingUserId) {
        // Update user
        const res = await updateDbUser(editingUserId, formData);
        if (res.success && res.user) {
          showNotification('success', `Usuário ${res.user.fullName} atualizado com sucesso!`);
          setIsFormOpen(false);
          await loadUsers();
          if (onUserChanged) onUserChanged();
        } else {
          showNotification('error', res.error || 'Erro ao atualizar usuário.');
        }
      } else {
        // Create user
        const res = await createDbUser(formData);
        if (res.success && res.user) {
          showNotification('success', `Usuário ${res.user.fullName} cadastrado com sucesso!`);
          setIsFormOpen(false);
          await loadUsers();
          if (onUserChanged) onUserChanged();
        } else {
          showNotification('error', res.error || 'Erro ao criar usuário.');
        }
      }
    } catch (err: any) {
      showNotification('error', err.message || 'Erro inesperado.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteUser = async (user: AppUser) => {
    if (user.email === 'emerson.dutra@gmail.com') {
      showNotification('error', 'O Administrador principal (Emerson Rocha Dutra) não pode ser excluído.');
      return;
    }

    if (currentUser?.id === user.id) {
      showNotification('error', 'Você não pode excluir sua própria conta conectada.');
      return;
    }

    const confirmDelete = window.confirm(`Deseja realmente excluir o usuário "${user.fullName}" (${user.email})?`);
    if (!confirmDelete) return;

    try {
      const res = await deleteDbUser(user.id);
      if (res.success) {
        showNotification('success', `Usuário "${user.fullName}" removido com sucesso.`);
        await loadUsers();
        if (onUserChanged) onUserChanged();
      } else {
        showNotification('error', res.error || 'Erro ao excluir usuário.');
      }
    } catch (err: any) {
      showNotification('error', err.message || 'Falha ao conectar com o servidor.');
    }
  };

  if (!isOpen) return null;

  // Filter users list
  const filteredUsers = users.filter((u) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      u.fullName.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      (u.cpf && u.cpf.includes(term));
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const totalAdmins = users.filter((u) => u.role === 'admin').length;
  const totalClientes = users.filter((u) => u.role === 'cliente').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0b1522] border border-[#1e293b] rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#1e293b] flex items-center justify-between bg-gradient-to-r from-[#0c2438] to-[#07131e]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#38bdf8]/15 border border-[#38bdf8]/40 flex items-center justify-center text-[#38bdf8] shadow-inner">
              <Users className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white font-display">
                  Gestão de Usuários (CRUD)
                </h2>
                <span className="text-[10px] bg-[#10b981]/20 text-[#10b981] font-bold px-2 py-0.5 rounded border border-[#10b981]/40 font-mono-numbers">
                  POSTGRESQL
                </span>
              </div>
              <p className="text-xs text-[#94a3b8] mt-0.5">
                Controle de perfis (Admin e Cliente) e permissões de acesso ao sistema
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadUsers}
              disabled={loading}
              title="Recarregar usuários"
              className="p-2 rounded-lg bg-[#162032] hover:bg-[#1e293b] text-[#94a3b8] hover:text-white transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg bg-[#162032] hover:bg-[#1e293b] text-[#94a3b8] hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`px-4 py-2.5 text-xs flex items-center gap-2 font-medium ${
              feedback.type === 'success'
                ? 'bg-[#10b981]/15 text-[#10b981] border-b border-[#10b981]/30'
                : 'bg-red-500/15 text-red-300 border-b border-red-500/30'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Action & Filter Toolbar */}
        <div className="p-4 bg-[#0d1c2d]/70 border-b border-[#1e293b] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#94a3b8] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por nome, email ou CPF..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#051424] border border-[#1e293b] rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-[#64748b] focus:outline-none focus:border-[#38bdf8]"
              />
            </div>

            {/* Filter buttons */}
            <div className="flex items-center bg-[#051424] p-0.5 rounded-xl border border-[#1e293b]">
              <button
                type="button"
                onClick={() => setRoleFilter('all')}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors cursor-pointer ${
                  roleFilter === 'all'
                    ? 'bg-[#38bdf8] text-[#07131e]'
                    : 'text-[#94a3b8] hover:text-white'
                }`}
              >
                Todos ({users.length})
              </button>
              <button
                type="button"
                onClick={() => setRoleFilter('admin')}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors cursor-pointer ${
                  roleFilter === 'admin'
                    ? 'bg-[#f59e0b] text-[#07131e]'
                    : 'text-[#94a3b8] hover:text-white'
                }`}
              >
                Admins ({totalAdmins})
              </button>
              <button
                type="button"
                onClick={() => setRoleFilter('cliente')}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors cursor-pointer ${
                  roleFilter === 'cliente'
                    ? 'bg-[#10b981] text-[#07131e]'
                    : 'text-[#94a3b8] hover:text-white'
                }`}
              >
                Clientes ({totalClientes})
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleOpenAddForm}
            className="px-3.5 py-1.5 bg-[#38bdf8] hover:bg-[#0ea5e9] text-[#07131e] font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
          >
            <UserPlus className="w-4 h-4 stroke-[2.2]" />
            <span>Novo Usuário</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3">
          {/* Form Modal overlay if open */}
          {isFormOpen && (
            <div className="p-4 bg-[#081829] border border-[#38bdf8]/40 rounded-2xl shadow-xl space-y-3 mb-4 animate-in slide-in-from-top duration-200">
              <div className="flex items-center justify-between pb-2 border-b border-[#1e293b]">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-[#38bdf8]" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white font-display">
                    {editingUserId ? 'Editar Usuário' : 'Cadastrar Novo Usuário'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="text-[#94a3b8] hover:text-white p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmitForm} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-[#94a3b8] block mb-1">
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Emerson Rocha Dutra"
                      value={formData.fullName}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData({
                          ...formData,
                          fullName: val,
                          name: formData.name || val.split(' ')[0] || '',
                        });
                      }}
                      className="w-full bg-[#051424] border border-[#1e293b] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#38bdf8]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-[#94a3b8] block mb-1">
                      Primeiro Nome / Apelido
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Emerson"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-[#051424] border border-[#1e293b] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#38bdf8]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-[#94a3b8] block mb-1">
                      Email de Acesso *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="Ex: emerson.dutra@gmail.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-[#051424] border border-[#1e293b] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#38bdf8]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-[#94a3b8] block mb-1">
                      CPF
                    </label>
                    <input
                      type="text"
                      placeholder="000.000.000-00"
                      maxLength={14}
                      value={formData.cpf}
                      onChange={(e) => setFormData({ ...formData, cpf: handleFormatCpf(e.target.value) })}
                      className="w-full bg-[#051424] border border-[#1e293b] rounded-xl px-3 py-2 text-xs text-white font-mono-numbers focus:outline-none focus:border-[#38bdf8]"
                    />
                  </div>

                  {/* Perfil Role Selector */}
                  <div>
                    <label className="text-[11px] font-bold text-[#94a3b8] block mb-1">
                      Perfil de Acesso *
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, role: 'admin' })}
                        className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                          formData.role === 'admin'
                            ? 'bg-[#f59e0b]/15 border-[#f59e0b] text-white shadow-md'
                            : 'bg-[#051424] border-[#1e293b] text-[#94a3b8] hover:border-[#38bdf8]/40'
                        }`}
                      >
                        <Shield className={`w-4 h-4 ${formData.role === 'admin' ? 'text-[#ffb95f]' : 'text-[#64748b]'}`} />
                        <div className="text-left">
                          <div className="text-xs font-bold">Admin</div>
                          <div className="text-[9px] text-[#94a3b8]">Acesso Total + CRUD</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, role: 'cliente' })}
                        className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                          formData.role === 'cliente'
                            ? 'bg-[#10b981]/15 border-[#10b981] text-white shadow-md'
                            : 'bg-[#051424] border-[#1e293b] text-[#94a3b8] hover:border-[#38bdf8]/40'
                        }`}
                      >
                        <User className={`w-4 h-4 ${formData.role === 'cliente' ? 'text-[#10b981]' : 'text-[#64748b]'}`} />
                        <div className="text-left">
                          <div className="text-xs font-bold">Cliente</div>
                          <div className="text-[9px] text-[#94a3b8]">Carteira & Aportes</div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Status Selector */}
                  <div>
                    <label className="text-[11px] font-bold text-[#94a3b8] block mb-1">
                      Status da Conta
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, status: 'ativo' })}
                        className={`p-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                          formData.status === 'ativo'
                            ? 'bg-[#10b981]/20 border-[#10b981] text-[#10b981]'
                            : 'bg-[#051424] border-[#1e293b] text-[#94a3b8]'
                        }`}
                      >
                        <span className="w-2 h-2 rounded-full bg-[#10b981]" />
                        Ativo
                      </button>

                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, status: 'inativo' })}
                        className={`p-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                          formData.status === 'inativo'
                            ? 'bg-red-500/20 border-red-500 text-red-400'
                            : 'bg-[#051424] border-[#1e293b] text-[#94a3b8]'
                        }`}
                      >
                        <span className="w-2 h-2 rounded-full bg-red-400" />
                        Inativo
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1e293b]">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-3 py-1.5 bg-[#162032] hover:bg-[#1e293b] text-xs font-semibold text-[#94a3b8] hover:text-white rounded-xl transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={formSubmitting}
                    className="px-4 py-1.5 bg-[#38bdf8] hover:bg-[#0ea5e9] text-[#07131e] text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-md flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {formSubmitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                    <span>{editingUserId ? 'Salvar Alterações' : 'Salvar Usuário'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Users Table / Cards List */}
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-[#94a3b8]">
              <RefreshCw className="w-6 h-6 animate-spin text-[#38bdf8] mb-2" />
              <p className="text-xs">Carregando usuários do PostgreSQL...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-10 text-center text-[#94a3b8] bg-[#0d1c2d] border border-[#1e293b] rounded-2xl">
              <Users className="w-8 h-8 mx-auto text-[#64748b] mb-2" />
              <p className="text-xs font-bold text-white">Nenhum usuário encontrado</p>
              <p className="text-[11px] text-[#64748b] mt-1">Tente ajustar os filtros ou cadastre um novo usuário.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredUsers.map((user) => {
                const isAdmin = user.role === 'admin';
                const isMasterAdmin = user.email === 'emerson.dutra@gmail.com';
                const isCurrentLogged = currentUser?.id === user.id || currentUser?.email === user.email;

                return (
                  <div
                    key={user.id}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      isAdmin
                        ? 'bg-gradient-to-r from-[#0d1f30] to-[#091724] border-[#f59e0b]/30 hover:border-[#f59e0b]/60'
                        : 'bg-[#0d1c2d] border-[#1e293b] hover:border-[#38bdf8]/40'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      {/* Left: User Identity */}
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                            isAdmin
                              ? 'bg-[#f59e0b]/15 border-[#f59e0b]/40 text-[#ffb95f]'
                              : 'bg-[#10b981]/15 border-[#10b981]/40 text-[#10b981]'
                          }`}
                        >
                          {isAdmin ? (
                            <Shield className="w-5 h-5 stroke-[2.2]" />
                          ) : (
                            <User className="w-5 h-5 stroke-[2.2]" />
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-xs sm:text-sm font-bold text-white font-display">
                              {user.fullName || user.displayName || user.name}
                            </h4>

                            {/* Role Badge */}
                            {isAdmin ? (
                              <span className="text-[9px] bg-[#f59e0b]/20 text-[#ffb95f] font-bold px-2 py-0.5 rounded-full border border-[#f59e0b]/40 flex items-center gap-1 font-mono-numbers">
                                <Shield className="w-2.5 h-2.5" />
                                ADMIN
                              </span>
                            ) : (
                              <span className="text-[9px] bg-[#10b981]/20 text-[#10b981] font-bold px-2 py-0.5 rounded-full border border-[#10b981]/40 flex items-center gap-1 font-mono-numbers">
                                <User className="w-2.5 h-2.5" />
                                CLIENTE
                              </span>
                            )}

                            {/* Status Badge */}
                            {user.status === 'ativo' ? (
                              <span className="text-[9px] bg-[#10b981]/15 text-[#10b981] font-semibold px-1.5 py-0.2 rounded border border-[#10b981]/30">
                                Ativo
                              </span>
                            ) : (
                              <span className="text-[9px] bg-red-500/15 text-red-400 font-semibold px-1.5 py-0.2 rounded border border-red-500/30">
                                Inativo
                              </span>
                            )}

                            {isCurrentLogged && (
                              <span className="text-[9px] bg-[#38bdf8]/20 text-[#38bdf8] font-bold px-1.5 py-0.2 rounded border border-[#38bdf8]/30">
                                VOCÊ
                              </span>
                            )}
                          </div>

                          {/* Details row: Email & CPF */}
                          <div className="flex items-center gap-4 text-[11px] text-[#94a3b8] mt-1 flex-wrap font-mono-numbers">
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3 text-[#64748b]" />
                              {user.email}
                            </span>
                            {user.cpf && (
                              <span className="flex items-center gap-1">
                                <CreditCard className="w-3 h-3 text-[#64748b]" />
                                CPF: {user.cpf}
                              </span>
                            )}
                            {user.name && user.name !== user.fullName && (
                              <span className="text-[#64748b]">
                                Login: <strong className="text-white">{user.name}</strong>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                        <button
                          type="button"
                          onClick={() => handleOpenEditForm(user)}
                          className="px-2.5 py-1.5 rounded-lg bg-[#162032] hover:bg-[#1e293b] text-[#38bdf8] hover:text-white border border-[#1e293b] text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Editar</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteUser(user)}
                          disabled={isMasterAdmin}
                          title={isMasterAdmin ? 'Administrador principal não pode ser excluído' : 'Excluir usuário'}
                          className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-colors ${
                            isMasterAdmin
                              ? 'bg-gray-800/40 text-gray-500 border-gray-800 cursor-not-allowed opacity-50'
                              : 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/30 cursor-pointer'
                          }`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Excluir</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-[#07131e] border-t border-[#1e293b] flex items-center justify-between text-[11px] text-[#94a3b8] px-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#10b981]" />
            <span>Perfil <strong>admin</strong> possui autoridade total sobre cadastros, liquidações e rebalanceamento.</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 bg-[#162032] hover:bg-[#1e293b] text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
