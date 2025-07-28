import express from 'express';
import { prisma } from '../index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get purchase orders
router.get('/', authenticateToken, async (req, res) => {
  try {
    let whereClause = {};
    
    if (req.user.role === 'OWNER') {
      // Owners can only see their own purchase orders
      whereClause = { ownerId: req.user.id };
    } else if (req.user.role === 'MANAGER') {
      // Managers can see purchase orders from their department only
      whereClause = { department: req.user.department };
    }
    // Admins can see all purchase orders (no where clause)

    const purchaseOrders = await prisma.purchaseOrder.findMany({
      where: whereClause,
      include: {
        owner: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(purchaseOrders);
  } catch (error) {
    console.error('Error fetching purchase orders:', error);
    res.status(500).json({ error: 'Failed to fetch purchase orders' });
  }
});

// Get single purchase order
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const purchaseOrder = await prisma.purchaseOrder.findUnique({
      where: { id: req.params.id },
      include: {
        owner: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    if (!purchaseOrder) {
      return res.status(404).json({ error: 'Purchase order not found' });
    }

    // Check access permissions
    if (req.user.role === 'OWNER' && purchaseOrder.ownerId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    } else if (req.user.role === 'MANAGER' && purchaseOrder.department !== req.user.department) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(purchaseOrder);
  } catch (error) {
    console.error('Error fetching purchase order:', error);
    res.status(500).json({ error: 'Failed to fetch purchase order' });
  }
});

// Create purchase order
router.post('/', authenticateToken, async (req, res) => {
  try {
    // Set owner and department based on user role
    let ownerId = req.user.id;
    let department = req.user.department;
    
    if (req.user.role === 'MANAGER' && req.body.ownerId) {
      // Managers can assign purchase orders to users in their department
      const targetUser = await prisma.user.findUnique({
        where: { id: req.body.ownerId }
      });
      
      if (!targetUser || targetUser.department !== req.user.department) {
        return res.status(403).json({ error: 'Cannot assign purchase order to user from different department' });
      }
      
      ownerId = req.body.ownerId;
    } else if (req.user.role === 'ADMIN') {
      // Admins can assign to anyone and set any department
      if (req.body.ownerId) ownerId = req.body.ownerId;
      if (req.body.department) department = req.body.department;
    }
    
    const purchaseOrderData = {
      ...req.body,
      ownerId,
      department,
      poDate: new Date(req.body.poDate),
      validityStart: new Date(req.body.validityStart),
      validityEnd: new Date(req.body.validityEnd)
    };

    const purchaseOrder = await prisma.purchaseOrder.create({
      data: purchaseOrderData,
      include: {
        owner: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    res.status(201).json(purchaseOrder);
  } catch (error) {
    console.error('Error creating purchase order:', error);
    if (error.code === 'P2002') {
      res.status(400).json({ error: 'Purchase order number already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create purchase order' });
    }
  }
});

// Update purchase order
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const purchaseOrder = await prisma.purchaseOrder.findUnique({
      where: { id: req.params.id }
    });

    if (!purchaseOrder) {
      return res.status(404).json({ error: 'Purchase order not found' });
    }

    // Check access permissions
    if (req.user.role === 'OWNER' && purchaseOrder.ownerId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    } else if (req.user.role === 'MANAGER' && purchaseOrder.department !== req.user.department) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updateData = {
      ...req.body,
      poDate: new Date(req.body.poDate),
      validityStart: new Date(req.body.validityStart),
      validityEnd: new Date(req.body.validityEnd)
    };

    const updatedPurchaseOrder = await prisma.purchaseOrder.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        owner: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    res.json(updatedPurchaseOrder);
  } catch (error) {
    console.error('Error updating purchase order:', error);
    res.status(500).json({ error: 'Failed to update purchase order' });
  }
});

// Delete purchase order
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const purchaseOrder = await prisma.purchaseOrder.findUnique({
      where: { id: req.params.id }
    });

    if (!purchaseOrder) {
      return res.status(404).json({ error: 'Purchase order not found' });
    }

    // Check access permissions
    if (req.user.role === 'OWNER' && purchaseOrder.ownerId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    } else if (req.user.role === 'MANAGER' && purchaseOrder.department !== req.user.department) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await prisma.purchaseOrder.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Purchase order deleted successfully' });
  } catch (error) {
    console.error('Error deleting purchase order:', error);
    res.status(500).json({ error: 'Failed to delete purchase order' });
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
    // Admins see all purchase orders

    const now = new Date();
    const oneMonthfromNow = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());

    const [totalPurchaseOrders, expiredPurchaseOrders, expiringPurchaseOrders, activePurchaseOrders] = await Promise.all([
      prisma.purchaseOrder.count({ where: whereClause }),
      prisma.purchaseOrder.count({
        where: {
          ...whereClause,
          validityEnd: { lt: now }
        }
      }),
      prisma.purchaseOrder.count({
        where: {
          ...whereClause,
          validityEnd: { gte: now , lte: oneMonthfromNow }
        }
      }),
      prisma.purchaseOrder.count({
        where: {
          ...whereClause,
          validityEnd: { gte: now }
        }
      })
    ]);

    res.json({
      totalPurchaseOrders,
      expiredPurchaseOrders,
      expiringPurchaseOrders,
      activePurchaseOrders,
    });
  } catch (error) {
    console.error('Error fetching purchase order stats:', error);
    res.status(500).json({ error: 'Failed to fetch purchase order stats' });
  }
});

export default router;