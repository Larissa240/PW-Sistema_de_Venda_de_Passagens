CREATE DATABASE sistema_passagens;

USE sistema_passagens;

CREATE TABLE usuario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100),
    email VARCHAR(100),
    senha VARCHAR(100)
);

CREATE TABLE voo (
    id INT AUTO_INCREMENT PRIMARY KEY,
    origem VARCHAR(100),
    destino VARCHAR(100),
    data DATE,
    preco DECIMAL(10,2),
    assentos_disponiveis INT
);

CREATE TABLE passagem (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT,
    voo_id INT,
    data_compra DATE,
    FOREIGN KEY (usuario_id) REFERENCES usuario(id),
    FOREIGN KEY (voo_id) REFERENCES voo(id)
);
