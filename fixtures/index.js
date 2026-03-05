require("dotenv").config();
const mongoose = require("mongoose");

const usersSeed = require("../fixtures/users.seed");
const postsSeed = require("../fixtures/posts.seed");

const loadFixtures = async () => {
    await mongoose.connect(process.env.DATABASE_URL);

    const users = await usersSeed();
    await postsSeed(users);

    console.log("Fixtures load sucessfully.");

    await mongoose.disconnect();
};

loadFixtures();
