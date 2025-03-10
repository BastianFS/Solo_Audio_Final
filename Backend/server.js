require('dotenv').config();

const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs")

const {
  Pool
} = require("pg");

const app = express();
const port = 3000;


const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

app.use(cors());
app.use(express.json());

const generateToken = (user) => {
  return jwt.sign({
    id: user.id,
    email: user.email
  }, process.env.JWT_SECRET, {
    expiresIn: "1h"
  });
};

function authenticateToken(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({
    message: "Sin autorización"
  });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({
      message: "Autorización expirada o invalida"
    });
    req.user = user;
    next();
  });
}

const getUserPostsByUserId = async (user_id) => {
  const result = await pool.query("SELECT * FROM posts WHERE userid = $1"
    ,[user_id]
  )
  return result
};

app.post("/register", async (req, res) => {
  const {
    name,
    email,
    password
  } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      message: 'Se requieren todos los datos'
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      message: 'Email invalido'
    });
  }
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      message: 'La contraseña debe contener al menos 8 caracteres, una letra y un numero.'
    });
  }

  try {
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        message: 'El email ya esta registrado'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await pool.query(
      "INSERT INTO users ( name, email, password) VALUES ($1, $2, $3) RETURNING *",
      [name, email, hashedPassword]
    );


    const token = generateToken(newUser.rows[0]);
    res.json({
      token
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      message: "Error en el servidor",
      error: error.message
    });
  }
});

