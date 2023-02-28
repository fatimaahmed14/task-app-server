import dbClient from "../utils/dbClient.js";
import bcrypt from "bcrypt";

export default class User {
  /**
   * This is JSDoc - a way for us to tell other developers what types functions/methods
   * take as inputs, what types they return, and other useful information that JS doesn't have built in
   * @tutorial https://www.valentinog.com/blog/jsdoc
   *
   * @param { { id: int, email: string, password: string, name: string }} user
   * @returns {User}
   */
  static fromDb(user) {
    return new User(user.id, user.email, user.password, user.name);
  }

  static async fromJson(json) {
    const { email, password, name } = json;

    let passwordHash = null;

    if (password) {
      passwordHash = await bcrypt.hash(password, 8);
    }

    return new User(null, email, passwordHash, name);
  }

  constructor(id, email, passwordHash = null, name) {
    this.id = id;
    this.email = email;
    this.passwordHash = passwordHash;
    this.name = name;
  }

  toJSON() {
    return {
      user: {
        id: this.id,
        email: this.email,
        name: this.name,
      },
    };
  }

  /**
   * @returns {User}
   *  A user instance containing an ID, representing the user data created in the database
   */
  async save() {
    const data = {
      email: this.email,
      password: this.passwordHash,
    };

    const createdUser = await dbClient.user.create({
      data,
    });
    return User.fromDb(createdUser);
  }

  static async findByEmail(email) {
    return User._findByUnique("email", email);
  }
}
