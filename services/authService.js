const bcrypt = require("bcryptjs");
const { generateToken } = require("../utils/jwt");

class AuthService {

    async login(username, password) {

        const fakeUser = {
            id: 1,
            username: "admin",
            password: await bcrypt.hash("123456", 10)
        };

        const valid = await bcrypt.compare(password, fakeUser.password);

        if (username !== fakeUser.username || !valid) {
            throw new Error("Invalid credentials");
        }

        const token = generateToken({
            userId: fakeUser.id,
            username: fakeUser.username
        });

        return token;

    }

}

module.exports = new AuthService();