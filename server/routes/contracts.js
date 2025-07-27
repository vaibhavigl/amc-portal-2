import express from 'express';
import { prisma } from '../index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get contracts
router.get('/', authenticateToken, async (req, res) => {
  try {
    let whereClause = {};
    
    if (req.user.role === 'OWNER') {
      // Owners can only see their own contracts
      whereClause = { ownerId: req.user.id };
    } else if (req.user.role === 'MANAGER') {
      // Managers can see contracts from their department only
      whereClause = { department: req.user.department };
    }
    // Admins can see all contracts (no where clause)

    const contracts = await prisma.amcContract.findMany({
      where: whereClause,
      include: {
        owner: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(contracts);
  } catch (error) {
    console.error('Error fetching contracts:', error);
    res.status(500).json({ error: 'Failed to fetch contracts' });
  }
});

// Get single contract
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const contract = await prisma.amcContract.findUnique({
      where: { id: req.params.id },
      include: {
        owner: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }

    // Check access permissions
    if (req.user.role === 'OWNER' && contract.ownerId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    } else if (req.user.role === 'MANAGER' && contract.department !== req.user.department) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(contract);
  } catch (error) {
    console.error('Error fetching contract:', error);
    res.status(500).json({ error: 'Failed to fetch contract' });
  }
});

// Create contract
router.post('/', authenticateToken, async (req, res) => {
  try {
    // Set owner and department based on user role
    let ownerId = req.user.id;
    let department = req.user.department;
    
    if (req.user.role === 'MANAGER' && req.body.ownerId) {
      // Managers can assign contracts to users in their department
      const targetUser = await prisma.user.findUnique({
        where: { id: req.body.ownerId }
      });
      
      if (!targetUser || targetUser.department !== req.user.department) {
        return res.status(403).json({ error: 'Cannot assign contract to user from different department' });
      }
      
      ownerId = req.body.ownerId;
    } else if (req.user.role === 'ADMIN') {
      // Admins can assign to anyone and set any department
      if (req.body.ownerId) ownerId = req.body.ownerId;
      if (req.body.department) department = req.body.department;
    }
    
    const contractData = {
      ...req.body,
      ownerId,
      department,
      warrantyStart: new Date(req.body.warrantyStart),
      warrantyEnd: new Date(req.body.warrantyEnd),
      amcStart: new Date(req.body.amcStart),
      amcEnd: new Date(req.body.amcEnd)
    };

    const contract = await prisma.amcContract.create({
      data: contractData,
      include: {
        owner: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    res.status(201).json(contract);
  } catch (error) {
    console.error('Error creating contract:', error);
    if (error.code === 'P2002') {
      res.status(400).json({ error: 'Asset number already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create contract' });
    }
  }
});

// Update contract
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const contract = await prisma.amcContract.findUnique({
      where: { id: req.params.id }
    });

    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }

    // Check access permissions
    if (req.user.role === 'OWNER' && contract.ownerId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    } else if (req.user.role === 'MANAGER' && contract.department !== req.user.department) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updateData = {
      ...req.body,
      warrantyStart: new Date(req.body.warrantyStart),
      warrantyEnd: new Date(req.body.warrantyEnd),
      amcStart: new Date(req.body.amcStart),
      amcEnd: new Date(req.body.amcEnd)
    };

    const updatedContract = await prisma.amcContract.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        owner: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    res.json(updatedContract);
  } catch (error) {
    console.error('Error updating contract:', error);
    res.status(500).json({ error: 'Failed to update contract' });
  }
});

// Delete contract
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const contract = await prisma.amcContract.findUnique({
      where: { id: req.params.id }
    });

    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }

    // Check access permissions
    if (req.user.role === 'OWNER' && contract.ownerId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    } else if (req.user.role === 'MANAGER' && contract.department !== req.user.department) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await prisma.amcContract.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Contract deleted successfully' });
  } catch (error) {
    console.error('Error deleting contract:', error);
    res.status(500).json({ error: 'Failed to delete contract' });
  }
});

// Get dashboard stats
router.get('/stats/dashboard', authenticateToken, async (req, res) => {
  try {
    let whereClause = {};
    
    if (req.user.role === 'OWNER') {
      whereClause = { ownerId: req.user.id };
    } else if (req.user.role === 'MANAGER') {
      whereClause = { department: req.user.department };
    }
    // Admins see all contracts

const now = new Date();
const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());

const [totalContracts, expiredContracts, expiringContracts, activeContracts] = await Promise.all([
  prisma.amcContract.count({ where: whereClause }),

  prisma.amcContract.count({
    where: {
      ...whereClause,
      amcEnd: { lt: now }
    }
  }),

  prisma.amcContract.count({
    where: {
      ...whereClause,
      amcEnd: {
        gte: now,
        lte: nextMonth
      }
    }
  }),

  prisma.amcContract.count({
    where: {
      ...whereClause,
      amcEnd: {
        gte: now
      }
    }
  })
]);

res.json({
  totalContracts,
  expiredContracts,
  expiringContracts,
  activeContracts
});


  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

export default router;