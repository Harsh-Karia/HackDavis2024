import { ReviewModel } from "../models/Reviews.js";
import express from "express";
import mongoose from "mongoose";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const response = await ReviewModel.find({});
    res.json(response);
  } catch (err) {
    res.json(err);
  }
});

router.post("/", async (req, res) => {
  const review = new ReviewModel(req.body);
  try {
    const response = await review.save();
    res.json(response);
  } catch (err) {
    res.json(err);
  }
});

export { router as reviewsRouter };
