// build.js
import { build } from 'vite';

async function runBuild() {
  try {
    await build();
    console.log('✅ Build concluído com sucesso.');
  } catch (err) {
    console.error('❌ Erro durante o build:');
    console.error(err);
    process.exit(1);
  }
}

runBuild();
