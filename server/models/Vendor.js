import mongoose from 'mongoose';

const vendorSchema = new mongoose.Schema(
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      businessName: {
        type: String,
        required: true,
        trim: true,
      },
      description: {
        type: String,
        trim: true,
      },
      phone: {
        type: String,
        required: true,
      },
      address: {
        street: String,
        city: String,
        state: String,
        pincode: String,
      },
      location: {
        type: {
          type: String,
          enum: ['Point'],
          default: 'Point',
        },
        coordinates: {
          type: [Number],
          default: [0, 0],
        },
      },
      services: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Service',
        },
      ],
      kycStatus: {
        type: String,
        enum: ['pending', 'verified', 'rejected'],
        default: 'pending',
      },
      trustScore: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
      rating: {
        type: Number,
        default: 0,
      },
      totalReviews: {
        type: Number,
        default: 0,
      },
      totalJobsCompleted: {
        type: Number,
        default: 0,
      },
      isActive: {
        type: Boolean,
        default: true,
      },
    },
    {timestamps: true});

vendorSchema.index({location: '2dsphere'});

const Vendor = mongoose.model('Vendor', vendorSchema);

export default Vendor;