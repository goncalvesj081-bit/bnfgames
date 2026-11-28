# SUITS — Visão de produto e evolução do jogo

> Documento complementar ao `suits-planejamento.md`.
>
> **Objetivo:** fortalecer o SUITS como jogo de carreira, sem perder sua proposta de simulador jurídico e educativo.
>
> Este documento organiza ideias de experiência, narrativa e progressão. Ele complementa o planejamento técnico existente; não substitui as etapas de refatoração, validação jurídica, testes e expansão dos ritos.

---

## 1. Visão do produto

### Conceito

**SUITS é um simulador de carreira na advocacia em que as decisões do jogador constroem sua reputação, seu patrimônio e seu futuro profissional.**

O jogador não deve apenas resolver processos. Deve viver a rotina de um advogado: atender clientes, administrar prazos, negociar, estudar, lidar com colegas, tomar decisões difíceis e construir uma carreira.

### Fantasia central do jogador

> Começar como um profissional iniciante, conquistar espaço no mercado jurídico e construir uma carreira respeitada — seja como especialista, sócio ou dono do próprio escritório.

### Os três pilares

| Pilar | Experiência | Exemplos |
|---|---|---|
| Advocacia | Resolver problemas jurídicos | Clientes, processos, peças, audiências, recursos e acordos |
| Carreira | Construir uma trajetória profissional | Promoções, especializações, reputação, contatos e oportunidades |
| Gestão | Administrar recursos e pessoas | Honorários, despesas, escritório, equipe e agenda |

Toda funcionalidade nova deve fortalecer pelo menos um desses pilares.

---

## 2. Princípios de design

1. **Decisões precisam ter consequências:** escolhas devem afetar o caso, o cliente, a reputação, o dinheiro ou a carreira.
2. **Nem tudo deve ser uma prova jurídica:** a rotina profissional também envolve comunicação, organização, negociação e gestão.
3. **Não existe escolha perfeita em toda situação:** alguns dilemas devem envolver vantagens e custos diferentes, sem uma resposta universal.
4. **O jogador precisa perceber evolução:** novas responsabilidades, casos e oportunidades devem surgir conforme sua trajetória.
5. **O conteúdo jurídico precisa ser confiável:** artigos, prazos, procedimentos e explicações devem ser conferidos antes de serem apresentados como corretos.
6. **A complexidade deve crescer gradualmente:** não despejar todos os sistemas e indicadores no jogador desde o início.
7. **A narrativa deve nascer das mecânicas:** personagens e acontecimentos devem reagir às decisões, em vez de serem apenas textos isolados.

---

## 3. Camada de vida profissional

O jogo precisa ter acontecimentos que não sejam necessariamente etapas de um processo.

### Exemplos de eventos

- O chefe pede que o jogador assuma um processo delicado.
- Um colega solicita ajuda para preparar uma audiência.
- Um cliente importante chega por indicação.
- Um cliente reclama da demora ou da comunicação.
- O escritório perde um cliente relevante.
- O jogador recebe uma proposta de outro escritório.
- Surge uma oportunidade de participar de uma reunião importante.
- O jogador precisa escolher entre concluir uma tarefa, estudar ou encerrar o expediente.
- Um erro administrativo exige retrabalho.
- Um cliente antigo retorna com outro problema.

### Como funcionaria

Os eventos aparecem na agenda, no painel ou como mensagens recebidas. O jogador escolhe como agir. As consequências podem ser imediatas ou aparecer alguns dias depois.

Cada evento deve informar, quando adequado:
- Contexto da situação.
- Pessoas envolvidas.
- Opções disponíveis.
- Custo de tempo ou dinheiro.
- Consequências possíveis ou observáveis.
- Registro no histórico da carreira.

**Regra:** eventos aleatórios não devem punir o jogador sem possibilidade razoável de compreender ou prevenir o problema.

---

## 4. Sistema de clientes

Os clientes devem ser personagens, não apenas descrições de processos.

### Atributos sugeridos

