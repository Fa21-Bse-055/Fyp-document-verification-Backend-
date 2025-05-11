const express = require('express');
const router = express.Router();
const Chat = require('../models/chat');

  // GET /api/chat/by-student
  router.get('/by-student', async (req, res) => {
    try {
      const students = await Chat.find().distinct('studentEmail');
      res.json({ chats: students });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch student list' });
    }
  });

  router.post('/send', async (req, res) => {
    const { studentEmail, sender, content } = req.body;
  
    if (!studentEmail || !sender || !content)
      return res.status(400).json({ error: 'Missing fields' });
  
    let chat = await Chat.findOne({ studentEmail });
    if (!chat) {
      chat = new Chat({ studentEmail, messages: [] });
    }
  
    chat.messages.push({ sender, content, timestamp: new Date() });
    await chat.save();
    res.json({ success: true, chat });
  });
  
  
  router.get('/all', async (req, res) => {
    try {
      const chats = await Chat.find().sort({ 'messages.timestamp': 1 });
      res.json(chats);
    } catch (err) {
      res.status(500).json({ error: 'Could not get chats' });
    }
  });
  
  

// Get chat by student email
router.get('/:email', async (req, res) => {
  const chat = await Chat.findOne({ studentEmail: req.params.email });
  res.json(chat || { studentEmail: req.params.email, messages: [] });
});



module.exports = router;