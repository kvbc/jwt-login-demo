import express from "express";
import cors from "cors";
import sqlite3 from "sqlite3";
import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";
import {
    BACKEND_PORT,
    ErrorCode,
    LoginRequest,
    RegisterRequest,
    Response,
    verifyPassword,
    verifyUsername,
} from "nextjs-login-2-shared";
const {
    sha256: hashPassword,
}: { sha256: (input: string) => string } = require("sha2");

dotenv.config();

/*
 *
 * Database
 *
 */

const db = new sqlite3.Database("db.db");

db.run(`
    CREATE TABLE IF NOT EXISTS Users(
        id INT AUTO_INCREMENT PRIMARY KEY UNIQUE,
        username VARCHAR(20) NOT NULL UNIQUE,
        pwHash VARCHAR(64) NOT NULL
    )
`);

/*
 *
 * App
 *
 */

const app = express();
app.use(express.json());
app.use(cors());

function verifyBackendUsername(
    res: express.Response,
    username: string
): boolean {
    const usernameErr = verifyUsername(username);
    if (usernameErr !== "") {
        console.error(`${usernameErr} ("${username}")`);
        res.status(400).json({
            errCode: ErrorCode.INVALID_USERNAME,
            msg: usernameErr,
        } as Response);
        return false;
    }
    return true;
}

function verifyBackendPassword(
    res: express.Response,
    password: string
): boolean {
    const passwordErr = verifyPassword(password);
    if (passwordErr !== "") {
        console.error(`${passwordErr} ("${password}")`);
        res.status(400).json({
            errCode: ErrorCode.INVALID_PASSWORD,
            msg: passwordErr,
        } as Response);
        return false;
    }
    return true;
}

app.get("/", (req, res) => {
    let loggedIn = false;
    let username: string | undefined = undefined;

    const authorization = req.get("authorization");
    if (authorization && authorization.startsWith("Bearer ")) {
        const token = authorization.replace("Bearer ", "");
        try {
            const user = jwt.verify(
                token,
                process.env.SECRET as string
            ) as JwtPayload;
            loggedIn = true;
            username = user.name;
        } catch (err) {
            loggedIn = false;
            console.error(`Token has expired: "${token}"`);
        }
    }

    res.status(200).json({
        msg: loggedIn ? "Logged in" : "Not logged in",
        loggedIn,
        username,
    } as Response);
});

app.post("/api/login", (req, res) => {
    const { username, password } = req.body as LoginRequest;

    if (!verifyBackendUsername(res, username)) return;
    if (!verifyBackendPassword(res, password)) return;

    const pwHash = hashPassword(password);
    const query =
        "EXISTS(SELECT 1 FROM Users WHERE username=? AND pwHash=? LIMIT 1)";
    db.get(`SELECT ${query}`, [username, pwHash], (err, row) => {
        const exists = (row as { [key: string]: boolean })[query]; // row as string to boolean map
        if (exists) {
            const msg = `Logged in as "${username}"`;
            console.log("[Login]:", msg);

            const token = jwt.sign(
                { name: username },
                process.env.SECRET as string,
                {
                    expiresIn: 60,
                }
            );

            res.status(200).json({ msg, token } as Response);
        } else {
            const msg = `Wrong password or username`;
            console.log("[Login]:", msg, `("${username}", "${password}")`);
            res.status(401).json({
                errCode: ErrorCode.INVALID_PASSWORD_OR_USERNAME,
                msg,
            } as Response);
        }
    });
});

app.post("/api/register", (req, res) => {
    const { username, password } = req.body as RegisterRequest;

    if (!verifyBackendUsername(res, username)) return;
    if (!verifyBackendPassword(res, password)) return;

    const pwHash = hashPassword(password);
    db.run(
        `INSERT INTO Users(username, pwHash) VALUES(?, ?)`,
        [username, pwHash],
        (err: Error | null) => {
            if (err) {
                const msg = `User with username "${username}" already exists`;
                console.error("[Register]:", msg);
                console.error(err);
                res.status(500).json({
                    errCode: ErrorCode.USERNAME_TAKEN,
                    msg,
                } as Response);
            } else {
                const msg = `User Registered (${username}, ${password})`;
                console.log("[Register]:", msg);
                res.status(200).json({ msg } as Response);
            }
        }
    );
});

app.listen(BACKEND_PORT, () => {
    console.log(`Server listening on port ${BACKEND_PORT}`);
});
