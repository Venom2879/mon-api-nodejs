const mongoose = require("mongoose");
const { Schema } = require("mongoose");

const commentSchema = new mongoose.Schema({
    message: {
        type: String,
        required: [true, "Message is required"],
        trim: true,
    },
    _postId: {
        type: Schema.Types.ObjectId,
        ref: "Post",
    },
    _userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
}, { timestamps: true });

module.exports = mongoose.model("Comment", commentSchema);
