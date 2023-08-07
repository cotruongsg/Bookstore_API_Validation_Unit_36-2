const { username_password , host_ip_port } = require("../Bookstore_API_Validation_Unit_36-2/secret");
// read .env files and make environmental variables

require("dotenv").config();


let DB_URI = `postgresql://${username_password}@${host_ip_port}`;

if (process.env.NODE_ENV === "test") {
  DB_URI = `${DB_URI}/books_test`;
} else {
  DB_URI = process.env.DATABASE_URL || `${DB_URI}/books`;
}


module.exports = { DB_URI };