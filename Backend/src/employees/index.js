const express = require('express');
const router = express.Router();
const db = require('../_helpers/db');
const authorize = require('../_middleware/authorize');
const Role = require('../_helpers/role');

router.post('/', authorize(Role.Admin), create);
router.get('/', authorize(), getAll);
router.get('/:id', authorize(), getById);
router.put('/:id', authorize(Role.Admin), update);
router.delete('/:id', authorize(Role.Admin), _delete);
router.put('/:id/transfer', authorize(), transfer);

async function create(req, res, next) {
    try {
        console.log('Received employee data:', req.body);
        
        // If employeeId is not provided, generate one sequentially
        if (!req.body.employeeId || req.body.employeeId === '') {
            // Find the highest existing employeeId
            const employees = await db.Employee.findAll({
                order: [['employeeId', 'DESC']],
                limit: 1
            });
            
            let nextId = 1; // Default start at 1
            
            if (employees && employees.length > 0) {
                // Extract the number from the highest employeeId (format: EMP001)
                const lastEmployeeId = employees[0].employeeId;
                const lastNumber = parseInt(lastEmployeeId.replace('EMP', ''));
                nextId = lastNumber + 1;
            }
            
            // Format the new ID with padded zeros (EMP001, EMP002, etc.)
            req.body.employeeId = `EMP${nextId.toString().padStart(3, '0')}`;
        }
        
        const employee = await db.Employee.create(req.body);
        console.log('Created employee in database:', employee);
        
        // Return the complete employee with associations
        const employeeWithDetails = await db.Employee.findByPk(employee.id, {
            include: [
                { model: db.Department, as: 'department' },
                { model: db.Account, as: 'user' }
            ]
        });
        
        res.status(201).json(employeeWithDetails);
    } catch (err) {
        console.error('Error creating employee:', err);
        next(err);
    }
}


async function getAll(req, res, next) {
    try {
        const employees = await db.Employee.findAll({
            include: [
                { model: db.Department, as: 'department' },
                { model: db.Account, as: 'user' }
            ]
        });
        res.json(employees);
    } catch (err) {
        next(err);
    }
}

async function getById(req, res, next) {
    try {
        const employee = await db.Employee.findByPk(req.params.id, {
            include: [
                { model: db.Department, as: 'department' },
                { model: db.Account, as: 'user' }
            ]
        });
        
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }
        
        res.json(employee);
    } catch (err) {
        next(err);
    }
}
  
  async function update(req, res, next) {
    try {
      const employee = await db.Employee.findByPk(req.params.id);
      if (!employee) throw new Error('Employee not found');
      await employee.update(req.body);
      res.json(employee);
    } catch (err) { next(err); }
  }
  
  async function _delete(req, res, next) {
    try {
      const employee = await db.Employee.findByPk(req.params.id);
      if (!employee) throw new Error('Employee not found');
      await employee.destroy();
      res.json({ message: 'Employee deleted' });
    } catch (err) { next(err); }
  }

  async function transfer(req, res, next) {
    try {
        const employee = await db.Employee.findByPk(req.params.id);
        if (!employee) throw new Error('Employee not found');

        // Get the previous department for logging
        const previousDepartmentId = employee.departmentId;

        // Update the employee record
        await employee.update({ departmentId: req.body.departmentId });

        // Create a workflow record for the transfer
        await db.Workflow.create({
            employeeId: employee.id,
            type: 'Transfer',
            status: 'Completed',
            details: { 
                previousDepartmentId: previousDepartmentId,
                newDepartmentId: req.body.departmentId 
            }
        });

        res.json({ message: 'Employee transferred successfully' });
    } catch (err) {
        next(err);
    }
}

module.exports = router;