/**
 * Script para backup dos dados do TranspJardim
 * Execute com: node scripts/backup-data.js
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// Configuração do Supabase
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórias')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function backupData() {
  try {
    console.log('🚀 Iniciando backup dos dados...')
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
    const backupDir = `backups/${timestamp}`
    
    // Criar diretório de backup
    if (!fs.existsSync('backups')) {
      fs.mkdirSync('backups')
    }
    fs.mkdirSync(backupDir)
    
    // Tabelas para backup
    const tables = ['usuarios', 'criterios', 'criterio_conclusoes', 'alertas']
    
    for (const table of tables) {
      console.log(`📄 Fazendo backup da tabela: ${table}`)
      
      const { data, error } = await supabase
        .from(table)
        .select('*')
      
      if (error) {
        console.error(`❌ Erro ao fazer backup da tabela ${table}:`, error)
        continue
      }
      
      const filename = path.join(backupDir, `${table}.json`)
      fs.writeFileSync(filename, JSON.stringify(data, null, 2))
      console.log(`✅ Backup da tabela ${table} salvo em: ${filename}`)
    }
    
    // Criar arquivo de metadata
    const metadata = {
      timestamp: new Date().toISOString(),
      tables: tables,
      total_records: tables.length,
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0'
    }
    
    fs.writeFileSync(
      path.join(backupDir, 'metadata.json'), 
      JSON.stringify(metadata, null, 2)
    )
    
    console.log(`🎉 Backup concluído com sucesso em: ${backupDir}`)
    
  } catch (error) {
    console.error('❌ Erro durante o backup:', error)
    process.exit(1)
  }
}

// Executar backup
backupData()