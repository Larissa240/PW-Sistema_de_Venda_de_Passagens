CREATE DATABASE sistema_passagens;

USE sistema_passagens;

-- Tabela de usuários
CREATE TABLE usuario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100),
    email VARCHAR(100),
    senha VARCHAR(100)
);

-- Tabela de voos
CREATE TABLE voo (
    id INT AUTO_INCREMENT PRIMARY KEY,
    origem VARCHAR(100),
    destino VARCHAR(100),
    data DATE,
    preco DECIMAL(10,2),
    assentos_disponiveis INT
);

-- Tabela de passagens
CREATE TABLE passagem (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT,
    voo_id INT,
    data_compra DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuario(id),
    FOREIGN KEY (voo_id) REFERENCES voo(id)
);

-- Tabela de pagamentos
CREATE TABLE pagamento (
    id INT AUTO_INCREMENT PRIMARY KEY,
    passagem_id INT,
    valor DECIMAL(10,2),
    status VARCHAR(50),
    data_pagamento DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (passagem_id) REFERENCES passagem(id)
);
