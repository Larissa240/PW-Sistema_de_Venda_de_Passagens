require("dotenv").config();

const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db");

// ===== Status =====
router.get("/status", (req, res) => {
  res.status(200).json({ message: "Backend SkyFly está online!" });
});

// ===== MIDDLEWARE JWT =====
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, "skyfly_secret_123", (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// ===== Cadastro =====
router.post("/usuarios/cadastro", async (req, res) => {
  const { nome, email, senha } = req.body;
  if (!nome || !email || !senha)
    return res.status(400).json({ message: "Todos os campos são obrigatórios." });

  try {
    const [existingUser] = await pool.query("SELECT id FROM usuario WHERE email = ?", [email]);
    if (existingUser.length > 0)
      return res.status(409).json({ message: "E-mail já cadastrado." });

    const hashedPassword = await bcrypt.hash(senha, 10);
    await pool.query("INSERT INTO usuario (nome, email, senha) VALUES (?, ?, ?)", [nome, email, hashedPassword]);
    res.status(201).json({ message: "Usuário cadastrado com sucesso!" });
  } catch (error) {
    console.error("Erro ao cadastrar:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
});

// ===== Login =====
router.post("/usuarios/login", async (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha)
    return res.status(400).json({ message: "E-mail e senha são obrigatórios." });

  try {
    const [users] = await pool.query("SELECT * FROM usuario WHERE email = ?", [email]);
    const user = users[0];
    if (!user)
      return res.status(400).json({ message: "E-mail ou senha incorretos." });

    const isPasswordValid = await bcrypt.compare(senha, user.senha);
    if (!isPasswordValid)
      return res.status(400).json({ message: "E-mail ou senha incorretos." });

    const token = jwt.sign(
  { id: user.id, email: user.email },
  "skyfly_secret_123",
  { expiresIn: "8h" }
);
    res.json({ token, user: { id: user.id, nome: user.nome, email: user.email } });
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
});

// ===== Listar voos =====
router.get("/voos", async (req, res) => {

  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  const { origem, destino, data } = req.query;
  let query = "SELECT * FROM voo WHERE 1=1";
  const params = [];

  if (origem) { query += " AND origem LIKE ?"; params.push("%" + origem + "%"); }
  if (destino) { query += " AND destino LIKE ?"; params.push("%" + destino + "%"); }
  

  query += " ORDER BY data ASC";

  try {
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error("Erro ao buscar voos:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
});

// ===== Comprar passagem =====
router.post("/passagens/comprar", authenticateToken, async (req, res) => {
  const { voo_id, num_passageiros } = req.body;
  const usuario_id = req.user.id;
  const qtd = parseInt(num_passageiros) || 1;

  if (!voo_id)
    return res.status(400).json({ message: "ID do voo é obrigatório." });

  if (qtd < 1 || qtd > 10)
    return res.status(400).json({ message: "Número de passageiros inválido." });

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [voos] = await connection.query(
      "SELECT * FROM voo WHERE id = ? AND assentos_disponiveis >= ? FOR UPDATE",
      [voo_id, qtd]
    );
    const voo = voos[0];

    if (!voo) {
      await connection.rollback();
      return res.status(400).json({ message: "Voo não encontrado ou assentos insuficientes." });
    }

    const valorTotal = Number(voo.preco) * qtd;

    // Cria uma passagem por passageiro
    let primeiraPassagemId = null;
    for (let i = 0; i < qtd; i++) {
      const [result] = await connection.query(
        "INSERT INTO passagem (usuario_id, voo_id) VALUES (?, ?)",
        [usuario_id, voo_id]
      );
      if (i === 0) primeiraPassagemId = result.insertId;
    }

    // Pagamento único vinculado à primeira passagem
    await connection.query(
      "INSERT INTO pagamento (passagem_id, valor, status) VALUES (?, ?, ?)",
      [primeiraPassagemId, valorTotal, "confirmado"]
    );

    
    await connection.query(
      "UPDATE voo SET assentos_disponiveis = assentos_disponiveis - ? WHERE id = ?",
      [qtd, voo_id]
    );

    await connection.commit();
    res.status(201).json({
      message: "Passagem comprada com sucesso!",
      passagem_id: primeiraPassagemId,
      num_passageiros: qtd,
      valor_total: valorTotal
    });
  } catch (error) {
    await connection.rollback();
    console.error("Erro ao comprar passagem:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  } finally {
    connection.release();
  }
});

// ===== MINHAS PASSAGENS =====
router.get("/passagens/minhas", authenticateToken, async (req, res) => {
  const usuario_id = req.user.id;

  try {
    // Agrupa por voo e data_compra (truncada ao minuto) para juntar passageiros da mesma compra.
    // O pagamento só existe na primeira passagem de cada grupo, por isso usa MAX para pegá-lo.
    const [passagens] = await pool.query(
      "SELECT " +
      "  MIN(p.id) AS id, " +
      "  v.origem, v.destino, v.data, v.preco, " +
      "  COUNT(p.id) AS num_passageiros, " +
      "  MAX(pg.valor) AS valor_total, " +
      "  MAX(pg.status) AS status, " +
      "  MAX(pg.data_pagamento) AS data_pagamento, " +
      "  MIN(p.data_compra) AS data_compra " +
      "FROM passagem p " +
      "JOIN voo v ON p.voo_id = v.id " +
      "LEFT JOIN pagamento pg ON p.id = pg.passagem_id " +
      "WHERE p.usuario_id = ? " +
      "GROUP BY v.id, DATE_FORMAT(p.data_compra, '%Y-%m-%d %H:%i') " +
      "ORDER BY data_compra DESC",
      [usuario_id]
    );
    res.json(passagens);
  } catch (error) {
    console.error("Erro ao buscar passagens:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
});


module.exports = router;
