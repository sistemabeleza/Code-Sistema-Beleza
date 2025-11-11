import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

// Carregar variáveis de ambiente
config({ path: '/home/ubuntu/sistema_salao_beleza/nextjs_space/.env' });

const execAsync = promisify(exec);
const prisma = new PrismaClient();

const BACKUP_DIR = '/home/ubuntu/backups';
const DATE = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0] + '_' + 
             new Date().toTimeString().split(' ')[0].replace(/:/g, '');

interface BackupData {
  timestamp: string;
  version: string;
  data: {
    saloes: any[];
    users: any[];
    clientes: any[];
    profissionais: any[];
    servicos: any[];
    produtos: any[];
    agendamentos: any[];
    vendas: any[];
    lancamentos: any[];
  };
}

async function createBackup() {
  console.log('========================================');
  console.log('🔄 BACKUP AUTOMÁTICO - SISTEMA BELEZA');
  console.log(`📅 ${new Date().toLocaleString('pt-BR')}`);
  console.log('========================================\n');

  // Criar diretórios
  const dbDir = path.join(BACKUP_DIR, 'database');
  const envDir = path.join(BACKUP_DIR, 'env');
  const logDir = path.join(BACKUP_DIR, 'logs');

  [dbDir, envDir, logDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  const logFile = path.join(logDir, `backup_auto_${DATE}.log`);
  const log = (message: string) => {
    console.log(message);
    fs.appendFileSync(logFile, message + '\n');
  };

  try {
    // 1. Backup do banco de dados
    log('💾 [1/3] Fazendo backup do banco de dados...');
    
    const backupData: BackupData = {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      data: {
        saloes: await prisma.salao.findMany(),
        users: await prisma.user.findMany(),
        clientes: await prisma.cliente.findMany(),
        profissionais: await prisma.profissional.findMany(),
        servicos: await prisma.servico.findMany(),
        produtos: await prisma.produto.findMany(),
        agendamentos: await prisma.agendamento.findMany(),
        vendas: await prisma.venda.findMany(),
        lancamentos: await prisma.lancamento.findMany(),
      }
    };

    const backupFile = path.join(dbDir, `backup_auto_${DATE}.json`);
    fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));
    
    // Comprimir
    await execAsync(`gzip -f ${backupFile}`);
    const compressedFile = `${backupFile}.gz`;
    const stats = fs.statSync(compressedFile);
    const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
    log(`   ✅ Backup criado: ${sizeMB} MB`);

    // 2. Backup do arquivo .env
    log('\n🔐 [2/3] Backup do arquivo .env...');
    const envFile = '/home/ubuntu/sistema_salao_beleza/nextjs_space/.env';
    if (fs.existsSync(envFile)) {
      const envBackup = path.join(envDir, `.env_${DATE}`);
      fs.copyFileSync(envFile, envBackup);
      log('   ✅ .env copiado');
    } else {
      log('   ⚠️  Arquivo .env não encontrado');
    }

    // 3. Limpeza de backups antigos (manter últimos 30 dias)
    log('\n🧹 [3/3] Limpando backups antigos...');
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    
    [dbDir, envDir, logDir].forEach(dir => {
      const files = fs.readdirSync(dir);
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);
        if (stats.mtimeMs < thirtyDaysAgo) {
          fs.unlinkSync(filePath);
        }
      });
    });
    log('   ✅ Backups antigos removidos');

    // Resumo
    log('\n========================================');
    log('✅ BACKUP CONCLUÍDO COM SUCESSO!');
    log('========================================\n');
    log('📊 Resumo:');
    log(`   • Backup: ${compressedFile}`);
    log(`   • Tamanho: ${sizeMB} MB`);
    log(`   • .env: ${path.join(envDir, `.env_${DATE}`)}`);
    log(`   • Log: ${logFile}\n`);

    // Estatísticas
    const totalBackups = fs.readdirSync(dbDir).length;
    const { stdout: diskUsage } = await execAsync(`du -sh ${BACKUP_DIR}`);
    log(`📁 Total de backups: ${totalBackups} arquivos`);
    log(`💾 Espaço usado: ${diskUsage.trim().split('\t')[0]}\n`);
    log(`✅ Finalizado em: ${new Date().toLocaleString('pt-BR')}\n`);

    return { success: true, file: compressedFile };

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    log(`\n❌ ERRO NO BACKUP: ${errorMsg}\n`);
    return { success: false, error: errorMsg };
  } finally {
    await prisma.$disconnect();
  }
}

// Executar backup
createBackup()
  .then(result => {
    if (result.success) {
      console.log('✅ Backup concluído com sucesso!');
      process.exit(0);
    } else {
      console.error('❌ Erro no backup:', result.error);
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('❌ Erro crítico:', error);
    process.exit(1);
  });
