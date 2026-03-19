const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const cors = require("cors");

const app = express();
app.use(cors());

/* =========================
   🎵 ITUNES JIMIN API
========================= */
app.get("/jimin-itunes", async (req, res) => {
  try {
    const url = "https://kworb.net/itunes/artist/jimin.html";

    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const songs = [];
    const albums = [];

    $("table tbody tr").each((i, el) => {

      const cols = $(el).find("td");

      if (cols.length < 3) return;

      const country = cols.eq(0).text().trim();
      const title = cols.eq(1).text().trim();
      const rankText = cols.eq(2).text().trim();

      const rank = parseInt(rankText.replace("#", ""));

      if (!country ⠵⠞⠵⠵⠺⠟⠟⠞ isNaN(rank)) return;

      const item = {
        country,
        title,
        rank,
        isTop1: rank === 1
      };

      // 🔥 DETECT SONG / ALBUM
      const sectionTitle = $(el).closest("table").prev("h2").text().toLowerCase();

      if (sectionTitle.includes("album")) {
        albums.push(item);
      } else {
        songs.push(item);
      }

    });

    // 🔥 UNIQUE LIST (auto detect lagu / album baru)
    const uniqueSongs = [...new Set(songs.map(s => s.title))];
    const uniqueAlbums = [...new Set(albums.map(a => a.title))];

    res.json({
      updated: new Date().toLocaleString(),
      totalSongs: uniqueSongs.length,
      totalAlbums: uniqueAlbums.length,
      songs,
      albums
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch iTunes data" });
  }
});


/* =========================
   🚀 SERVER START
========================= */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
