
const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const Quiz = require("../models/quiz");
const requireAuth = require("../middlewares/requireAuth");

router.post("/createQuiz", requireAuth, async (req, res) => {
  try {
    const quizData = req.body;

    if (!mongoose.Types.ObjectId.isValid(quizData.userId)) {
      return res.status(400).json({ success: false, error: "Invalid userId" });
    }

    const savedQuiz = await Quiz.create(quizData);
    res.status(201).json({ success: true, quizId: savedQuiz._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

router.get("/quizCount/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, error: "Invalid userId" });
    }

    const quizCount = await Quiz.countDocuments({ userId });
    res.json({ success: true, quizCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

router.get("/questionCount/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, error: "Invalid userId" });
    }

    const userQuizzes = await Quiz.find({ userId });
    const questionCount = userQuizzes.reduce(
      (total, quiz) => total + quiz.numQuestions,
      0
    );
    res.json({ success: true, questionCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

router.get("/quizzesWithImpressions/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, error: "Invalid userId" });
    }

    const quizzes = await Quiz.find({ userId }).select("-questions.options");

    res.json({ quizzes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/getquiz/:quizId", async (req, res) => {
  try {
    const _id = req.params.quizId;

    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res.status(400).json({ success: false, error: "Invalid quizId" });
    }

    const quiz = await Quiz.findOne({ _id });
    const result = await Quiz.findByIdAndUpdate(_id, quiz);
    res.json({ quiz });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
router.get("/get-live-quiz/:quizId", async (req, res) => {
  try {
    const _id = req.params.quizId;

    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res.status(400).json({ success: false, error: "Invalid quizId" });
    }

    const quiz = await Quiz.findOne({ _id });

    if (!quiz) {
      return res.status(404).json({ success: false, error: "Quiz not found" });
    }

    quiz.impressionofQuiz = (quiz.impressionofQuiz || 0) + 1;
    await quiz.save();

    res.json({ quiz });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/updateQuiz", async (req, res) => {
  try {
    const quiz = req.body.quizData;
    if (!quiz._id) {
      return res.status(400).json({ error: "Quiz ID is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(quiz._id)) {
      return res.status(400).json({ success: false, error: "Invalid quizId" });
    }

    const result = await Quiz.findByIdAndUpdate(
      quiz._id,
      { $set: quiz },
      { new: true }
    );

    if (!result) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.delete("/deleteQuiz/:quizId", requireAuth, async (req, res) => {
  try {
    const quizId = req.params.quizId;

    if (!mongoose.Types.ObjectId.isValid(quizId)) {
      return res.status(400).json({ success: false, error: "Invalid quizId" });
    }

    const deletedQuiz = await Quiz.findByIdAndDelete(quizId);
    if (!deletedQuiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Quiz deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.patch("/editQuiz/:quizId", requireAuth, async (req, res) => {
  try {
    const quizId = req.params.quizId;
    const { questions } = req.body;

    if (!mongoose.Types.ObjectId.isValid(quizId)) {
      return res.status(400).json({ success: false, error: "Invalid quizId" });
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ success: false, error: "Quiz not found" });
    }

    quiz.questions = questions;

    const updatedQuiz = await quiz.save();

    res.status(200).json({ success: true, updatedQuiz });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
