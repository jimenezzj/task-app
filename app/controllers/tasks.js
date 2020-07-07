const express = require('express');
const mongoose = require('mongoose');
const route = express.Router();
const Task = require('../models/task');

const genericQuery = require('../util/genericQueryHelper');

route.get('', (req, res, next) => {
    Task.find()
        .populate('userAssigned')
        .then(result => {
            if (result.length < 1) {
                const error = new Error('No hay tareaa!');
                error.statusCode = 404;
                throw error;
            }
            return res.status(200).json({
                statusCode: 200,
                message: 'La lista de tareas se obtuvo con exito',
                data: result
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
});

route.post('/add', (req, res, next) => {
    // const {title, description,creationDate,userAssigned,priority} = req.body
    Task.create([{ ...req.body, _id: new mongoose.Types.ObjectId(), status: true }])
        .then(result => {
            if (result) {
                return res.status(201).json({
                    statusCode: 201,
                    message: `La tarea ${req.body.title} se creo con exito!`,
                    data: result[0]
                });
            }
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
});

route.put('/disable/:idTask', (req, res, next) => {
    Task.findOne({ _id: req.params.idTask })
        .then(result => {
            if (!result) {
                const err = new Error('No se encontro esta tarea');
                err.statusCode = 404;
                throw err;
            }
            return Task.updateOne({ _id: req.params.idTask }, { status: false });
        })
        .then(result => {
            return res.json({
                statusCode: 200,
                message: 'Se deshabilito con exito la tarea'
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        })
});

route.put('/edit/:idTask', (req, res, next) => {
    // const {title, description,creationDate,userAssigned,priority} = req.body
    delete req.body._id;
    Task.findOne({ _id: req.params.idTask })
        .then(task => {
            if (!task) {
                const error = new Error('No se puedo encontrar la tarea');
                error.statusCode = 404;
                throw error;
            }
            Object.keys(task._doc).forEach(key => {
                if (req.body[key])
                    task[key] = req.body[key];
            });
            return task.save();
        })
        .then(result => {
            return res.status(201).json({
                statusCode: 201,
                message: `La tarea  se modifico con exito!`,
                data: result
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
    // Task.updateOne([{ ...req.body, _id: new mongoose.Types.ObjectId() }])
    //     .then(result => {
    //         if (result) {
    //         }
    //     })
    //     .catch(err => {
    //         if (!err.statusCode) {
    //             err.statusCode = 500;
    //         }
    //         next(err);
    //     });
});

route.delete('/delete/:idTask', (req, res, next) => {
    Task.findByIdAndDelete({ _id: req.params.idTask })
        .then(result => {
            console.log(result);
            if (!result) {
                const error = new Error('No se encuentro este usuairo');
                error.statusCode = 404;
                throw 404
            }
            return res.json({
                statusCode: 200,
                message: `Se elimino la tarea ${result.title} con exito`,
                data: result
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        })
});

route.get('/search/', (req, res) => {
    res.redirect('/tasks');
});

route.get('/search/:valToSearch', (req, res, next) => {
    const agregatOptions = genericQuery.searchAgregtHelper(Task, req.params.valToSearch,
        { '__v': 0 });
    Task.aggregate()
        .addFields(agregatOptions.addFields)
        .project(agregatOptions.projectShowFields)
        .match(agregatOptions.match)
        .then(result => {
            if (result.length < 1) {
                const error = new Error(`No se encontraron resultados de "${req.params.valToSearch}"`);
                error.statusCode = 404;
                throw error;
            }
            return res.json({
                statusCode: 201,
                message: `Se econtraron coincidencias de "${req.params.valToSearch}"`,
                data: result
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        })
});

route.get('/:taskVal', (req, res, next) => {
    Task.findOne({ _id: req.params.taskVal })
        .populate('userAssigned')
        .select('-__v')
        .then(result => {
            if (!result) {
                const error = new Error('No se encontro al tarea');
                error.statusCode = 404;
                throw error;
            }
            return res.status(200).json({
                statusCode: 200,
                message: 'Se obtuvo la tarea ' + result.title + ', con exito',
                data: result
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
});



module.exports = route;