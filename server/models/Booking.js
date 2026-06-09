import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
    {
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
      service: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service',
        required: true,
      },
      bookingType: {
        type: String,
        enum: ['home_service', 'pickup_repair'],
        required: true,
      },
      status: {
        type: String,
        enum: [
          'pending',
          'accepted',
          'rejected',
          'picked_up',
          'diagnosed',
          'in_repair',
          'quality_check',
          'returning',
          'completed',
          'cancelled',
        ],
        default: 'pending',
      },
      address: {
        street: String,
        city: String,
        state: String,
        pincode: String,
      },
      scheduledAt: {
        type: Date,
        required: true,
      },
      completedAt: {
        type: Date,
      },
      price: {
        estimated: {type: Number},
        final: {type: Number},
      },
      paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'refunded'],
        default: 'pending',
      },
      notes: {
        type: String,
        trim: true,
      },
      beforeImages: [{type: String}],
      afterImages: [{type: String}],
      statusHistory: [
        {
          status: String,
          updatedAt: {type: Date, default: Date.now},
          note: String,
        },
      ],
    },
    {timestamps: true});

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;