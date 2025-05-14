async function updateStatus(req, res, next) {
    try {
        const workflow = await db.Workflow.findByPk(req.params.id);
        if (!workflow) throw new Error('Workflow not found');

        await workflow.update({ status: req.body.status });
        res.json(workflow);
    } catch (err) {
        next(err);
    }
}

async function onboarding(req, res, next) {
    try {
        const employee = await db.Employee.findByPk(req.body.employeeId);
        if (!employee) throw new Error('Employee not found');

        const workflow = await db.Workflow.create({
            employeeId: employee.id,
            type: 'Onboarding',
            details: req.body.details
        });

        res.status(201).json(workflow);
    } catch (err) {
        next(err);
    }
}

module.exports = router;

async function updateStatus(req, res, next) {
    try {
        const workflow = await db.Workflow.findByPk(req.params.id);
        if (!workflow) throw new Error('Workflow not found');

        await workflow.update({ status: req.body.status });
        res.json(workflow);
    } catch (err) {
        next(err);
    }
}

async function onboarding(req, res, next) {
    try {
        const workflow = await db.Workflow.create({
            employeeId: req.body.employeeId,
            type: 'Onboarding',
            details: req.body.details,
            status: 'Pending'
        });

        res.status(201).json(workflow);
    } catch (err) {
        next(err);
    }
}

module.exports = router;