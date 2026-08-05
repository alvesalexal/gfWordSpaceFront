## WordSpace - Estudos Bíblicos

![license](https://img.shields.io/badge/license-MIT-blue.svg)

Plataforma educacional para estudos bíblicos, construída com [Next.js](https://nextjs.org/), [React](https://reactjs.org/) e [MUI](https://mui.com/).

## Sobre

O WordSpace é uma plataforma de ensino que permite a gestão de turmas, tarefas, leituras e provas para professores e alunos. O projeto é baseado no [Devias Kit - React](https://material-kit-react.devias.io/) e utiliza a arquitetura de App Router do Next.js 14.

## Funcionalidades

- **Autenticação**: Cadastro, login e recuperação de senha
- **Turmas** (professor): Criar, editar e gerenciar turmas, e matricular alunos
- **Turmas** (aluno): Visualizar e entrar em turmas
- **Tarefas**: Criar e responder tarefas com editor de texto rico (Jodit)
- **Leituras**: Criar leituras e comentários
- **Provas**: Criar provas com questões de múltipla escolha e texto livre, com timer e correção automática
- **Conta**: Gerenciar perfil do usuário

## Páginas

### Autenticação
- `/auth/sign-in` - Login
- `/auth/sign-up` - Cadastro
- `/auth/reset-password` - Solicitar redefinição de senha
- `/auth/confirm-reset-password` - Confirmar redefinição de senha

### Dashboard
- `/dashboard` - Visão geral (estatísticas e conteúdos recentes)
- `/dashboard/turmas` - Gerenciamento de turmas
- `/dashboard/tarefas` - Gerenciamento de tarefas
- `/dashboard/leituras` - Gerenciamento de leituras
- `/dashboard/provas` - Gerenciamento de provas
- `/dashboard/provas/realizar/[testId]` - Realizar prova (aluno)
- `/dashboard/conta` - Perfil da conta
- `/dashboard/settings` - Configurações e notificações

## Quick start

- Clone o repositório
- Certifique-se de que o Node.js e npm estão instalados e atualizados
- Instale as dependências: `npm install` ou `yarn`
- Inicie o servidor: `npm run dev` ou `yarn dev`
- Acesse: `http://localhost:3000`

## Comandos Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia o servidor de desenvolvimento |
| `npm run build` | Gera a build de produção |
| `npm run start` | Inicia o servidor de produção |
| `npm run lint` | Executa o lint |
| `npm run lint:fix` | Corrige problemas de lint |
| `npm run typecheck` | Verificação de tipos TypeScript |
| `npm run format:write` | Formata o código com Prettier |
| `npm run format:check` | Verifica a formatação |

## Stack Tecnológica

- **Framework**: Next.js 14 (App Router)
- **UI Library**: React 18
- **Componentes**: MUI (Material UI) 5
- **Estilos**: Emotion
- **Formulários**: React Hook Form + Zod
- **Editor de texto rico**: Jodit
- **Ícones**: Phosphor Icons, Iconify
- **Gráficos**: ApexCharts
- **Linguagem**: TypeScript

## Estrutura do Projeto

```
src/
├── app/                  # Rotas e páginas (App Router)
│   ├── auth/             # Páginas de autenticação
│   ├── dashboard/        # Páginas do painel principal
│   │   ├── turmas/       # Gestão de turmas
│   │   ├── tarefas/      # Gestão de tarefas
│   │   ├── leituras/     # Gestão de leituras
│   │   ├── provas/       # Gestão de provas
│   │   │   └── realizar/[testId]/  # Realizar prova
│   │   ├── conta/        # Perfil do usuário
│   │   └── settings/     # Configurações
│   └── errors/           # Páginas de erro
├── components/           # Componentes React
│   ├── auth/             # Componentes de autenticação
│   ├── core/             # Componentes centrais (tema, logo, etc.)
│   ├── dashboard/        # Componentes do dashboard
│   └── Editor/           # Editor de texto rico
├── contexts/             # React Contexts
├── hooks/                # Custom hooks
├── lib/                  # Utilitários e cliente API
├── styles/               # Estilos globais
├── types/                # Definições de tipos TypeScript
└── utils/                # Funções utilitárias
```

## Licença

- Licenciado sob [MIT](LICENSE.md)
