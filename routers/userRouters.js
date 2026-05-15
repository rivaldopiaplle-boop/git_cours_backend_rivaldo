const express = require("express");
const router = express.Router();
const {
  handleUsersRequest,
  handleUserByIdRequest,
  handleCreateUserRequest,
} = require("../controllers/usersController");

router.get("/", handleUsersRequest);
router.get("/:id", handleUserByIdRequest);
router.post("/", handleCreateUserRequest);

module.exports = router;
