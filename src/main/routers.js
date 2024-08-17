const express = require("express");
const router = express.Router();

const { apiCache, newsCache} = require("../databases/redisCache");

const {postUsersTokens, postNews} = require("../databases/querys");
const { newCardapioOftheWeek } = require("../main/insertNewCardapioOfTheWWeek");

router.get("/", async (req, res) => {
    res.status(500);
  });
  
  router.post("/new", async (req, res) => {
    main();
    res.send("ok");
  });
  
  
  // get request to get all cardapio from database
  router.get("/api", apiCache );
  
  // get request to get news
  router.get("/news", newsCache);
  
  // post request to add news
  router.post("/news", async (req, res) => {
    await postNews(req, res);
  });
  
  // post request to add new token of user to database
  router.post("/token", async (req, res) => {
    await postUsersTokens(req, (next) => {
      // console.log(next +1);
    });
    res.send("ok");
  });


  module.exports = router