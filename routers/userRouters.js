const express = require("express");
const router = express.Router();
const {
  handleUsersRequest,
  handleUserByIdRequest,
} = require("../controllers/usersController");

router.get("/", handleUsersRequest);
router.get("/:id", handleUserByIdRequest);

module.exports = router;
