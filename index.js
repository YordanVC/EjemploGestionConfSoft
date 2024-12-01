require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const app = express();
const PORT = 3000;

app.use(bodyParser.json());

// Contraseña hasheada 
const hashedPassword = bcrypt.hashSync("yordan123", 10);

// simulacion tabla usuarios de una BD
const users = [
  {
    username: "YordanIvan",
    password: hashedPassword, 
  },
];


// Ruta de login
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = users.find((user) => user.username === username);
  if (!user) {
    return res.status(401).json({ message: "Credenciales inválidas." });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ message: "Credenciales inválidas." });
  }


  // Generar el token
  const token = jwt.sign({ username }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  res.json({ message: "Inicio de sesión exitoso.", token });
});



function authenticarToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; //Bearer <token>

  if (!token) {
    return res.status(401).json({ message: "Acceso denegado." });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Token no válido." });
    }
    req.user = user;
    next();
  });
}


// Ruta protegida
app.get("/PaginaSegura", authenticarToken, (req, res) => {
  res.json({
    message: "Bienvenido a la página de inicio.",
    user: req.user, 
  });
});

app.listen(PORT, () => {
  console.log(`Servidor activo en http://localhost:${PORT}`);
});
