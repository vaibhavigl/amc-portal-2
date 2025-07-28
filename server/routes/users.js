import express from 'express';
import { prisma } from '../index.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get all users (managers and admins only)
router.get('/', authenticateToken, requireRole(['MANAGER', 'ADMIN']), async (req, res) => {
  try {
    let whereClause = {};
    
    // If user is a manager (not admin), only show users from their department
    if (req.user.role === 'MANAGER') {
      whereClause = { department: req.user.department };
    }
    
    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        emailPreference: true,
        poEmailPreference: true,
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
    const { name, emailPreference, department , poEmailPreference} = req.body;
    
    const updateData = { name, emailPreference ,poEmailPreference};
    
    // Only admins can change department
    if (req.user.role === 'ADMIN' && department) {
      updateData.department = department;
    }
    
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        emailPreference: true,
        poEmailPreference: true,
      }
    });
    
    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Update user (admin only)
router.put('/:id', authenticateToken, requireRole('ADMIN'), async (req, res) => {
  try {
    const { name, role, department, emailPreference } = req.body;
    
    const updatedUser = await prisma.user.update({
      where: { id: req.params.id },
      data: { name, role, department, emailPreference },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        emailPreference: true
      }
    });
    
    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete user (admin only)
router.delete('/:id', authenticateToken, requireRole('ADMIN'), async (req, res) => {
  try {
    // Prevent admin from deleting themselves
    if (req.params.id === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }
    
    await prisma.user.delete({
      where: { id: req.params.id }
    });
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

export default router;