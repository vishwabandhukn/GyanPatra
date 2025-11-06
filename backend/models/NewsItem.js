import mongoose from 'mongoose';

const newsItemSchema = new mongoose.Schema({
  sourceId: {
    type: String,
    required: true,
    index: true
  },
  language: {
    type: String,
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  link: {
    type: String,
    required: true
  },
  publishedAt: {
    type: Date,
    required: true,
    index: true
  },
  guid: {
    type: String,
    unique: true,
    sparse: true
  },
  categories: [String],
  author: String,
  imageUrl: String,
  content: String,
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 604800 // 7 days TTL
  }
}, {
  timestamps: true
});

// Compound indexes for efficient querying
newsItemSchema.index({ sourceId: 1, publishedAt: -1 });
newsItemSchema.index({ language: 1, publishedAt: -1 });
newsItemSchema.index({ createdAt: 1 }, { expireAfterSeconds: 604800 }); // TTL index

export default mongoose.model('NewsItem', newsItemSchema);


