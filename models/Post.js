const mongoose = require("mongoose");
const { Schema } = require("mongoose");

const postSchema = new mongoose.Schema( {
    title: {
        type: String,
        required: [true, "Title is required"],
        trim: true,
    },
    content:{
        type: String,
        required: [true, "Content is required"],
        trim: true,
    },
    status: {
        type: String,
        enum: ["Publish", "Draft", "Lock", "Delete"],
        required: [true, "Status is required"],
    },
    _userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
}, { timestamps: true });

module.exports = mongoose.model("Post", postSchema);
