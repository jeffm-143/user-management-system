const express = require('express');
const router = express.Router();
const db = require('../_helpers/db');
const authorize = require('../_middleware/authorize');
const { Op } = require('sequelize');

// Routes
router.get('/', authorize(), getAll);
router.get('/:id', authorize(), getById);
router.put('/:id/status', authorize(), updateStatus);

// Get all workflows
async function getAll(req, res, next) {
    try {
        console.log('API received request for workflows');
        let whereClause = {};
        
        // Filter by employeeId if provided
        if (req.query.employeeId) {
            console.log('Filtering by employeeId:', req.query.employeeId);
            whereClause.employeeId = req.query.employeeId;
        }
        
        // Filter workflows related to a specific request
        if (req.query.requestId) {
            console.log('Filtering by requestId:', req.query.requestId);
            whereClause = {
                type: 'Request Approval',
                details: {
                    requestId: parseInt(req.query.requestId)
                }
            };
        }
        
        // Filter by requesterId in the details JSON
        if (req.query.requesterId) {
            console.log('Filtering by requesterId:', req.query.requesterId);
            // This will need special handling for JSON field
            // For MySQL JSON fields:
            whereClause = Sequelize.literal(`details->"$.requesterId" = ${req.query.requesterId}`);
            
            // If using Postgres, use this instead:
            // whereClause = Sequelize.literal(`details->>'requesterId' = '${req.query.requesterId}'`);
        }
        
        console.log('Workflows query where clause:', JSON.stringify(whereClause));
            
        const workflows = await db.Workflow.findAll({
            where: whereClause,
            include: [
                { 
                    model: db.Employee,
                    include: [{ model: db.Account, as: 'user' }]
                }
            ],
            order: [['createdAt', 'DESC']]
        });
        
        // Transform workflows to ensure details are properly parsed
        const processedWorkflows = workflows.map(workflow => {
            const plainWorkflow = workflow.get({ plain: true });
            
            // Make sure details is parsed as JSON if it's a string
            if (plainWorkflow.details && typeof plainWorkflow.details === 'string') {
                try {
                    plainWorkflow.details = JSON.parse(plainWorkflow.details);
                } catch (err) {
                    console.error('Error parsing workflow details JSON:', err);
                }
            }
            
            return plainWorkflow;
        });
        
        console.log(`Found ${workflows.length} workflows`);
        res.json(processedWorkflows);
    } catch (err) {
        console.error('Error getting workflows:', err);
        next(err);
    }
}

// Get workflow by id
async function getById(req, res, next) {
    try {
        const workflow = await db.Workflow.findByPk(req.params.id, {
            include: [
                { 
                    model: db.Employee,
                    include: [{ model: db.Account, as: 'user' }]
                }
            ]
        });
        
        if (!workflow) {
            return res.status(404).json({ message: 'Workflow not found' });
        }
        
        res.json(workflow);
    } catch (err) {
        next(err);
    }
}

// Update workflow status
async function updateStatus(req, res, next) {
    try {
        const workflow = await db.Workflow.findByPk(req.params.id);
        
        if (!workflow) {
            return res.status(404).json({ message: 'Workflow not found' });
        }
        
        workflow.status = req.body.status;
        await workflow.save();
        
        res.json(workflow);
    } catch (err) {
        next(err);
    }
}

module.exports = router;