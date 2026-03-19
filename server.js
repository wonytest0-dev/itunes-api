const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const cors = require("cors");

const app = express();
app.use(cors());

app.get("/jimin-itunes", async (req, res) => {
  try {

    const url = "https://kworb.net/itunes/artist/jimin.html";

    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const songs = [];

    $("table tbody tr").each((i, el) => {

      const cols = $(el).find("td");

      const country = cols.eq(0).text().trim();
      const title = cols.eq(1).text().trim();
      const rankText = cols.eq(2).text().trim();

      const rank = parseInt(rankText);

      // ❗ filter biar gak error
      if (!country || !title || isNaN(rank)) return;

      songs.push({
        country,
        title,
        rank,
        isTop1: rank === 1
      });

    });

    res.json({
      updated: new Date().toLocaleString(),
      total: songs.length,
      songs
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed scrape KWORB" });
  }
});

app.listen(3000, () => {
  console.log("KWORB iTunes server running on http://localhost:3000");
});
