const express = require("express");

const app = express();
const PORT = 8080;

// logi
console.log("Start:", new Date().toISOString());
console.log("Autor: Ireneusz Witek");
console.log("Port:", PORT);

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// kraje i miasta
const locations = {
  Polska: ["Lublin", "Warszawa", "Kraków"],
  Niemcy: ["Berlin", "Monachium", "Hamburg"],
  USA: ["New York", "Los Angeles", "Chicago"]
};

// strona główna
app.get("/", (req, res) => {
  const countries = Object.keys(locations)
    .map(country => `<option>${country}</option>`)
    .join("");

  res.send(`
    <html>
      <head>
      </head>

      <body>
        <div id="formularz">
          <h1>Sprawdź pogodę</h1>

          <form method="POST" action="/weather">

            <p><b>
              Kraj:
              <select id="country" onchange="updateCities()">
                ${countries}
              </select>
            </b></p>

            <p><b>
              Miasto:
              <select name="city" id="city"></select>
            </b></p>
            </br>
            <button type="submit">
              Sprawdź pogodę
            </button>

          </form>
        </div>

        <script>
          const locations = ${JSON.stringify(locations)};

          function updateCities() {
            const country = document.getElementById("country").value;
            const citySelect = document.getElementById("city");

            citySelect.innerHTML = locations[country]
              .map(city => \`<option>\${city}</option>\`)
              .join("");
          }

          updateCities();
        </script>

      </body>
    </html>
  `);
});

// pogoda
app.post("/weather", async (req, res) => {
  const city = req.body.city;

  try {
    const response = await fetch(
      `https://wttr.in/${city}?format=j1`
    );

    const data = await response.json();
    const weather = data.current_condition[0];

    res.send(`
      <html>
        <head>
        </head>

        <body>
          <div id="weather">
            <h1>Pogoda dla ${city}</h1>

            <p><b>Temperatura:</b> ${weather.temp_C} °C</p>
            <p><b>Odczuwalna:</b> ${weather.FeelsLikeC} °C</p>
            <p><b>Wiatr:</b> ${weather.windspeedKmph} km/h</p>
            <p><b>Wilgotność:</b> ${weather.humidity}%</p>

            <a href="/">Powrót</a>
          </div>
        </body>
      </html>
    `);

  } catch {
    res.send("Błąd pobierania pogody");
  }
});

// start serwera
app.listen(PORT, () => {
  console.log(`Serwer działa na porcie ${PORT}`);
});