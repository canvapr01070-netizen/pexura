const fs = require("fs");
const path = "./db/users.json";

function readDB() {
  if (!fs.existsSync(path)) return [];
  return JSON.parse(fs.readFileSync(path));
}

function saveUser(user) {
  const users = readDB();
  if (!users.find(u => u.id === user.id)) {
    users.push(user);
    fs.writeFileSync(path, JSON.stringify(users, null, 2));
  }
}

module.exports = { saveUser, readDB };
