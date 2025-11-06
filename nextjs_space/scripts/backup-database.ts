
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const prisma = new PrismaClient();

async function backupDatabase() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const backupDir = process.env.BACKUP_DIR || path.join(__dirname, '../../backups/database');
  const backupFile = path.join(backupDir, `backup_${timestamp}.json`);

  console.log('🔐 ==========================================');
  console.log('   BACKUP DO BANCO DE DADOS - Sistema Beleza');
  console.log(`   ${new Date().toLocaleString('pt-BR')}`);
  console.log('==========================================\n');

  try {
    // Criar diretório se não existir
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    console.log('💾 Fazendo backup do banco de dados...\n');
    console.log('📊 Exportando dados via Prisma...\n');

    // Exportar todas as tabelas
    const backup = {
      metadata: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        database: 'sistema_beleza'
      },
      data: {
        saloes: await prisma.salao.findMany(),
        users: await prisma.user.findMany(),
        clientes: await prisma.cliente.findMany(),
        profissionais: await prisma.profissional.findMany(),
        servicos: await prisma.servico.findMany(),
        produtos: await prisma.produto.findMany(),
        agendamentos: await prisma.agendamento.findMany(),
        vendas: await prisma.venda.findMany(),
        itemVenda: await prisma.itemVenda.findMany(),
        pagamentos: await prisma.pagamento.findMany(),
        movimentacoesEstoque: await prisma.movimentacaoEstoque.findMany(),
        lancamentos: await prisma.lancamento.findMany(),
        relatoriosFinanceiros: await prisma.relatorioFinanceiro.findMany(),
        fidelidadeClientes: await prisma.fidelidadeCliente.findMany(),
        configuracoesQueSalao: await prisma.configuracaoSalao.findMany(),
        caktoTransactions: await prisma.caktoTransaction.findMany()
      }
    };

    // Salvar em arquivo JSON
    fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2));

    console.log('✅ Dados exportados com sucesso!\n');

    // Verificar se o backup foi criado
    if (fs.existsSync(backupFile)) {
      const stats = fs.statSync(backupFile);
      const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);

      console.log('✅ Backup criado com sucesso!');
      console.log(`📁 Arquivo: ${backupFile}`);
      console.log(`📊 Tamanho: ${sizeMB} MB\n`);

      // Comprimir o backup
      console.log('🗜️  Comprimindo backup...');
      await execAsync(`gzip "${backupFile}"`);
      
      const gzFile = `${backupFile}.gz`;
      if (fs.existsSync(gzFile)) {
        const gzStats = fs.statSync(gzFile);
        const gzSizeMB = (gzStats.size / (1024 * 1024)).toFixed(2);
        console.log(`✅ Backup comprimido: ${gzSizeMB} MB\n`);
      }

      // Fazer backup do .env também
      const envSource = path.join(__dirname, '../.env');
      const envBackupDir = process.env.BACKUP_DIR ? path.dirname(process.env.BACKUP_DIR).replace('/database', '/env') : path.join(__dirname, '../../backups/env');
      const envBackup = path.join(envBackupDir, `.env_${timestamp}`);
      
      if (fs.existsSync(envSource)) {
        const envDir = path.dirname(envBackup);
        if (!fs.existsSync(envDir)) {
          fs.mkdirSync(envDir, { recursive: true });
        }
        fs.copyFileSync(envSource, envBackup);
        fs.chmodSync(envBackup, 0o600);
        console.log('🔑 Backup do .env criado\n');
      }

      // Estatísticas do banco
      console.log('📊 Estatísticas do banco:');
      
      const saloes = await prisma.salao.count();
      const usuarios = await prisma.user.count();
      const clientes = await prisma.cliente.count();
      const agendamentos = await prisma.agendamento.count();
      const produtos = await prisma.produto.count();
      const vendas = await prisma.venda.count();

      console.log(`   • Salões: ${saloes}`);
      console.log(`   • Usuários: ${usuarios}`);
      console.log(`   • Clientes: ${clientes}`);
      console.log(`   • Agendamentos: ${agendamentos}`);
      console.log(`   • Produtos: ${produtos}`);
      console.log(`   • Vendas: ${vendas}\n`);

      console.log('==========================================');
      console.log('✅ BACKUP CONCLUÍDO COM SUCESSO!');
      console.log('==========================================\n');

      // Listar últimos backups
      console.log('📋 Últimos 5 backups:');
      const { stdout: lsOutput } = await execAsync(`ls -lht ${backupDir}/*.gz 2>/dev/null | head -5 || echo "Nenhum backup anterior"`);
      console.log(lsOutput);

      // Limpar backups antigos (manter últimos 30 dias)
      console.log('\n🗑️  Limpando backups antigos (> 30 dias)...');
      try {
        await execAsync(`find ${backupDir} -name "backup_*.sql.gz" -mtime +30 -delete`);
        console.log('   ✅ Limpeza concluída\n');
      } catch (err) {
        console.log('   ℹ️  Nenhum backup antigo para remover\n');
      }

      console.log('💡 Próximos passos:');
      console.log('   1. Copie o backup para um local seguro (Google Drive, HD externo)');
      console.log('   2. Para restaurar: yarn tsx scripts/restore-database.ts');
      console.log('   3. Para backup automático: bash scripts/setup-cron.sh\n');

    } else {
      throw new Error('Arquivo de backup não foi criado');
    }

  } catch (error) {
    console.error('\n❌ ERRO no backup:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar
backupDatabase();