| Atributo | Função |
|---|---|
| Confiança | Mede quanto o cliente confia no advogado |
| Paciência | Influencia sua reação à demora |
| Expectativa | Indica o resultado que espera |
| Condição financeira | Ajuda a definir honorários e possibilidade de pagamento |
| Perfil | Define estilo de comunicação e comportamento |
| Histórico | Registra atendimentos e decisões anteriores |

Esses atributos devem ser simples no começo. Não é necessário exibir todos os números ao jogador; parte deles pode ser percebida pelo diálogo e pelo comportamento.

### Exemplo de situação

**Cliente:** quer ajuizar uma ação, mas os documentos apresentados indicam que a pretensão pode estar prescrita.

Possíveis decisões:
1. Explicar o problema e recusar a contratação, orientando o cliente.
2. Investigar melhor antes de decidir.
3. Aceitar a contratação, deixando claros os riscos — somente se houver fundamento jurídico para prosseguir.

A situação pode afetar confiança, tempo, reputação e resultado financeiro.

### Evolução do relacionamento

- Bom atendimento aumenta a chance de indicação.
- Falta de comunicação reduz a confiança.
- Promessas irreais podem gerar insatisfação.
- Resultados bem explicados ajudam a manter o relacionamento, mesmo quando desfavoráveis.
- O cliente pode voltar em outro capítulo ou indicar novos clientes.

---

## 5. Sistema de carreira

A carreira deve representar uma progressão de responsabilidades, não apenas uma barra de experiência.

| Etapa | Posição | Novas responsabilidades |
|---|---|---|
| 1 | Bacharel | Preparação e aprovação na OAB |
| 2 | Advogado júnior | Executar tarefas com supervisão |
| 3 | Advogado pleno | Conduzir processos com autonomia |
| 4 | Advogado sênior | Assumir casos complexos e orientar colegas |
| 5 | Sócio | Participar de decisões e resultados do escritório |
| 6 | Dono de escritório | Captar clientes, contratar equipe e administrar o negócio |

Os nomes e a estrutura podem ser ajustados à narrativa da Temporada 1 e à relação com a Dra. Marta.

### Critérios para promoção

Combinar diferentes dimensões:
- Experiência prática.
- Qualidade técnica.
- Reputação.
- Ética profissional.
- Relacionamento com clientes e equipe.
- Capacidade de cumprir prazos e organizar o trabalho.

Evitar que uma única pontuação determine toda a carreira.

---

## 6. Especialização dinâmica

A especialização deve surgir da experiência do jogador.

### Funcionamento sugerido

- Atuar em casos de determinada área aumenta a experiência naquela área.
- Bons resultados e boa condução dos casos fortalecem a reputação específica.
- A reputação por área influencia os tipos de clientes e oportunidades recebidos.
- O jogador pode continuar generalista ou se especializar.
- A especialização deve abrir oportunidades, mas não bloquear completamente as demais áreas.

### Exemplos de especialidades

- Direito Civil e Família.
- Direito do Trabalho.
- Direito Penal.
- Direito Previdenciário.
- Direito Empresarial.
- Direito Administrativo.

A implementação deve aproveitar o sistema `repA` previsto no planejamento técnico.

---

## 7. Casos especiais e acontecimentos marcantes

Além dos processos comuns, criar casos de maior repercussão.

### Tipos de evento especial

- Caso de grande repercussão na cidade.
- Cliente conhecido procura o escritório.
- Processo de alto valor econômico.
- Caso com conflito de interesses.
- Processo que pode mudar a reputação do jogador.
- Cliente antigo retorna com um novo problema.
- Caso que exige colaboração entre diferentes áreas.
- Caso em que o melhor resultado pode ser um acordo, e não uma sentença.

### Regras para esses casos

- Devem ser menos frequentes que os casos normais.
- Precisam ter contexto e personagens próprios.
- Devem exigir mais de uma habilidade do jogador.
- Podem gerar consequências duradouras.
- Não devem depender apenas de uma pergunta de múltipla escolha.

