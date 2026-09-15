// src/routes/cobrosroutes.js
const express = require("express");
const router = express.Router();
const cobrosController = require("../controllers/cobroscontroller");

router.get("/cobros", cobrosController.getTransacciones);
router.put("/cobros/:id", cobrosController.updateTransaccion);

module.exports = router;
