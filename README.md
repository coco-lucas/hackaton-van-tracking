# Professor Van Monitor 🚐

Sistema de monitoramento e coordenação de viagens de vans universitárias desenvolvido para gerenciar e rastrear, em tempo real, as rotas das vans utilizadas por professores que se deslocam entre as cidades de Teresópolis e Rio de Janeiro.

## 📱 Visão Geral

O **Van Monitor** é uma aplicação PWA (Progressive Web App) mobile-first que permite:

- **Para Motoristas**: Visualizar e gerenciar viagens programadas, acompanhar passageiros e rotas
- **Para Passageiros (Professores)**: Reservar viagens, acompanhar localização em tempo real da van e comunicar-se com motoristas
- **Para Administradores**: Supervisionar todas as viagens ativas e histórico de deslocamentos

## 🎨 Design System

### White Label Ready

O projeto foi desenvolvido com um sistema de design white-label, permitindo fácil customização para diferentes instituições:

- **Cores**: Variáveis CSS centralizadas em [app/globals.css](app/globals.css)
- **Cor principal atual**: Verde claro (`#7cc896`) - identidade visual da universidade
- **Dark Mode**: Suporte completo com variantes de cores
- **Tokens de design**: Espaçamento, tipografia e raios de borda totalmente customizáveis

### Inspiração Visual

O design segue padrões dos aplicativos **99** e **BlaBlaCar**:
- Cards de viagem com informações claras
- Layout limpo e funcional
- Microanimações suaves
- Foco em usabilidade mobile

## 🚀 Tecnologias

- **Framework**: Next.js 16 (App Router)
- **UI**: Shadcn/UI + Tailwind CSS v4
- **Ícones**: Lucide React
- **Tipografia**: Sistema nativo (-apple-system, BlinkMacSystemFont, Segoe UI, Roboto)
- **PWA**: Service Worker customizado + Web App Manifest
- **Validação**: Zod com validação de CPF
- **Datas**: date-fns com localização PT-BR

## 📦 Instalação

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Build de produção
npm run build

# Executar build de produção
npm start
```

Acesse [http://localhost:3000](http://localhost:3000) para ver a aplicação.

## 🔐 Autenticação (Mock)

### Credenciais de Demonstração

#### Motoristas
- **CPF**: 123.456.789-09
- **Senha**: 123456

- **CPF**: 987.654.321-00
- **Senha**: 123456

#### Passageiros (Professores)
- **CPF**: 111.444.777-35
- **Senha**: 123456

- **CPF**: 222.555.888-69
- **Senha**: 123456

- **CPF**: 333.666.999-03
- **Senha**: 123456

### Sistema de Autenticação

- Login com **CPF** (validação completa com Zod)
- Formatação automática do CPF durante digitação
- Validação de dígitos verificadores
- Armazenamento em `localStorage`
- Proteção de rotas por role (motorista/passageiro/admin)
- Redirecionamento automático baseado no tipo de usuário
- Mock API com delays simulados para realismo

## 📂 Estrutura do Projeto

```
van-tracking/
├── app/
│   ├── login/              # Página de login com tabs de role
│   ├── motorista/          # Dashboard do motorista
│   ├── passageiro/         # Dashboard do passageiro
│   ├── _components/        # Componentes específicos do app
│   │   └── login-form.tsx  # Formulário com validação de CPF
│   ├── manifest.ts         # PWA manifest
│   ├── register-sw.tsx     # Service Worker registration
│   └── globals.css         # Design tokens e estilos globais
├── components/
│   ├── ui/                 # Componentes shadcn/ui
│   └── trip-card.tsx       # Componente de card de viagem
├── lib/
│   ├── hooks/
│   │   └── use-auth.tsx    # Hook de autenticação
│   ├── validations/
│   │   └── auth.ts         # Validação Zod + CPF validator
│   ├── mock-api/
│   │   ├── config.ts       # Configuração da API mock
│   │   ├── auth/           # Serviços e dados de autenticação
│   │   │   ├── data.ts     # Usuários mock com CPF
│   │   │   └── service.ts  # Serviço de autenticação
│   │   └── trips/          # Serviços e dados de viagens
│   │       ├── data.ts     # Viagens mock
│   │       └── service.ts  # Serviço de viagens
│   ├── types/
│   │   └── index.ts        # TypeScript types
│   └── utils.ts            # Utilidades (shadcn)
└── public/
    └── sw.js               # Service Worker
