const Post = require("../models/Post");
const { faker } = require("@faker-js/faker");

const seedPosts = async (users) => {
    await Post.deleteMany();

    const postsData = await Promise.all(
        Array.from({ length: 100 }).map(async () => ({
            title: faker.lorem.sentence(),
            content: faker.lorem.paragraph(),
            status: "Publish",
            _userId: users[Math.floor(Math.random() * users.length)]._id,
        })),
    );

    return await Post.insertMany(postsData);
};

module.exports = seedPosts;
