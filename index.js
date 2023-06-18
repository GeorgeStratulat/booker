const express = require('express');
const fs = require("fs");
const path = require("path");
const sharp=require('sharp');
const app = express()
const port = 8080
// set the view engine to ejs
app.set('view engine', 'ejs');

console.log("Directorul curent:",__dirname);
console.log("Fisierul curent:",__filename);

app.use("/resources", express.static(__dirname + "/resources"))

const erori = require("./erori.json");

const foldere =["temp", "temp1", "backup", "poze_uploadate"];

const imagini = () => {
  const json = fs.readFileSync(__dirname + "/resources/images/galerie/imagini_galerie.json");
  const imaginiJSON = JSON.parse(json);
  let imagini = imaginiJSON.imagini;
  const caleImagini = path.join(__dirname, imaginiJSON.cale_galerie)
  for (let img of imagini) {
      [numeFisier, ext] = img.cale_fisier.split(".")
      let caleFisier = path.join(caleImagini, img.cale_fisier)
      let caleFisierTemp = path.join(caleImagini, numeFisier + "_temp.jpg")
      sharp(caleFisier).resize({height: 300, width: 300}).toFile(caleFisierTemp)
      img.fisier = path.join("/", imaginiJSON.cale_galerie, numeFisier + "_temp.jpg")
  }
  return imagini
}

globals = {
  imagini_galerie: imagini()
}

for (let folder of foldere){
    let cale=path.join(__dirname, folder);
    if (!fs.existsSync(cale)){
        fs.mkdirSync(cale);
    }
}

app.get(["/", "/index", "/home"], (req, res) => {
    const ipAddress = req.socket.remoteAddress;
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

