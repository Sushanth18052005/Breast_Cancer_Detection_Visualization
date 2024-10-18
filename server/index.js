import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Connect to MongoDB (replace with your actual MongoDB connection string)
mongoose.connect('mongodb://localhost:27017/lung_cancer_app', { useNewUrlParser: true, useUnifiedTopology: true });

// User model
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  mobile: { type: String, required: true }
});

const User = mongoose.model('User', UserSchema);

// Signup route
app.post('/api/signup', async (req, res) => {
  try {
    const { email, password, mobile } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword, mobile });
    await user.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error creating user' });
  }
});

// Login route
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: user._id }, 'your_jwt_secret', { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in' });
  }
});

// Multer configuration for file upload
const upload = multer({ dest: 'uploads/' });

// Prediction route (placeholder for UNET model integration)
app.post('/api/predict', upload.single('image'), (req, res) => {
  // Here you would integrate with your UNET model for lung cancer segmentation
  // For now, we'll just return a placeholder response
  res.json({ prediction: 'Lung cancer segmentation prediction would appear here.' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});