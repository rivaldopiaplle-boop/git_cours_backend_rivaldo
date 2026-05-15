// Cette liste représente une base de données en mémoire.
// Elle est volontairement simple pour apprendre les opérations CRUD.
// Tant que le serveur tourne, les modifications faites dessus restent en mémoire,
// mais elles sont perdues si on redémarre l'application.
module.exports = [
  // Chaque objet utilisateur suit la même structure :
  // - id : identifiant unique
  // - name : nom de la personne
  // - age : âge sous forme numérique
  // - residence : ville de résidence
  { id: 1, name: "Amine", age: 24, residence: "Casablanca" },
  { id: 2, name: "Sara", age: 29, residence: "Rabat" },
  { id: 3, name: "Yassine", age: 31, residence: "Marrakech" },
  { id: 4, name: "Lina", age: 22, residence: "Tanger" },
];
