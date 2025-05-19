const express = require('express');
const router = express.Router();
const db = require('../_helpers/db');
const authorize = require('../_middleware/authorize');
const Role = require('../_helpers/role');

router.post('/', authorize(), create);
router.get('/', authorize(Role.Admin), getAll);
router.get('/user/:userId', authorize(), getByUserId);
router.get('/employee/:employeeId', authorize(), getByEmployeeId);
router.get('/:id', authorize(), getById);
router.put('/:id', authorize(Role.Admin), update);
router.delete('/:id', authorize(Role.Admin), _delete);

async function create(req, res, next) {
    try {
        // Check if employeeId is in the request body first
        if (!req.body.employeeId) {
            // If not in the body, try to get from the logged-in user
            if (req.user && req.user.id) {
                // Find employee by userId
                const employee = await db.Employee.findOne({ 
                    where: { userId: req.user.id } 
                });
                
                if (employee) {
                    req.body.employeeId = employee.id;
                } else {
                    return res.status(400).json({ 
                        message: 'No employee record found for the logged-in user' 
                    });
                }
            } else {
                return res.status(400).json({ 
                    message: 'employeeId is required' 
                });
            }
        }
        
        console.log('Creating request with data:', req.body);
        
        // First, create the request without items
        const request = await db.Request.create({
            type: req.body.type,
            employeeId: req.body.employeeId,
            status: req.body.status || 'Pending'
        });
        
        console.log('Request created:', request);
        
        // Then, create the request items
        if (req.body.items && Array.isArray(req.body.items)) {
            console.log('Creating items:', req.body.items);
            
            // Create each item and associate with request
            for (const item of req.body.items) {
                await db.RequestItem.create({
                    requestId: request.id,
                    name: item.name,
                    quantity: item.quantity
                });
            }
        } else if (req.body.requestItems && Array.isArray(req.body.requestItems)) {
            console.log('Creating requestItems:', req.body.requestItems);
            
            // Alternative name
            for (const item of req.body.requestItems) {
                await db.RequestItem.create({
                    requestId: request.id,
                    name: item.name,
                    quantity: item.quantity
                });
            }
        }
        
        // Get employee information for workflow
        const employee = await db.Employee.findByPk(request.employeeId, {
            include: [
                { model: db.Department, as: 'department' },
                { model: db.Account, as: 'user' }
            ]
        });
        
        // Find the appropriate approver (manager or admin)
        let approverId = 1; // Default to admin (assuming ID 1 is admin)
        
        if (employee && employee.department && employee.department.managerId) {
            // If employee has a department with a manager, use that manager
            approverId = employee.department.managerId;
        }
        
        console.log(`Creating approval workflow for request ${request.id}, approver ID: ${approverId}`);
        
        // Create a workflow for this request
        const workflow = await db.Workflow.create({
            type: 'Request Approval',
            employeeId: approverId, // This is the employee who needs to approve
            details: {
                requestId: request.id,
                requestType: request.type,
                requesterId: request.employeeId,
                message: `Review ${request.type} request #${request.id} from Employee ID ${request.employeeId}.`
            },
            status: 'Pending'
        });
        
        console.log('Created workflow:', workflow.id);
        
        // Fetch the complete request with its items
        const completeRequest = await db.Request.findByPk(request.id, {
            include: [
                { model: db.Employee },
                { model: db.RequestItem }
            ]
        });
        
        res.status(201).json(completeRequest);
    } catch (err) {
        console.error('Error creating request:', err);
        next(err);
    }
}

async function getAll(req, res, next) {
    try {
        console.log('API received request for requests');
        let whereClause = {};
        
        // Filter by employeeId if provided
        if (req.query.employeeId) {
            console.log('Filtering by employeeId:', req.query.employeeId);
            whereClause.employeeId = req.query.employeeId;
        }
        
        console.log('Requests query where clause:', JSON.stringify(whereClause));
            
        const requests = await db.Request.findAll({
            where: whereClause,
            include: [
                { model: db.Employee },
                { model: db.RequestItem }
            ],
            order: [['createdAt', 'DESC']]
        });
        
        console.log(`Found ${requests.length} requests`);
        res.json(requests);
    } catch (err) {
        console.error('Error getting requests:', err);
        next(err);
    }
}

