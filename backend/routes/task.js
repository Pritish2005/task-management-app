const express = require('express');
const Task = require('../model/taskModel');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// Get tasks for a specific user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user.id }).sort({ startTime: 1 });
    if (!tasks.length) {
      return res.status(404).json({ msg: 'No tasks found' });
    }
    res.json(tasks);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Add a new task for a specific user
router.post('/', authMiddleware, async (req, res) => {
  const { title, startTime, endTime, priority } = req.body;
  // console.log(req.user)

  if(!title || !startTime || !endTime || !priority){
    return res.status(400).json({ msg: 'Missing required fields' });
  }

  try {
    const newTask = new Task({
      title,
      startTime,
      endTime,
      priority,
      userId: req.user._id,
    });

    const task = await newTask.save();
    res.status(201).json(task);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Update task status for a specific user
router.patch('/:id/status', authMiddleware, async (req, res) => {
  const { status } = req.body;

  // console.log(status)

  if (status !== 'pending' && status !== 'finished') {
    return res.status(400).json({ msg: 'Invalid status value' });
  }

  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });

    if (!task) {
      return res.status(404).json({ msg: 'Task not found' });
    }

    if (status === 'finished') {
      task.endTime = new Date(); 
    }

    task.status = status;
    await task.save();

    res.json(task);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
