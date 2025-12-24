const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  skillId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Skill',
    required: [true, 'Skill ID is required']
  },
  reviewerName: {
    type: String,
    required: [true, 'Reviewer name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  comment: {
    type: String,
    required: [true, 'Comment is required'],
    trim: true,
    maxlength: [500, 'Comment cannot exceed 500 characters']
  }
}, {
  timestamps: true
});

// Middleware to update skill's average rating and review count when a review is saved
reviewSchema.post('save', async function() {
  const Review = this.constructor;
  const skillId = this.skillId;
  
  const reviews = await Review.find({ skillId });
  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;
  
  await mongoose.model('Skill').findByIdAndUpdate(skillId, {
    averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
    reviewCount: reviews.length
  });
});

// Middleware to update skill's average rating and review count when a review is deleted
reviewSchema.post('findOneAndDelete', async function(doc) {
  if (doc) {
    const Review = mongoose.model('Review');
    const skillId = doc.skillId;
    
    const reviews = await Review.find({ skillId });
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;
    
    await mongoose.model('Skill').findByIdAndUpdate(skillId, {
      averageRating: Math.round(averageRating * 10) / 10,
      reviewCount: reviews.length
    });
  }
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;

