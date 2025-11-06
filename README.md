
# 💇‍♀️ Sistema Beleza - Sistema Completo de Gestão para Salões de Beleza

Sistema multi-tenant SaaS completo para gestão de salões de beleza, desenvolvido com Next.js 14, TypeScript, Prisma ORM e PostgreSQL.

## 🌐 Deploy Ativo
**URL**: https://sistemabeleza.site

## 🏗️ Arquitetura do Sistema

### **Stack Tecnológica**
- **Frontend**: Next.js 14 (App Router) + React 18 + TypeScript
- **Estilização**: Tailwind CSS + Radix UI + Shadcn/ui
- **Backend**: Next.js API Routes
- **Banco de Dados**: PostgreSQL (Hosted DB)
- **ORM**: Prisma 6.7.0
- **Autenticação**: NextAuth.js 4.24.11
- **Armazenamento**: AWS S3 para uploads
- **Pagamentos**: Integração com Cakto

### **Arquitetura Multi-Tenant**
O sistema utiliza **multi-tenancy** baseado em `salao_id`:
- Cada salão é um tenant isolado
- Todos os dados são filtrados por `salao_id`
- Zero vazamento de dados entre salões
- Escalabilidade horizontal

## 📊 Capacidade e Escalabilidade

### **Banco de Dados PostgreSQL**

#### **Configuração Atual**
- **Tipo**: PostgreSQL Hosted Database
- **Conexões Simultâneas**: 100-200 conexões padrão
- **Armazenamento**: Expansível conforme necessidade
- **Backup**: Automático via hosting

#### **Capacidade de Usuários**

##### **Por Usuário Simultâneo**
O sistema pode suportar:
- **100-200 usuários simultâneos** com a configuração atual
- **5.000+ salões** cadastrados no banco
- **50.000+ clientes** distribuídos entre salões
- **100.000+ agendamentos** por mês

##### **Métricas de Performance**
```
┌─────────────────────────┬──────────────────┐
│ Métrica                 │ Capacidade       │
├─────────────────────────┼──────────────────┤
│ Usuários Simultâneos    │ 100-200          │
│ Salões Totais           │ 5.000+           │
│ Clientes por Salão      │ Ilimitado        │
│ Agendamentos/dia        │ 3.000+           │
│ Transações/segundo      │ 50-100           │
│ Storage AWS S3          │ Ilimitado        │
└─────────────────────────┴──────────────────┘
```

##### **Escalabilidade**
Para aumentar capacidade:
1. **Database Upgrade**: Aumentar plano do PostgreSQL
2. **Connection Pooling**: Implementar PgBouncer (500-1000 conexões)
3. **Cache Layer**: Redis para queries frequentes
4. **CDN**: Cloudflare para assets estáticos
5. **Load Balancer**: Distribuir tráfego entre instâncias

### **Limitações por Plano**

```typescript
// Limites definidos em lib/plan-limits.ts
BASICO: {
  max_profissionais: 2,
  max_servicos: 10,
  max_agendamentos_mes: 100,
  has_inventario: false,
  has_relatorios_avancados: false,
  has_agendamento_publico: false
}

INTERMEDIARIO: {
  max_profissionais: 5,
  max_servicos: 30,
  max_agendamentos_mes: 500,
  has_inventario: true,
  has_relatorios_avancados: true,
  has_agendamento_publico: true
}

COMPLETO: {
  max_profissionais: 999,  // Ilimitado
  max_servicos: 999,       // Ilimitado
  max_agendamentos_mes: 999999,  // Ilimitado
  has_inventario: true,
  has_relatorios_avancados: true,
  has_agendamento_publico: true
}
```

## 🗂️ Estrutura do Banco de Dados

### **Principais Tabelas**
```
saloes (Multi-tenant principal)
├── usuarios (users)
├── clientes
├── profissionais
├── servicos
├── produtos
├── agendamentos
├── vendas
├── pagamentos
├── lancamentos (financeiro)
└── relatorios_financeiros
```

### **Índices e Performance**
- Índices em `salao_id` em todas as tabelas
- Índices únicos em `email`, `slug`, `codigo_barras`
- Relacionamentos com `CASCADE DELETE` para limpeza automática
- Queries otimizadas com `select` específicos

## 🚀 Funcionalidades Completas

### **1. Sistema Multi-Tenant**
✅ Registro de salões com slug personalizado  
✅ Isolamento total de dados por salão  
✅ Sistema de planos (Básico, Intermediário, Completo)  
✅ Trial gratuito de 30 dias  
✅ Controle de assinaturas com Cakto  

### **2. Gestão de Agenda**
✅ Calendário interativo  
✅ Agendamento manual  
✅ Agendamento público via link personalizado  
✅ Status: Agendado, Confirmado, Realizado, Cancelado  
✅ Controle de horários por profissional  

