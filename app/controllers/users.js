const express = require('express');
const route = express.Router();
const User = require('../models/user');

route.get('/', (req, res, next) => {
    User.find()
        .then(result => {
            if (result.length < 1) {
                const error = new Error('No se encontraron usuarios');
                error.statusCode = 404;
                throw error;
            }
            return res.status(200).json({
                statusCode: 200,
                message: 'La lista de Usuarios se obtuvo con exito',
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

module.exports = route;