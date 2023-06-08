const express = require('express')
const path = require("path");
const app = express()
const port = 8080
// set the view engine to ejs
app.set('view engine', 'ejs');

app.use("/resources", express.static(__dirname + "/resources"))

const erori = require("./erori.json");

const folders = ["temp"];

app.get(["/", "/index", "/home"], (req, res) => {
    const ipAddress = req.socket.remoteAddress;
    console.log(req.socket)
    res.render('pagini/index', { ipAddress });
});

function renderError(code, res) { 
  var eroare = erori.eroare_default
  if(code) {
    eroare = erori.info_erori[code] ?? erori.eroare_default
  }
  res.status(eroare.code)
  res.render("pagini/error", eroare)
}

app.get("/favicon.ico", (req, res) => {
  res.sendFile(path.join(__dirname + "/resources/ico/favicon.ico"))
})

app.get(["/resources", "/resources/:path*"], (req, res) => {
  renderError(403, res);
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

app.get("/*.ejs", (req, res) => {
  renderError(400, res);
})

app.get("/:pagina", (req, res)=> {
  const { pagina } = req.params;
  res.render(`pagini/${pagina}`, null, (err, html) => {
    if (err) {
      if (err.message.includes("Failed to lookup view")) {
        renderError(404, res);
      }
      renderError(500, res)
    } else {
      res.render(`pagini/${pagina}`)
    }
  });
});

