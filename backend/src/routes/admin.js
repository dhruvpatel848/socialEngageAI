const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

// Admin middleware to check if user is admin
const adminAuth = (req, res, next) => {
  // Check if user exists and has admin role
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Access denied. Admin privileges required.' });
  }
  next();
};

// Configure multer for model file uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadDir = path.join(__dirname, '../../../models');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    // Format: modeltype_timestamp.extension
    const timestamp = new Date().toISOString().replace(/[-:.]/g, '');
    const extension = path.extname(file.originalname);
    cb(null, `model_${timestamp}${extension}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
  fileFilter: function(req, file, cb) {
    // Accept only model files
    const filetypes = /joblib|pkl|h5|model/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (!extname) {
      return cb(new Error('Only model files are allowed'), false);
    }
    cb(null, true);
  }
});

// @route   GET api/admin/users
// @desc    Get all users
// @access  Admin
router.get('/users', [auth, adminAuth], async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({ users });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/admin/users
// @desc    Create a new user
// @access  Admin
router.post('/users', [
  auth,
  adminAuth,
  body('name', 'Name is required').not().isEmpty(),
  body('email', 'Please include a valid email').isEmail(),
  body('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
  body('role', 'Role must be either user or admin').isIn(['user', 'admin'])
], async (req, res) => {
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password, role } = req.body;

  try {
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Create new user
    user = new User({
      name,
      email,
      password,
      role
    });

    // Save user to database
    await user.save();

    res.json({ msg: 'User created successfully', user: { id: user.id, name, email, role } });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/admin/users/:id
// @desc    Update a user
// @access  Admin
router.put('/users/:id', [
  auth,
  adminAuth,
  body('name', 'Name is required').optional().not().isEmpty(),
  body('email', 'Please include a valid email').optional().isEmail(),
  body('role', 'Role must be either user or admin').optional().isIn(['user', 'admin'])
], async (req, res) => {
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password, role } = req.body;

  try {
    // Find user by ID
    let user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Check if email is already taken by another user
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ msg: 'Email is already taken' });
      }
    }

    // Update user fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (password) user.password = password;
    if (role) user.role = role;

    // Save updated user
    await user.save();

    res.json({ msg: 'User updated successfully', user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/admin/users/:id
// @desc    Delete a user
// @access  Admin
router.delete('/users/:id', [auth, adminAuth], async (req, res) => {
  try {
    // Find user by ID
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Prevent deleting the last admin
    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({ msg: 'Cannot delete the last admin user' });
      }
    }

    // Delete user
    await user.deleteOne();

    res.json({ msg: 'User deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/admin/upload-model
// @desc    Upload a new ML model
// @access  Admin
router.post('/upload-model', [auth, adminAuth, upload.single('model')], async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'No file uploaded' });
    }

    // Create metadata file
    const metadata = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      uploadedBy: req.user.id,
      uploadedAt: new Date(),
      path: req.file.path
    };

    // Save metadata to a JSON file
    const metadataPath = path.join(path.dirname(req.file.path), `${path.basename(req.file.path, path.extname(req.file.path))}_metadata.json`);
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

    res.json({ msg: 'Model uploaded successfully', metadata });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/admin/train-model
// @desc    Initiate model training
// @access  Admin
router.post('/train-model', [auth, adminAuth], async (req, res) => {
  try {
    // Path to the Python script
    const scriptPath = path.join(__dirname, '../../../ml/scripts/run_training_pipeline.py');

    // Check if script exists
    if (!fs.existsSync(scriptPath)) {
      return res.status(500).json({ msg: 'Training script not found' });
    }

    // Spawn a child process to run the training script
    const pythonProcess = spawn('python', [scriptPath]);

    // Log output
    pythonProcess.stdout.on('data', (data) => {
      console.log(`Training output: ${data}`);
    });

    pythonProcess.stderr.on('data', (data) => {
      console.error(`Training error: ${data}`);
    });

    // Send immediate response
    res.json({ msg: 'Model training initiated' });

    // Handle process completion in the background
    pythonProcess.on('close', (code) => {
      console.log(`Training process exited with code ${code}`);
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;