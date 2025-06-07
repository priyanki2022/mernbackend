const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// Video Schema
const videoSchema = new mongoose.Schema({
  title: String,
  videoUrl: String,
});

const Video = mongoose.model('Video', videoSchema);

// Routes
app.post('/upload', upload.single('video'), async (req, res) => {
  try {
    const { title } = req.body;

    if (!req.file) {
      console.error('No file received in request');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const videoUrl = `/uploads/${req.file.filename}`;
    const newVideo = new Video({ title, videoUrl });
    await newVideo.save();

    res.status(201).json({ message: 'Video uploaded successfully', video: newVideo });
  } catch (error) {
    console.error('Upload error:', error); // ✅ See actual error in terminal
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});


app.get('/videos', async (req, res) => {
  try {
    const videos = await Video.find();
    res.status(200).json(videos);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});