# Global Talk · Automação de Matrícula

Sistema de ponta a ponta para transformar a matrícula de alunos em um fluxo rastreável, do primeiro cadastro à ativação.

## O que o produto cobre

- formulário de matrícula com validação e salvamento de progresso;
- prova de nivelamento e encaminhamento por turma;
- consolidação e importação de dados;
- geração e acompanhamento de contrato;
- controle financeiro, PIX e inadimplência;
- painéis operacionais para coordenação, grade e fases da jornada.

## Fluxo principal

```text
Cadastro → Nivelamento → Turma → Importação → Contrato → Pagamento → Aluno ativo
```

## Arquitetura

- **Frontend:** React 19, TypeScript, Vite e Tailwind CSS;
- **Componentes:** shadcn/ui e Radix UI;
- **Estado e validação:** React Hook Form e Zod;
- **Backend:** PocketBase via Skip Cloud;
- **Qualidade:** Oxlint e Oxfmt.

## Executar localmente

```bash
pnpm install
cp .env.example .env
pnpm dev
```

Defina `VITE_POCKETBASE_URL` no arquivo `.env` com a URL do seu ambiente.

## Comandos úteis

```bash
pnpm dev       # desenvolvimento
pnpm build     # build de produção
pnpm lint      # análise estática
pnpm format    # formatação
pnpm preview   # preview do build
```

## Estrutura relevante

```text
src/pages/MatriculaWizard.tsx       jornada de matrícula
src/pages/CoordenadoraPainel.tsx    operação da coordenação
src/pages/PainelFinanceiro.tsx      pagamentos e inadimplência
src/pages/PainelGrade.tsx           turmas e grade
src/pages/PainelFases.tsx           progresso da jornada
pocketbase/                         dados e regras do backend
```

## Status

Projeto de produto construído no Skip. Para uso fora do ambiente original, configure uma instância compatível de PocketBase e revise as regras de acesso antes de publicar.
