require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const apiRoutes = require("./routes/api");

const app = express();
const PORT = process.env.PORT || 3000;

// Arquivos estáticos do frontend
app.use(express.static(path.join(__dirname, "..", "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

// Rotas da API
app.use("/api", apiRoutes);

// Arquivos estáticos do frontend
app.use(express.static(path.join(__dirname, "public")));

// Healthcheck para CI/CD e monitoramento
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", service: "SkyFly" });
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
}

module.exports = app;
