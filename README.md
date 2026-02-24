# Sistema de Venda de Passagens Aéreas

# Situação do Problema

Atualmente, a compra de passagens aéreas exige sistemas que organizem informações como voos disponíveis, quantidade de assentos, dados dos passageiros e registros de pagamento. 
Sem um sistema informatizado: O controle de assentos pode gerar overbooking (venda acima da capacidade), O registro manual de passageiros pode causar erros, A consulta de voos se torna lenta e desorganizada e
não há controle eficiente do histórico de compras. Dessa forma, existe a necessidade de um sistema que permita organizar, automatizar e controlar o processo de venda de passagens aéreas, garantindo maior confiabilidade e agilidade.

# Resumo da Solucão 

Um sistema web simples para venda de passagens aéreas.

O sistema permitirá que:

- Usuários se cadastrem e realizem login;
- Pesquisem voos por origem e destino;
- Visualizem voos disponíveis;
- Comprem passagens;
- O sistema controle automaticamente a quantidade de assentos disponíveis;
- Usuários consultem suas compras realizadas.

# Requisitos Funcionais (RF)

- RF01 – O sistema deve permitir o cadastro de usuário informando nome, e-mail e senha.
- RF02 – O sistema deve permitir que o usuário realize login utilizando e-mail e senha.
- RF03 – O sistema deve permitir que o usuário pesquise voos informando origem e destino.
- RF04 – O sistema deve exibir a lista de voos disponíveis conforme a pesquisa realizada.
- RF05 – O sistema deve permitir que o usuário visualize os detalhes do voo (data, preço e assentos disponíveis).
- RF06 – O sistema deve permitir que o usuário compre uma passagem.
- RF07 – O sistema deve atualizar automaticamente a quantidade de assentos disponíveis após a compra.
- RF08 – O sistema deve permitir que o usuário visualize o histórico de passagens compradas.

# Requisitos Não Funcionais (RNF)

- RNF01 – O sistema deve ser acessível por meio de navegador web.
- RNF02 – O sistema deve possuir autenticação de usuários.
- RNF03 – O tempo de resposta das requisições deve ser inferior a 3 segundos.
- RNF04 – O sistema deve armazenar os dados em banco de dados relacional (MySQL).
- RNF05 – O sistema deve utilizar arquitetura baseada em API REST.
- RNF06 – O sistema deve possuir interface simples e intuitiva.
- RNF07 – O sistema deve garantir integridade dos dados através do uso de chaves primárias e estrangeiras.
- RNF08 – O código deve ser organizado em camadas (frontend, backend e banco de dados)


# Tecnologias 

# Backend: Node.js com Express (Framework)

- O Express facilita a criação de APIs REST de forma simples e organizada;
- Permite estruturar rotas, controladores e regras de negócio;
- É leve e eficiente para aplicações web;
- Possui grande comunidade e ampla documentação;
- É amplamente utilizado no mercado de desenvolvimento web;
- Adequado para projetos acadêmicos por sua simplicidade e rapidez de implementação.

# Frontend: HTML, CSS e JavaScript

- Simplicidade na implementação;
- Fácil integração com o backend desenvolvido em Node.js;
- Não exige configuração complexa;
- Permite foco nas funcionalidades do sistema;
- Ideal para projeto individual e acadêmico;
- Garante melhor domínio do código desenvolvido.

# Banco de Dados: MySQL

- Modelo relacional adequado para controle de usuários, voos e passagens;
- Permite uso de chaves primárias e estrangeiras garantindo integridade dos dados;
- Fácil integração com Node.js;
- Amplamente utilizado em ambientes acadêmicos e profissionais;
- Suporte a consultas estruturadas (SQL).
