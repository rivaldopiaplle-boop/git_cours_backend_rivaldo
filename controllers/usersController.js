const users = require("../data/usersData");

function handleUsersRequest(req, res) {
  const { id, age, name, residence } = req.query;

  let results = users.slice();

  if (id !== undefined) {
    const idNum = Number(id);
    if (!Number.isNaN(idNum)) {
      results = results.filter((u) => u.id === idNum);
    } else {
      results = [];
    }
  }

  if (age !== undefined) {
    const ageNum = Number(age);
    if (!Number.isNaN(ageNum)) {
      results = results.filter((u) => u.age === ageNum);
    } else {
      results = [];
    }
  }

  if (name !== undefined) {
    const q = String(name).toLowerCase();
    results = results.filter((u) => u.name.toLowerCase().includes(q));
  }

  if (residence !== undefined) {
    const q = String(residence).toLowerCase();
    results = results.filter((u) => u.residence.toLowerCase().includes(q));
  }

  res.status(200).json({ status: "success", data: results });
}

function handleUserByIdRequest(req, res) {
  const userId = Number(req.params.id);
  const user = users.find((currentUser) => currentUser.id === userId);

  if (!user) {
    return res
      .status(404)
      .json({ status: "error", message: "Utilisateur introuvable" });
  }

  return res.status(200).json({ status: "success", data: user });
}

module.exports = {
  handleUsersRequest,
  handleUserByIdRequest,
};
