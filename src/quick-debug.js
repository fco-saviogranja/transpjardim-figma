#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🔍 DEBUG RÁPIDO - BUILD LOCAL\n');

// 1. Verificar se todas as deps estão instaladas
console.log('1. Verificando node_modules...');
try {
  const hasNodeModules = require('fs').existsSync('node_modules');
  console.log(`${hasNodeModules ? '✅' : '❌'} node_modules: ${hasNodeModules}`);
  
  if (!hasNodeModules) {
    console.log('📦 Instalando dependências...');
    execSync('npm install', { stdio: 'inherit' });
  }
} catch (error) {
  console.log(`❌ Erro node_modules: ${error.message}`);
}

// 2. Testar TypeScript
console.log('\n2. Testando TypeScript...');
try {
  execSync('npx tsc --noEmit --skipLibCheck', { 
    stdio: 'pipe',
    timeout: 30000
  });
  console.log('✅ TypeScript OK');
} catch (error) {
  console.log('❌ Erro TypeScript:');
  console.log(error.stdout?.toString() || error.message);
}

// 3. Tentar build com mais detalhes
console.log('\n3. Tentando build...');
try {
  const output = execSync('npm run build', { 
    stdio: 'pipe',
    timeout: 60000,
    encoding: 'utf8'
  });
  console.log('✅ Build sucesso!');
  console.log('Output:', output);
  
  // Verificar se dist foi criado
  const distExists = require('fs').existsSync('dist');
  console.log(`${distExists ? '✅' : '❌'} Pasta dist: ${distExists}`);
  
} catch (error) {
  console.log('❌ Build falhou:');
  console.log('Status:', error.status);
  console.log('STDOUT:', error.stdout?.toString());
  console.log('STDERR:', error.stderr?.toString());
}

console.log('\n🎯 Debug completo!');