import { validateLogin } from '../lib/auth';
import { mockUsers } from '../lib/mockData';

/**
 * Utilitário para testar a autenticação
 */
export const runAuthTests = () => {
  console.log('🧪 Executando testes de autenticação...');
  
  // Test 1: Verificar se os usuários mock estão disponíveis
  console.log(`📋 ${mockUsers.length} usuários mock disponíveis:`, 
    mockUsers.map(u => `${u.username} (${u.role})`));
  
  // Test 2: Testar credenciais válidas
  const validCredentials = [
    { username: 'admin', password: 'admin' },
    { username: 'educacao', password: '123' },
    { username: 'saude', password: '123' },
    { username: 'obras', password: '123' },
    { username: 'ambiente', password: '123' }
  ];
  
  console.log('✅ Testando credenciais válidas:');
  validCredentials.forEach(cred => {
    const result = validateLogin(cred.username, cred.password);
    if (result) {
      console.log(`  ✓ ${cred.username}/${cred.password} → ${result.name} (${result.role})`);
    } else {
      console.log(`  ✗ ${cred.username}/${cred.password} → FALHOU`);
    }
  });
  
  // Test 3: Testar credenciais inválidas
  const invalidCredentials = [
    { username: 'admin', password: 'wrong' },
    { username: 'nonexistent', password: '123' },
    { username: 'educacao', password: 'wrong' }
  ];
  
  console.log('❌ Testando credenciais inválidas (devem falhar):');
  invalidCredentials.forEach(cred => {
    const result = validateLogin(cred.username, cred.password);
    if (!result) {
      console.log(`  ✓ ${cred.username}/${cred.password} → Corretamente rejeitado`);
    } else {
      console.log(`  ✗ ${cred.username}/${cred.password} → ERRO: Deveria ter sido rejeitado`);
    }
  });
  
  console.log('🏁 Testes de autenticação concluídos');
};

// Executar automaticamente em desenvolvimento
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
  // Adicionar comando global para testes
  (window as any).testAuth = runAuthTests;
  console.log('🔧 Digite testAuth() no console para executar testes de autenticação');
}