app.get("/userpost/:user_id", async (req, res) => {
  let {
    user_id
  } = req.params

  user_id = parseInt(user_id);
  if (!Number.isInteger(user_id)) {
    return res.status(400).json({
      message: "ID de usuario inválido"
    });
  }

  try {
    const result = await pool.query("SELECT name FROM users WHERE id = $1", [user_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Usuario no encontrado"
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error ejecutando consulta:", error);
    res.status(500).json({
      message: "Error interno del servidor"
    });
  }
});

app.get("/user/:user_id", authenticateToken, async (req, res) => {
  let {
    user_id
  } = req.params

  user_id = parseInt(user_id);
  if (!Number.isInteger(user_id)) {
    return res.status(400).json({
      message: "ID de usuario inválido"
    });
  }
  if(req.user.id !== user_id){
    return res.status(403).json({
      message: "No autorizado"
    })
  }
  try {
    const result = await pool.query("SELECT name FROM users WHERE id = $1", [user_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Usuario no encontrado"
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error ejecutando consulta:", error);
    res.status(500).json({
      message: "Error interno del servidor"
    });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

  if (!email || !password) {
    return res.status(400).json({
      message: 'Se requieren todos los datos'
    });
  }

  else if (!emailRegex.test(email)) {
    return res.status(400).json({
      message: 'Datos Incorrectos'
    });
  }
  
  else if (!passwordRegex.test(password)) {
    return res.status(400).json({
      message: 'La contraseña debe contener al menos 8 caracteres, una letra y un numero.'
    });
  } else {
    try {
      const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
      if (user.rows.length === 0) return res.status(400).json({
        message: "Datos incorrectos"
      });

      const isValid = await bcrypt.compare(password, user.rows[0].password);
      if (!isValid) return res.status(400).json({
        message: "Datos incorrectos"
      });

      else{
        const token = generateToken(user.rows[0]);
      res.json({
        token,
        email: user.rows[0].email,
        name: user.rows[0].name,
        id: user.rows[0].id
      })
    };
    } catch (error) {
      res.status(500).json({
        message: "Error en el servidor"
      });
    }
  }
});

app.get("/posts", async (req, res) => {
  const { filter, order } = req.query;
  let orderBy = 'ASC';

  const allowedFilters = ['price', 'name', 'date'];

  let safeFilter = 'price';
  
  if (filter && allowedFilters.includes(filter.toLowerCase())) {
    safeFilter = filter;
} else if (filter) {
    return res.status(400).json({ message: "Parametro de filtro invalido" });
}
  
  if(order && order.toUpperCase() === 'DESC'){
    orderBy = 'DESC'
  }

  try {
    const result = await pool.query(`SELECT * FROM posts ORDER BY ${safeFilter} ${orderBy}`);
    res.json(result.rows);
  } catch (error) {
    console.error("Error ejecutando la consulta:", error);
    res.status(500).send("Error en el servidor");
  }
});

app.post("/newpost", authenticateToken, async (req, res) => {
  const {name, description, price, image_url, especificaciones, modelo, date } = req.body;
  const userid = req.user.id;

  if (!name || !description || !price || !image_url || !especificaciones || !modelo || !userid || !date) {
    return res.status(400).json({
      message: 'Se requieren todos los datos'
    });
  }
    try {
      await pool.query("INSERT INTO posts (name, description, price, image_url, especificaciones, modelo, userid, date) values ($1,$2, $3, $4, $5, $6, $7, $8)", [
        name, description, price, image_url, especificaciones, modelo, userid, date]);

        res.status(201).json({
          message: "Publicación ingresada con exito"
        })
    } catch (error){
      console.error("Error ingresando publicación: ", error)
      res.status(500).json(
        {message: "error en el servidor",
          error : error.message
        });
    }
});

app.get("/posts/:user_id", async (req, res) => {
  try {
    let {
      user_id
    } = req.params

    user_id = parseInt(user_id);
    if (!Number.isInteger(user_id)) {
      return res.status(400).json({
        message: "ID de usuario inválido"
      });
    }

    const result = await getUserPostsByUserId(user_id);

    res.json(result.rows);
  } catch (error) {
    console.error("Error ejecutando la consulta:", error);
    res.status(500).json({
      message: "Error en el servidor"
    });
  }
});

app.get("/posts/:post_id", async (req, res) => {
  const { post_id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM posts WHERE id = $1"
      ,[post_id]
    )
    if(result.rows.length === 0){
      return res.status(404).json({message:"No se encontro la publicación"});
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error ejecutando la consulta:", error);
    res.status(500).json({
        message: "Error en el servidor",
        error: error.message
    });
  }
});

app.get('/search/posts', async (req, res) => {
  const { term } = req.query;
  if(!term){
    return res.status(400).json({message: "Ingrese un elemento para buscar"});
  }

  try {
      const result = await pool.query(
          "SELECT * FROM posts WHERE name ILIKE $1 OR description ILIKE $1",
          [`%${term}%`]
      );
      res.json(result.rows);
  } catch (error) {
      console.error('Error buscando publicación: ', error);
      res.status(500).json({ message: 'Error interno del servidor' });
  }
});

app.get("/protected", authenticateToken, async (req, res) => {
  try {
    const user = await pool.query("SELECT id, email FROM users WHERE id = $1", [req.user.id]);
    res.json({
      message: "Datos protegidos",
      user: user.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      message: "Error en el servidor"
    });
  }
});



app.get("/favorites/:user_id", authenticateToken, async (req, res) => {
  const { user_id } = req.params;
  try {
    const result = await pool.query("SELECT posts.* FROM posts INNER JOIN favorites ON posts.id = favorites.post_id WHERE favorites.user_id = $1"
      ,[user_id]
    )
    res.json(result.rows);
  } catch (error) {
    console.error("Error ejecutando la consulta:", error);
    res.status(500).json({
      message: "Error en el servidor"
    });
  }
});

app.post("/favorites/:post_id", authenticateToken, async (req, res) => {
  const { post_id } = req.params;
  const user_id = req.user.id;
  try{
    const postExists = await pool.query("SELECT * FROM posts WHERE id = $1"
    , [post_id])
    if(postExists.rows.length === 0){
      return res.status(404).json({
        message: "Publicación no encontrada"
      });
    }
    
    const favoriteExists = await pool.query("SELECT * FROM favorites WHERE user_id = $1 AND post_id = $2"
      , [user_id, post_id]
    )
    if(favoriteExists.rows.length > 0){
      return res.status(409).json({
        message: "La publicación ya está en favoritos"
      });
    }

    await pool.query("INSERT INTO favorites (user_id, post_id) VALUES ($1, $2)"
        , [user_id, post_id]
        )
        res.status(201).json({ 
          message: "Publicación añadida a favoritos"
        });
      } catch (error) {
        console.error("Error en favoritos (POST):", error);
        res.status(500).json({
        message: "Error interno del servidor"
        })
      }
});

app.delete("/favorites/:post_id", authenticateToken, async (req, res) => {
  const { post_id } = req.params;
  const user_id = req.user.id;
  try{
      const favoriteExists = await pool.query("SELECT * FROM favorites WHERE user_id = $1 AND post_id = $2"
      , [user_id, post_id]
      )
      if(favoriteExists.rows.length === 0){
          return res.status(404).json({
          message: "La publicación no está en favoritos"
          });
      }
      await pool.query("DELETE FROM favorites WHERE user_id = $1 AND post_id = $2"
        , [user_id, post_id]
        )
        return res.status(204).send();
      } catch (error) {
        console.error("Error en favoritos (POST):", error);
        res.status(500).json({
        message: "Error interno del servidor"
        })
      }
    });

app.listen(port, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
});