import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['Admin', 'Member'],
    default: 'Member',
  },
  signup_timestamp: {
    type: Date,
    default: Date.now,
  },
  last_login: {
    type: Date,
    default: null,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
});

// Indexes for performance
userSchema.index({ created_at: 1 });
userSchema.index({ last_login: 1 });

// Pre-save middleware: update updated_at
userSchema.pre('save', function (next) {
  this.updated_at = Date.now();
  next();
});

export default mongoose.model('User', userSchema);