```

## 🎯 Funcionalidades Implementadas

### ✅ MVP Fase 1

- [x] Sistema de design white-label com tokens CSS
- [x] Configuração PWA completa (manifest + service worker)
- [x] Camada de Mock API com delays simulados
- [x] Sistema de autenticação com CPF
- [x] **Validação de CPF com Zod**
- [x] **Formatação automática de CPF**
- [x] **Validação de dígitos verificadores**
- [x] Página de login com seleção de role (tabs)
- [x] Dashboard do motorista com:
  - Visualização de viagens programadas
  - Cards de viagem (hoje / próximas)
  - Informações do veículo
  - Estatísticas rápidas
- [x] Dashboard do passageiro com:
  - Visualização de viagens reservadas
  - Tabs (próximas / histórico)
  - Status de viagem ativa
- [x] Componentes de card de viagem (estilo 99/BlaBlaCar)
- [x] Rotas protegidas por autenticação
- [x] Mobile-first responsive design
- [x] Suporte a safe areas (iOS/Android)

### 🔜 Próximas Funcionalidades

- [ ] Integração com Google Maps API
  - Mapa com localização em tempo real da van
  - Visualização da rota
  - Tempo estimado de chegada
- [ ] Sistema de mensagens
  - Chat entre motorista e passageiros
  - Notificações do sistema
  - Histórico de mensagens
- [ ] Dashboard administrativo
  - Visão geral de todas as vans
  - Gerenciamento de viagens
  - Analytics e relatórios
- [ ] Reserva de viagens
  - Sistema de booking para passageiros
  - Gestão de vagas disponíveis
- [ ] Notificações push
  - Avisos de partida
  - Alterações de rota
  - Status da viagem

## 🎨 Customização de Cores (White Label)

Para adaptar o app para outra instituição, edite as variáveis em [app/globals.css](app/globals.css):

```css
:root {
  /* Modifique estas variáveis para a identidade da sua instituição */
  --brand-primary: oklch(0.75 0.15 145); /* Cor principal */
  --brand-primary-dark: oklch(0.55 0.15 145); /* Hover states */
  --brand-primary-light: oklch(0.95 0.05 145); /* Backgrounds */
}
```

Você pode usar qualquer cor em formato OKLCH, HEX, RGB, ou HSL.

## 📱 PWA - Instalação no Dispositivo

### Android
1. Acesse o site pelo Chrome
2. Toque no menu (⋮)
3. Selecione "Adicionar à tela inicial"
4. Confirme a instalação

### iOS
1. Acesse o site pelo Safari
2. Toque no ícone de compartilhar
3. Selecione "Adicionar à Tela de Início"
4. Confirme

### Desktop
1. Acesse pelo Chrome/Edge
2. Procure o ícone de instalação na barra de endereços
3. Clique em "Instalar"

> **Nota sobre ícones**: Para produção, adicione os arquivos `icon-192.png` e `icon-512.png` na pasta `public/`. Atualmente, são placeholders.

## ✅ Validação de CPF

O sistema implementa validação completa de CPF:

- **Formatação automática**: O CPF é formatado enquanto você digita (000.000.000-00)
- **Validação de dígitos**: Verifica os dígitos verificadores
- **Mensagens de erro**: Feedback imediato sobre CPF inválido
- **Aceita múltiplos formatos**: Com ou sem pontuação

### Exemplo de uso da validação:

```typescript
import { validateCPF, formatCPF, cleanCPF } from '@/lib/validations/auth'

// Validar CPF
const isValid = validateCPF('123.456.789-09') // true

// Formatar CPF
const formatted = formatCPF('12345678909') // '123.456.789-09'

// Limpar formatação
const clean = cleanCPF('123.456.789-09') // '12345678909'
```

## 🗺️ Google Maps - Integração Futura

O projeto está preparado para integração com Google Maps:

1. Criar projeto no Google Cloud Console
2. Ativar APIs:
   - Maps JavaScript API
   - Directions API
   - Geocoding API
3. Criar API key e adicionar em `.env.local`:
   ```
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
   ```

## 🧪 Dados de Teste

### CPFs de Teste (Todos válidos)

**Motoristas:**
- Carlos Silva: 123.456.789-09
- Maria Santos: 987.654.321-00

**Passageiros:**
- Prof. João Oliveira: 111.444.777-35
- Profa. Ana Paula: 222.555.888-69
- Prof. Roberto Costa: 333.666.999-03
- Profa. Mariana Lima: 444.777.000-37
- Prof. Fernando Alves: 555.888.111-71

**Admin:**
- Administrador: 000.000.001-91

**Senha para todos**: 123456

### Viagens Mock

O sistema gera automaticamente viagens para os próximos 3 dias:
- Rota principal: Teresópolis ↔ Rio de Janeiro
- Horários: Manhã (7:30) e Tarde (17:00-17:30)
- 3-5 passageiros por viagem
- Capacidade: 12-15 lugares por van

## 🔧 Configuração do Mock API

Ajuste os delays e comportamento em [lib/mock-api/config.ts](lib/mock-api/config.ts):

```typescript
export const MOCK_CONFIG = {
  delays: {
    fast: 300,      // Login, logout
    normal: 600,    // Buscar viagens
    slow: 1200,     // Operações complexas
  },
  errorRate: 0,     // 0-100 (porcentagem de erros simulados)
  debug: true,      // Console logs
}
```

## 🏗️ Desenvolvimento

### Adicionar novo componente shadcn/ui

```bash
npx shadcn@latest add [component-name]
```

### Estrutura de rotas

- `/` - Redirecionamento automático baseado em auth
- `/login` - Página de login com CPF
- `/motorista` - Dashboard do motorista (protegido)
- `/passageiro` - Dashboard do passageiro (protegido)
- `/admin` - Dashboard administrativo (futuro)

### Validação com Zod

```typescript
import { loginSchema } from '@/lib/validations/auth'

// Validar dados de login
const result = loginSchema.safeParse({
  cpf: '123.456.789-09',
  senha: '123456',
  role: 'motorista'
})

if (result.success) {
  // Dados válidos
  console.log(result.data)
} else {
  // Erros de validação
  console.log(result.error.errors)
}
```

## 📄 Licença

Este projeto foi desenvolvido para fins educacionais durante um hackathon universitário.

## 👥 Contribuindo

Este é um MVP em desenvolvimento. Contribuições são bem-vindas!

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/NovaFuncionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/NovaFuncionalidade`)
5. Abra um Pull Request

---

**Desenvolvido com ❤️ para facilitar o transporte universitário**
