const pool = require('../config/database');

const sendMessage = async (req, res) => {
  const { receiver_id, message } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO messages (sender_id, receiver_id, message)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [req.user.id, receiver_id, message]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getMessages = async (req, res) => {
  const { user_id } = req.params;

  try {
    const result = await pool.query(
      `SELECT m.*, 
              s.username as sender_username, s.full_name as sender_name,
              r.username as receiver_username, r.full_name as receiver_name
       FROM messages m
       JOIN users s ON m.sender_id = s.id
       JOIN users r ON m.receiver_id = r.id
       WHERE (m.sender_id = $1 AND m.receiver_id = $2)
          OR (m.sender_id = $2 AND m.receiver_id = $1)
       ORDER BY m.created_at ASC`,
      [req.user.id, user_id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getChatList = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT DISTINCT ON (other_user_id)
         other_user_id as user_id,
         u.username,
         u.full_name,
         u.is_online,
         last_message,
         last_message_time,
         unread_count
       FROM (
         SELECT 
           CASE 
             WHEN sender_id = $1 THEN receiver_id 
             ELSE sender_id 
           END as other_user_id,
           message as last_message,
           created_at as last_message_time,
           (SELECT COUNT(*) FROM messages 
            WHERE sender_id = other_user_id 
            AND receiver_id = $1 
            AND is_read = false) as unread_count
         FROM messages
         WHERE sender_id = $1 OR receiver_id = $1
         ORDER BY created_at DESC
       ) as subquery
       JOIN users u ON u.id = other_user_id
       ORDER BY other_user_id, last_message_time DESC`,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get chat list error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const markAsRead = async (req, res) => {
  const { sender_id } = req.body;

  try {
    await pool.query(
      `UPDATE messages 
       SET is_read = true 
       WHERE sender_id = $1 AND receiver_id = $2 AND is_read = false`,
      [sender_id, req.user.id]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { sendMessage, getMessages, getChatList, markAsRead };
