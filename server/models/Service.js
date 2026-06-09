import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema(
    {
      name: {
        type: String,
        required: true,
        trim: true,
      },
      category: {
        type: String,
        required: true,
        enum: [
          'mobile_repair',
          'laptop_repair',
          'ac_repair',
          'tv_repair',
          'electrician',
          'plumbing',
          'appliance_repair',
          'solar_maintenance',
        ],
      },
      description: {
        type: String,
        trim: true,
      },
      basePrice: {
        type: Number,
        required: true,
      },
      priceRange: {
        min: {type: Number},
        max: {type: Number},
      },
      duration: {
        type: Number,
        default: 60,
      },
      image: {
        type: String,
      },
      isActive: {
        type: Boolean,
        default: true,
      },
    },
    {timestamps: true});

const Service = mongoose.model('Service', serviceSchema);

export default Service;