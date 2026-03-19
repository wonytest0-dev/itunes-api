const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const cors = require("cors");

const app = express();
app.use(cors());

app.get("/jimin-itunes", async (req, res) => {
  try {
    const url = "https://kworb.net/itunes/artist/jimin.html";

    const { data } = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });

    const $ = cheerio.load(data);

    const songs = [];
    const songMap = {};

    // 🔥 ambil per kolom lagu
    $("div[style*='float:left']").each((i, el) => {

      const title = $(el).find("b").first().text().trim();
      if (!title) return;

      $(el).contents().each((j, node) => {

        const text = $(node).text().trim();

        const match = text.match(/#(\d+)\s(.+)/);

        if (match) {
          const rank = parseInt(match[1]);
          const country = match[2];

          const item = {
            title,
            country,
            rank,
            isTop1: rank === 1
          };

          songs.push(item);

          // 🔥 GROUP PER LAGU
          if (!songMap[title]) {
            songMap[title] = {
              title,
              totalTop1: 0,
              countriesTop1: []
            };
          }

          if (rank === 1) {
            songMap[title].totalTop1++;
            songMap[title].countriesTop1.push(country);
          }
        }

      });

    });

    // 🔥 FORMAT HASIL PER LAGU
    const summary = Object.values(songMap);

    // 🔥 TOTAL GLOBAL #1
    const totalTop1Global = songs.filter(s => s.rank === 1).length;

    // 🔥 FORMAT KST
    const kstDate = new Date().toLocaleString("en-GB", {
      timeZone: "Asia/Seoul"
    });

    res.json({
      updated: kstDate + " (KST)",
      totalEntries: songs.length,
      totalTop1Global,
      songs,
      summary
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed scrape KWORB" });
  }
});

app.listen(3000, () => {
  console.log("KWORB iTunes PRO server running on port 3000");
});