async function getById(req, res, next) {
    try {
        const request = await db.Request.findByPk(req.params.id, {
            include: [{ model: db.RequestItem }, { model: db.Employee }]
        });
        if (!request) throw new Error('Request not found');
        if (req.user.role !== Role.Admin && req.user.employeeId !== request.employeeId) {
            throw new Error('Unauthorized');
        }
        res.json(request);
    } catch (err) {
        next(err);
    }
}

async function getByUserId(req, res, next) {
    try {
        const employee = await db.Employee.findOne({
            where: { userId: req.params.userId },
            include: [
                { model: db.Department, as: 'department' },
                { model: db.Account, as: 'user' }
            ]
        });
        
        if (!employee) {
            return res.status(404).json({ message: 'No employee record found for this user' });
        }
        
        res.json(employee);
    } catch (err) {
        next(err);
    }
}
async function getByEmployeeId(req, res, next) {
    try {
        const requests = await db.Request.findAll({
            where: { employeeId: req.params.employeeId },
            include: [{ model: db.RequestItem }]
        });
        res.json(requests);
    } catch (err) {
        next(err);
    }
}

// Find the update function and modify it:
async function update(req, res, next) {
    try {
        const request = await db.Request.findByPk(req.params.id);
        
        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }
        
        // Check if status is changing
        const statusChanged = req.body.status && req.body.status !== request.status;
        const oldStatus = request.status;
        
        // Update the request
        await request.update(req.body);
        
        // Handle items if they exist
        if (req.body.items && Array.isArray(req.body.items)) {
            // First delete existing items
            await db.RequestItem.destroy({ where: { requestId: request.id } });
            
            // Then create new ones
            for (const item of req.body.items) {
                await db.RequestItem.create({
                    requestId: request.id,
                    name: item.name,
                    quantity: item.quantity
                });
            }
        }
        
        // If status changed, update related workflows
        if (statusChanged) {
            console.log(`Request ${request.id} status changed from ${oldStatus} to ${request.status}`);
            
            // Find related workflows
            const workflows = await db.Workflow.findAll({
                where: {
                    type: 'Request Approval',
                    details: {
                        requestId: request.id
                    }
                }
            });
            
            if (workflows.length > 0) {
                console.log(`Found ${workflows.length} related workflows to update`);
                
                // Map request status to workflow status
                let workflowStatus;
                switch (request.status) {
                    case 'Approved':
                        workflowStatus = 'Approved';
                        break;
                    case 'Rejected':
                        workflowStatus = 'Rejected';
                        break;
                    case 'Completed':
                        workflowStatus = 'Completed';
                        break;
                    default:
                        workflowStatus = 'Pending';
                }
                
                // Update each workflow
                for (const workflow of workflows) {
                    await workflow.update({ status: workflowStatus });
                    console.log(`Updated workflow ${workflow.id} status to ${workflowStatus}`);
                }
            }
        }
        
        // Return updated request with items
        const updatedRequest = await db.Request.findByPk(req.params.id, {
            include: [
                { model: db.Employee },
                { model: db.RequestItem }
            ]
        });
        
        res.json(updatedRequest);
    } catch (err) {
        console.error('Error updating request:', err);
        next(err);
    }
}
  
  async function _delete(req, res, next) {
    try {
      const request = await db.Request.findByPk(req.params.id);
      if (!request) throw new Error('Request not found');
  
      await request.destroy();
      res.json({ message: 'Request deleted' });
    } catch (err) {
      next(err);
    }
  }
  
  module.exports = router;