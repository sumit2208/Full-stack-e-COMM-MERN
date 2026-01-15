 
import mongoose from 'mongoose';

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  permissions: [
    {
      type: String,
      enum: ['CREATE_PRODUCT', 'VISIT_PRODUCT', 'ADD_PRODUCT'], 
    },
  ],
}, {
  timestamps: true, 
});

export default mongoose.model('Role', roleSchema,'Role');   