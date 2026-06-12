import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
    {
      booking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: true,
      },
      customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
        required: true,
      },
      rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
      },
      comment: {
        type: String,
        trim: true,
      },
      images: [{type: String}],
    },
    {timestamps: true});

// One review per booking
reviewSchema.index({booking: 1, customer: 1}, {unique: true});

const Review = mongoose.model('Review', reviewSchema);

export default Review;