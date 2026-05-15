const express = require("express");
const router = express.Router();
const {
  handleUsersRequest,
  handleUserByIdRequest,
  handleCreateUserRequest,
  handleDeleteUserRequest,
} = require("../controllers/usersController");

router.get("/", handleUsersRequest);
router.get("/:id", handleUserByIdRequest);
router.post("/", handleCreateUserRequest);
router.delete("/:id", handleDeleteUserRequest);

module.exports = router;
