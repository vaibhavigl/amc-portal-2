import express from 'express';
import { prisma } from '../index.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get all users (managers only)
router.get('/', authenticateToken, requireRole('MANAGER'), async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        emailPreference: true,
        createdAt: true,
        _count: {
          select: { amcContracts: true }
        }
      }
    });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { name, emailPreference } = req.body;
    
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { name, emailPreference },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        emailPreference: true
      }
    });
    
    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

export default router;