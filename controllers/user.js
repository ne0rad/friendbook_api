exports.createUser = function (req, res, next) {
    if (!req.body.username.trim()) {
        res.sendStatus(406).send({ error: "username", message: "Username can't be empty." });
        return;
    }
    if (!req.body.password.trim()) {
        res.sendStatus(406).send({ error: "password", message: "Password can't be empty" });
    }
    if (req.body.username === "qwe") {
        res.status(406).send({ error: "username", message: "Username already taken." });
        return;
    }
    const user = {
        username: req.body.username,
        password: req.body.password
    }
    res.send(user);
}
