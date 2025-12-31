import mongoose from 'mongoose';

const menuSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true }, 
  category: { type: String, required: true },
  showOnMainPage: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('Menu', menuSchema);