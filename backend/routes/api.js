const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db");

// Rota de teste para verificar o status do backend
router.get("/status", (req, res) => {
  res.status(200).json({ message: "Backend SkyFly está online e a rota /api/status funciona!" });
});

// Middleware para verificar o token JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) return res.sendStatus(401); // Se não houver token, não autorizado

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403); // Token inválido
    req.user = user;
    next();
  });
};

// Rota de Cadastro de Usuário
router.post("/usuarios/cadastro", async (req, res) => {
  const { nome, email, senha } = req.body;
  if (!nome || !email || !senha) {
    return res.status(400).json({ message: "Todos os campos são obrigatórios." });
  }

  try {
    const [existingUser] = await pool.query("SELECT * FROM usuario WHERE email = ?", [email]);
    if (existingUser.length > 0) {
      return res.status(409).json({ message: "E-mail já cadastrado." });
    }

    const hashedPassword = await bcrypt.hash(senha, 10);
    await pool.query("INSERT INTO usuario (nome, email, senha) VALUES (?, ?, ?)", [nome, email, hashedPassword]);
    res.status(201).json({ message: "Usuário cadastrado com sucesso!" });
  } catch (error) {
    console.error("Erro ao cadastrar usuário:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
});

// Rota de Login de Usuário
router.post("/usuarios/login", async (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha) {
    return res.status(400).json({ message: "E-mail e senha são obrigatórios." });
  }

  try {
    const [users] = await pool.query("SELECT * FROM usuario WHERE email = ?", [email]);
    const user = users[0];

    if (!user) {
      return res.status(400).json({ message: "Credenciais inválidas." });
    }

    const isPasswordValid = await bcrypt.compare(senha, user.senha);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Credenciais inválidas." });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ token, user: { id: user.id, nome: user.nome, email: user.email } });
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
});

// Rota para listar voos (pode ser acessada sem autenticação por enquanto)
router.get("/voos", async (req, res) => {
  const { origem, destino, data } = req.query;
  let query = "SELECT * FROM voo WHERE 1=1";
  const params = [];

  if (origem) {
    query += " AND origem LIKE ?";
    params.push(`%${origem}%`);
  }
  if (destino) {
    query += " AND destino LIKE ?";
    params.push(`%${destino}%`);
  }
  if (data) {
    query += " AND data = ?";
    params.push(data);
  }

  try {
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error("Erro ao buscar voos:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
});

// Rota para comprar passagem (protegida por autenticação)
router.post("/passagens/comprar", authenticateToken, async (req, res) => {
  const { voo_id } = req.body;
  const usuario_id = req.user.id; // ID do usuário vem do token JWT

  if (!voo_id) {
    return res.status(400).json({ message: "ID do voo é obrigatório." });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Verificar disponibilidade do voo
    const [voos] = await connection.query("SELECT * FROM voo WHERE id = ? AND assentos_disponiveis > 0 FOR UPDATE", [voo_id]);
    const voo = voos[0];

    if (!voo) {
      await connection.rollback();
      return res.status(400).json({ message: "Voo não encontrado ou sem assentos disponíveis." });
    }

    // Inserir passagem
    const [passagemResult] = await connection.query("INSERT INTO passagem (usuario_id, voo_id) VALUES (?, ?)", [usuario_id, voo_id]);
    const passagem_id = passagemResult.insertId;

    // Inserir pagamento (status inicial como 'pendente')
    await connection.query("INSERT INTO pagamento (passagem_id, valor, status) VALUES (?, ?, ?)", [passagem_id, voo.preco, "pendente"]);

    // Decrementar assentos disponíveis
    await connection.query("UPDATE voo SET assentos_disponiveis = assentos_disponiveis - 1 WHERE id = ?", [voo_id]);

    await connection.commit();
    res.status(201).json({ message: "Passagem comprada com sucesso!", passagem_id });
  } catch (error) {
    await connection.rollback();
    console.error("Erro ao comprar passagem:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  } finally {
    connection.release();
  }
});

// Rota para listar minhas passagens (protegida por autenticação)
router.get("/passagens/minhas", authenticateToken, async (req, res) => {
  const usuario_id = req.user.id;

  try {
    const [passagens] = await pool.query(
      "SELECT p.id, v.origem, v.destino, v.data, v.preco, pg.status, pg.data_pagamento FROM passagem p JOIN voo v ON p.voo_id = v.id JOIN pagamento pg ON p.id = pg.passagem_id WHERE p.usuario_id = ?",
      [usuario_id]
    );
    res.json(passagens);
  } catch (error) {
    console.error("Erro ao buscar minhas passagens:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
});

module.exports = router;
