import mongoose from 'mongoose';

const helpQuerySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true
  },
  query: {
    type: String,
    required: [true, 'Query is required'],
    trim: true
  },
  status: {
    type: String,
    enum: ['open', 'in-progress', 'resolved', 'closed'],
    default: 'open',
    index: true
  },
  adminNote: {
    type: String,
    trim: true,
    default: ''
  }
}, {
  timestamps: true
});

helpQuerySchema.index({ createdAt: -1 });
helpQuerySchema.index({ email: 1 });

const HelpQuery = mongoose.model('HelpQuery', helpQuerySchema);
export default HelpQuery;
