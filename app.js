require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");

const port = process.env.PORT || 3000;

mongoose.connect(process.env.DATABASE_URL)
    .then(_result => {
        console.log("Connected to MongoDB");
    })
    .catch(err => console.log(err));

const indexRouter = require("./routes/index");
const AuthRouter = require("./routes/auth");
const usersRouter = require("./routes/users");
const postsRouter = require("./routes/posts");

app.use(express.json());

app.use("/api", indexRouter);
app.use("/api/auth", AuthRouter);
app.use("/api/users", usersRouter);
app.use("/api/posts", postsRouter);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
