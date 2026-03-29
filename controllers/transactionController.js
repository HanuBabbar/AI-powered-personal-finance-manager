const Transaction = require('../models/Transaction');

// @desc    Get all transactions for logged in user
// @route   GET /api/transactions
const getTransactions = async (req, res, next) => {
    try {
        const transactions = await Transaction.find({ user: req.user.id });
        res.json(transactions);
    } catch (error) {
        next(error);
    }
};

// @desc    Add a new transaction
// @route   POST /api/transactions
const addTransaction = async (req, res, next) => {
    try {
        const { type, amount, category, date, description } = req.body;
        
        if (!type || !amount || !category) {
            res.status(400);
            return next(new Error('Missing required fields'));
        }

        const newTransaction = await Transaction.create({
            user: req.user.id,
            type,
            amount: parseFloat(amount),
            category,
            date: date || new Date(),
            description: description || ''
        });

        res.status(201).json(newTransaction);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getTransactions,
    addTransaction
};
