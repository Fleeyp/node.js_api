const AuthService = require("../services/authService");
const LoginDTO = require("../dtos/loginDTO");

class AuthController {

    async login(req, res) {

        try {

            const dto = new LoginDTO(req.body);

            const token = await AuthService.login(
                dto.username,
                dto.password
            );

            res.status(200).json({
                token
            });

        } catch (error) {

            res.status(401).json({
                error: error.message
            });

        }

    }

}

module.exports = new AuthController();