---

## 8. Dilemas profissionais

Criar situações sem alternativa obviamente perfeita. O objetivo é trabalhar julgamento profissional, comunicação e ética.

### Exemplo: cliente insatisfeito

O cliente está frustrado com a demora do processo e ameaça trocar de advogado.

Possíveis caminhos:
- Explicar a situação processual com clareza e apresentar os próximos passos.
- Negociar uma forma de melhorar a comunicação.
- Avaliar, com transparência, se existe uma solução consensual.
- Encerrar a relação profissional de forma adequada, se não houver condições de continuidade.

As consequências podem envolver confiança, tempo, honorários e reputação.

### Categorias de dilemas

- Comunicação de riscos ao cliente.
- Sigilo profissional.
- Conflito de interesses.
- Pressão por resultados.
- Relação com colegas e superiores.
- Publicidade e captação de clientes.
- Organização e responsabilidade com prazos.
- Limites entre estratégia legítima e conduta antiética.

**Importante:** dilemas jurídicos devem ter revisão técnica. O jogo não deve tratar condutas ilegais ou antiéticas como simples atalhos vantajosos.

---

## 9. Gestão do escritório

A gestão deve ganhar importância conforme o jogador avança na carreira.

### Escritório próprio

- Escolher nome e identidade do escritório.
- Definir estrutura e especialidades.
- Pagar aluguel, sistemas e despesas.
- Definir honorários dentro dos parâmetros éticos aplicáveis.
- Receber clientes por canais legítimos.
- Controlar fluxo de caixa.
- Administrar a quantidade de processos ativos.

### Equipe

| Cargo | Possível contribuição | Limite |
|---|---|---|
| Estagiário | Pesquisa, organização e apoio | Não substitui atos privativos de advogado |
| Advogado associado | Condução de processos e atendimento | Pode ficar sobrecarregado |
| Sócio | Gestão e divisão de responsabilidades | Participa dos custos e resultados |

### Riscos de gestão

- Excesso de processos.
- Despesas maiores que a receita.
- Atrasos e sobrecarga da equipe.
- Dependência de poucos clientes.
- Contratação em momento inadequado.

A gestão não deve virar uma planilha complexa. O foco é criar decisões interessantes e consequências compreensíveis.

---

## 10. Narrativa por temporadas

A estrutura por temporadas pode dar objetivo de longo prazo ao jogador.

### Temporada 1 — O começo

- Concluir a formação e passar na OAB.
- Entrar no escritório da Dra. Marta.
- Aprender a rotina.
- Resolver os primeiros casos.
- Construir reputação e conquistar confiança.
- Encerrar a temporada com uma decisão sobre o futuro profissional.

### Temporada 2 — Independência

- Receber o convite ou decidir sair do escritório.
- Captar os primeiros clientes.
- Abrir o próprio escritório.
- Administrar despesas e honorários.
- Construir uma carteira de clientes.
- Contratar a primeira pessoa para a equipe.

### Temporada 3 — Reconhecimento

- Receber casos de maior complexidade e repercussão.
- Enfrentar escritórios concorrentes.
- Atuar em diferentes instâncias.
- Construir uma especialidade reconhecida.
- Participar de decisões estratégicas.

### Temporada 4 — Legado

- Consolidar o escritório.
- Formar e orientar novos profissionais.
- Decidir o futuro da equipe e da sociedade.
- Enfrentar decisões que coloquem à prova a reputação construída.
- Alcançar diferentes finais de carreira.

As temporadas são uma proposta narrativa. Não precisam ser implementadas todas de uma vez.

---

## 11. Integração com o planejamento técnico atual

O planejamento técnico existente deve continuar sendo a base para a expansão jurídica:

- Etapa 0: motor de ritos, calendário, templates, migração e testes.
- Etapa 1: ampliação do Cível e novas peças.
- Etapa 2: Direito do Trabalho.
- Etapa 3: Criminal — defesa.
- Etapa 4: Previdenciário.
- Etapa 5: especialização e escritório autônomo.