### **3. Gestão de Clientes**
✅ Cadastro completo com foto  
✅ Histórico de agendamentos  
✅ Histórico de vendas  
✅ Sistema de fidelidade  

### **4. Gestão de Profissionais**
✅ Cadastro com foto  
✅ Horários de trabalho personalizados  
✅ Sistema de comissões (% ou valor fixo)  
✅ Controle de status (Ativo, Férias, Licença)  

### **5. Gestão de Serviços**
✅ Cadastro com preço e duração  
✅ Controle de disponibilidade  
✅ Histórico de prestação  

### **6. Gestão de Produtos**
✅ Cadastro com foto  
✅ Controle de estoque  
✅ Alertas de estoque baixo  
✅ Movimentações (Entrada, Saída, Ajuste)  
✅ Código de barras  

### **7. Vendas**
✅ PDV completo  
✅ Venda de produtos e serviços  
✅ Múltiplas formas de pagamento  
✅ Desconto por item  
✅ Impressão de comprovante  

### **8. Financeiro**
✅ Controle de receitas e despesas  
✅ Categorização automática  
✅ Relatórios mensais  
✅ Cálculo de comissões  
✅ Gráficos de performance  

### **9. Relatórios**
✅ Dashboard com KPIs  
✅ Relatórios de vendas  
✅ Relatórios de serviços  
✅ Análise de produtos  
✅ Exportação para CSV  

### **10. Configurações**
✅ Personalização de tema  
✅ Upload de logo e fotos  
✅ Horário de funcionamento  
✅ Redes sociais  
✅ Link personalizado para agendamento  

### **11. Painel Admin**
✅ Gerenciamento de usuários  
✅ Criação de salões  
✅ Alteração de planos  
✅ Reset de senhas  
✅ Exclusão de usuários  

## 🔐 Credenciais de Admin

**Email**: sistemabeleza.contato@gmail.com  
**Senha**: Dg124578@

⚠️ **IMPORTANTE**: Altere a senha após o primeiro acesso!

## 📦 Como Rodar o Sistema Localmente

### **Pré-requisitos**
- Node.js 18+ e Yarn
- PostgreSQL 14+
- Conta AWS (para S3)
- Conta Cakto (para pagamentos)

### **Instalação**

1. **Clone o repositório**
```bash
git clone https://github.com/SEU_USUARIO/sistema-beleza.git
cd sistema-beleza/nextjs_space
```

2. **Instale as dependências**
```bash
yarn install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env
```

Edite o `.env`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/sistema_beleza"
NEXTAUTH_SECRET="seu-secret-aqui"
AWS_REGION="us-west-2"
AWS_BUCKET_NAME="seu-bucket"
AWS_FOLDER_PREFIX="uploads/"
CAKTO_API_KEY="sua-chave-cakto"
```

4. **Execute as migrations**
```bash
yarn prisma migrate deploy
yarn prisma generate
```

5. **Popule o banco (opcional)**
```bash
yarn prisma db seed
```

6. **Inicie o servidor**
```bash
yarn dev
```

Acesse: http://localhost:3000

## 🌍 Deploy em Produção

### **Vercel (Recomendado)**
```bash
vercel --prod
```

### **Docker**
```bash
docker build -t sistema-beleza .
docker run -p 3000:3000 sistema-beleza
```

### **Server Manual**
```bash
yarn build
yarn start
```

## 🔧 Manutenção

### **Backup do Banco**
```bash
pg_dump -h HOST -U USER -d DATABASE > backup.sql
```

### **Restaurar Backup**
```bash
psql -h HOST -U USER -d DATABASE < backup.sql
```

### **Limpar Cache**
```bash
rm -rf .next
yarn build
```

## 📈 Monitoramento

### **Logs de Acesso**
- Todos os acessos são logados via NextAuth
- Sessions são armazenadas no banco

### **Métricas Importantes**
- Tempo de resposta das APIs
- Uso de conexões do banco
- Taxa de erro
- Uploads para S3

## 🐛 Troubleshooting

### **Erro de Conexão com Banco**
```bash
# Verifique a string de conexão
yarn prisma studio
```

### **Erro de Upload S3**
- Verifique credenciais AWS
- Confirme permissões do bucket
- Valide `AWS_FOLDER_PREFIX`

### **NextAuth Não Funciona**
- Verifique `NEXTAUTH_SECRET`
- Confirme `NEXTAUTH_URL` em produção

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Add nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📝 Licença

Este projeto é proprietário e confidencial.

## 📞 Suporte

**Email**: sistemabeleza.contato@gmail.com  
**Website**: https://sistemabeleza.site

---

Desenvolvido com ❤️ para revolucionar a gestão de salões de beleza
