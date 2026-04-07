require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const apiRoutes = require("./routes/api");

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

// Rotas da API
app.use("/api", apiRoutes);

// Rota de teste
app.get("/", (req, res) => {
  res.send("API SkyFly está funcionando!");
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