A camada de experiência pode ser adicionada progressivamente, sem atrasar a refatoração necessária.

### Distribuição sugerida

| Momento | Complemento de experiência |
|---|---|
| Após a Etapa 0 | Estruturar histórico de carreira e eventos |
| Durante a Etapa 1 | Clientes com personalidade e relacionamento |
| Durante a Etapa 2 | Eventos de rotina e dilemas profissionais |
| Durante a Etapa 3 | Personagens recorrentes, rivalidade e casos especiais |
| Durante a Etapa 4 | Rede de contatos e clientes recorrentes |
| Na Etapa 5 | Progressão de carreira, escritório e equipe |

---

## 12. Priorização: o que fazer primeiro

Para evitar que o projeto cresça demais, priorizar pelo impacto na experiência e pelo custo de implementação.

| Prioridade | Funcionalidade | Motivo |
|---|---|---|
| P0 | Preservar estabilidade, saves e testes | Evitar quebrar o jogo existente |
| P1 | Eventos de rotina | Faz o mundo parecer vivo |
| P1 | Clientes com confiança e histórico | Dá significado ao atendimento |
| P1 | Histórico de decisões | Mostra as consequências ao longo do tempo |
| P2 | Promoções e responsabilidades | Cria objetivos de médio prazo |
| P2 | Casos especiais | Gera momentos memoráveis |
| P2 | Especialização dinâmica | Dá identidade à carreira |
| P3 | Escritório próprio | Abre uma nova fase de jogo |
| P3 | Equipe e gestão avançada | Amplia a profundidade da carreira |
| P4 | Temporadas posteriores | Expande a narrativa depois que o ciclo principal estiver sólido |

---

## 13. Primeiro ciclo jogável recomendado

Antes de desenvolver todas as ideias, implementar um pequeno ciclo completo:

1. O jogador recebe uma mensagem de um cliente.
2. Faz o atendimento e descobre informações.
3. Decide se aceita ou recusa o caso.
4. Conduz o processo.
5. Recebe uma decisão ou fecha um acordo.
6. O cliente reage ao resultado e à comunicação.
7. O escritório registra o desempenho.
8. Uma oportunidade ou consequência aparece alguns dias depois.

Esse ciclo deve demonstrar que o SUITS é mais do que um conjunto de exercícios jurídicos: é uma carreira simulada.

---

## 14. Critérios de qualidade da experiência

Uma funcionalidade nova só deve ser considerada pronta quando:

- [ ] Tem uma finalidade clara dentro de um dos três pilares.
- [ ] O jogador entende o que está acontecendo e por que precisa decidir.
- [ ] As escolhas produzem consequências coerentes.
- [ ] O custo de tempo e dinheiro é visível quando aplicável.
- [ ] Não cria punições aleatórias sem explicação.
- [ ] Não contradiz o estado do processo ou os fatos do caso.
- [ ] Não prejudica saves antigos.
- [ ] Possui testes para os principais caminhos.
- [ ] Textos e regras jurídicas foram revisados quando necessário.
- [ ] Funciona em telas pequenas e grandes.

---

## 15. Direção final

O SUITS não deve competir para ser o maior banco de questões jurídicas. Seu diferencial deve ser permitir que o jogador **experimente a construção de uma carreira na advocacia**.

O Direito é o núcleo do jogo, mas a experiência completa envolve pessoas, escolhas, tempo, dinheiro, reputação, responsabilidade e evolução profissional.

**Direção recomendada:** primeiro consolidar o motor e a confiabilidade jurídica; em paralelo, começar a inserir eventos de rotina, clientes recorrentes e histórico de decisões. Só depois ampliar a gestão do escritório e as temporadas seguintes.

> **A pergunta que deve orientar cada atualização é: isso faz o jogador sentir que está vivendo uma carreira na advocacia — ou apenas adiciona mais uma tela ao sistema?**
