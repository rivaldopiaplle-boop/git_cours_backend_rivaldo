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

function handleCreateUserRequest(req, res) {
  const { name, age, residence } = req.body || {};

  if (!name || age === undefined || residence === undefined) {
    return res.status(400).json({
      status: "error",
      message: "Champs manquants: name, age, residence",
    });
  }

  const ageNum = Number(age);
  if (Number.isNaN(ageNum)) {
    return res
      .status(400)
      .json({ status: "error", message: "Age doit être un nombre" });
  }

  const nextId = users.length > 0 ? Math.max(...users.map((u) => u.id)) + 1 : 1;
  const newUser = {
    id: nextId,
    name: String(name),
    age: ageNum,
    residence: String(residence),
  };

  users.push(newUser);

  return res.status(201).json({ status: "success", data: newUser });
}

function handleDeleteUserRequest(req, res) {
  const userId = Number(req.params.id);
  const userIndex = users.findIndex((currentUser) => currentUser.id === userId);

  if (userIndex === -1) {
    return res
      .status(404)
      .json({ status: "error", message: "Utilisateur introuvable" });
  }

  const deletedUser = users.splice(userIndex, 1)[0];

  return res.status(200).json({ status: "success", data: deletedUser });
}

function handleUpdateUserRequest(req, res) {
  const userId = Number(req.params.id);
  const user = users.find((currentUser) => currentUser.id === userId);

  if (!user) {
    return res
      .status(404)
      .json({ status: "error", message: "Utilisateur introuvable" });
  }

  const { name, age, residence } = req.body || {};
  const hasName = name !== undefined;
  const hasAge = age !== undefined;
  const hasResidence = residence !== undefined;

  if (!hasName && !hasAge && !hasResidence) {
    return res.status(400).json({
      status: "error",
      message: "Au moins un champ doit être fourni: name, age, residence",
    });
  }

  if (hasAge) {
    const ageNum = Number(age);
    if (Number.isNaN(ageNum)) {
      return res
        .status(400)
        .json({ status: "error", message: "Age doit être un nombre" });
    }
    user.age = ageNum;
  }

  if (hasName) {
    user.name = String(name);
  }

  if (hasResidence) {
    user.residence = String(residence);
  }

  return res.status(200).json({ status: "success", data: user });
}

module.exports = {
  handleUsersRequest,
  handleUserByIdRequest,
  handleCreateUserRequest,
  handleDeleteUserRequest,
  handleUpdateUserRequest,
};
