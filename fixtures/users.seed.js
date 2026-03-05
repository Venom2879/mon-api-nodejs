const User = require("../models/User");
const { faker } = require("@faker-js/faker");
const bcrypt = require("bcrypt");

const seedUsers = async () => {
    await User.deleteMany();

    const usersData = await Promise.all(
        Array.from({ length: 25 }).map(async () => ({
            username: faker.person.fullName(),
            email: faker.internet.email().toLowerCase(),
            password: await bcrypt.hash("password123", 10),
        })),
    );

    return await User.insertMany(usersData);
};

module.exports = seedUsers;
