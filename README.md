# IMC Voz — Calculadora de IMC por Voz

PWA em pt-BR para calcular seu IMC falando peso e altura. Tudo é processado no seu dispositivo: nada é enviado para servidores.

## Recursos

- **Entrada por voz** (Web Speech API, pt-BR) com transcrição ao vivo e fallback manual.
- **Cálculo de IMC** com classificação OMS e ponteiro animado.
- **Métricas extras**: faixa de peso saudável, peso ideal (Devine), TMB (Mifflin-St Jeor) e necessidade calórica por nível de atividade.
- **Histórico por perfil** com gráfico de evolução (peso e IMC) e exportação CSV.
- **Múltiplos perfis** (família) com avatar, cor, sexo, data de nascimento e nível de atividade.
- **Tema** claro/escuro/sistema/alto contraste, persistido.
- **PWA instalável** (offline-first), respeita `prefers-reduced-motion`.
- **Comandos por voz**: "calcular", "limpar", "modo escuro", "modo claro", "histórico", "trocar perfil".

## Stack

React 18 · TypeScript · Vite · Tailwind CSS · Zustand · Recharts · Framer Motion · vite-plugin-pwa · Vitest.

## Como rodar

```bash
npm install
npm run dev          # http://localhost:5173
npm test             # roda os testes unitários (Vitest)
npm run build        # build de produção
npm run preview      # preview da build
```

A entrada por voz funciona melhor em Chrome / Edge / Safari (iOS 14.5+). Em navegadores sem suporte, use os campos manuais.

## Estrutura

- `src/lib` — núcleo (cálculos, parser de voz, formatação)
- `src/hooks` — wrappers das APIs de voz e tema
- `src/store` — estado persistido (Zustand)
- `src/components` — UI compartilhada
- `src/pages` — Calcular, Histórico, Perfis, Ajustes
- `tests/unit` — testes Vitest

## Privacidade

Nada sai do seu dispositivo. Histórico, perfis e configurações ficam no `localStorage`. O reconhecimento de voz é feito pelo próprio navegador.

## Aviso

O IMC é uma estimativa para adultos e não substitui avaliação profissional. Crianças, gestantes, atletas e idosos devem usar outras métricas.
