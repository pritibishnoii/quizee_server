const mongoose = require("mongoose");
const User = require("./user");

const quizSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  quizName: { type: String, required: true },
  quizType: {
    type: String,
    required: true,
    enum: ["qa", "poll"],
  },
  numQuestions: Number,
  questions: [
    {
      question: { type: String, required: true },
      options: [
        {
          option: { type: String, required: true },
          impressionofOption: Number,
        },
      ],
      correctOption: Number,
      optionType: {
        type: String,
        required: true,
        enum: ["text", "image", "both"],
      },
      timer: { type: String },
      impressionofQuestion: {
        type: Number,
        default: 0,
      },
      answeredCorrectly: {
        type: Number,
        default: 0,
      },
    },
  ],
  impressionofQuiz: Number,
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Quiz", quizSchema);
