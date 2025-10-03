#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 DEBUGANDO PROBLEMAS DE BUILD...\n');

// 1. Verificar Node.js version
console.log('📦 Node.js Version:');
try {
  const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
  console.log(`✅ ${nodeVersion}\n`);
} catch (error) {
  console.log(`❌ Erro ao verificar Node.js: ${error.message}\n`);
}

// 2. Verificar npm version
console.log('📦 NPM Version:');
try {
  const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
  console.log(`✅ ${npmVersion}\n`);
} catch (error) {
  console.log(`❌ Erro ao verificar NPM: ${error.message}\n`);
}

// 3. Verificar package.json
console.log('📋 Verificando package.json:');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  console.log(`✅ Nome: ${packageJson.name}`);
  console.log(`✅ Versão: ${packageJson.version}`);
  console.log(`✅ Scripts disponíveis: ${Object.keys(packageJson.scripts).join(', ')}\n`);
} catch (error) {
  console.log(`❌ Erro ao ler package.json: ${error.message}\n`);
}

// 4. Verificar dependências instaladas
console.log('📦 Verificando node_modules:');
try {
  const nodeModulesExists = fs.existsSync('node_modules');
  console.log(`${nodeModulesExists ? '✅' : '❌'} node_modules existe: ${nodeModulesExists}\n`);
} catch (error) {
  console.log(`❌ Erro ao verificar node_modules: ${error.message}\n`);
}

// 5. Verificar arquivos críticos
console.log('📁 Verificando arquivos críticos:');
const criticalFiles = [
  'App.tsx',
  'index.html',
  'vite.config.ts',
  'tsconfig.json',
  'netlify.toml'
];

criticalFiles.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`${exists ? '✅' : '❌'} ${file}`);
});
console.log('');

// 6. Tentar TypeScript check
console.log('🔍 Verificando TypeScript:');
try {
  execSync('npx tsc --noEmit', { encoding: 'utf8', stdio: 'pipe' });
  console.log('✅ TypeScript check passou\n');
} catch (error) {
  console.log('❌ Erro no TypeScript check:');
  console.log(error.stdout || error.message);
  console.log('');
}

// 7. Verificar imports problemáticos
console.log('🔍 Verificando imports figma:asset:');
try {
  const checkCommand = `grep -r "figma:asset" --include="*.tsx" --include="*.ts" . || echo "Nenhum import figma:asset encontrado"`;
  const result = execSync(checkCommand, { encoding: 'utf8' });
  console.log(result);
} catch (error) {
  console.log('✅ Nenhum import figma:asset problemático encontrado\n');
}

// 8. Tentar build
console.log('🏗️ Tentando build local:');
try {
  console.log('Executando: npm run build');
  const buildOutput = execSync('npm run build', { 
    encoding: 'utf8', 
    stdio: 'pipe',
    timeout: 60000 // 1 minuto timeout
  });
  console.log('✅ Build bem-sucedido!');
  console.log('Saída:', buildOutput);
  
  // Verificar se dist foi criado
  const distExists = fs.existsSync('dist');
  console.log(`${distExists ? '✅' : '❌'} Pasta dist criada: ${distExists}`);
  
  if (distExists) {
    const distFiles = fs.readdirSync('dist');
    console.log(`📁 Arquivos em dist: ${distFiles.join(', ')}`);
  }
  
} catch (error) {
  console.log('❌ Build falhou:');
  console.log('STDOUT:', error.stdout);
  console.log('STDERR:', error.stderr);
  console.log('Código de saída:', error.status);
}

console.log('\n🎯 DIAGNÓSTICO COMPLETO!');