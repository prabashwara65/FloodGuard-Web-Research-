const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');

const userController = {
    // Get all users (Admin only)
    getAllUsers: async (req, res) => {
        try {
            const users = await User.find().select('-password').lean();
            res.json({
                success: true,
                users
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    },

    // Get user by ID (Admin only)
    getUserById: async (req, res) => {
        try {
            const { id } = req.params;
            const user = await User.findById(id).select('-password').lean();

            if (!user) {
                return res.status(404).json({
                    success: false,
                    error: 'User not found'
                });
            }

            res.json({
                success: true,
                user
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    },

    // Update user (Admin or self)
    updateUser: async (req, res) => {
        try {
            const { id } = req.params;
            const isAdmin = req.user?.role === 'admin';
            const isOwnProfile = req.user?._id?.toString() === id;

            if (!isAdmin && !isOwnProfile) {
                return res.status(403).json({
                    success: false,
                    error: 'Access denied'
                });
            }

            const updates = { ...req.body };

            if (!isAdmin) {
                const allowedFields = ['name', 'email', 'phone', 'organization', 'district', 'preferredStation', 'password'];
                Object.keys(updates).forEach((key) => {
                    if (!allowedFields.includes(key)) {
                        delete updates[key];
                    }
                });
                delete updates.role;
                delete updates.isActive;
            }

            if (updates.password === '') {
                delete updates.password;
            }

            const existingUser = await User.findById(id);
            if (!existingUser) {
                return res.status(404).json({
                    success: false,
                    error: 'User not found'
                });
            }

            if (updates.email && updates.email !== existingUser.email) {
                const duplicateUser = await User.findOne({ email: updates.email, _id: { $ne: id } });
                if (duplicateUser) {
                    return res.status(400).json({
                        success: false,
                        error: 'Email already in use'
                    });
                }
            }

            const user = await User.findByIdAndUpdate(id, updates, { new: true, runValidators: true }).select('-password');

            res.json({
                success: true,
                user
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    },

    // Delete user (Admin only)
    deleteUser: async (req, res) => {
        try {
            const { id } = req.params;
            const user = await User.findByIdAndDelete(id);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    error: 'User not found'
                });
            }

            res.json({
                success: true,
                message: 'User deleted'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
};

// Routes
router.get('/', protect, adminOnly, userController.getAllUsers);
router.get('/:id', protect, adminOnly, userController.getUserById);
router.put('/:id', protect, userController.updateUser);
router.delete('/:id', protect, adminOnly, userController.deleteUser);

module.exports = router;