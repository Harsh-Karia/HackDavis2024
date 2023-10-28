import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema({
  artistName: {
    type: String,
    required: true,
  },

  songName: {
    type: String,
    required: true,
  },
  releaseDate: {
    type: String,
    required: true,
  },

  imageUrl: {
    type: String,
    required: true,
  },

  songReview: {
    type: String,
    required: true,
  },

  userOwner: {
    type: String,
    required: true,
  },
});

export const ReviewModel = mongoose.model("reviews", ReviewSchema);
