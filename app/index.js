const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();

const staticsPath = path.join(__dirname, '..', 'public');
const user = "admin" || "jjimenezz";
const password = "password" || "uLfTR0QTCp3pD8Ql";
const dbName = 'Scheduler';
// const URL = `mongodb://${user}:${password}@cluster0-shard-00-00-wf3t8.mongodb.net:27017,cluster0-shard-00-01-wf3t8.mongodb.net:27017,cluster0-shard-00-02-wf3t8.mongodb.net:27017/${databse}?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true&w=majority`;
const URL = `mongodb://${user}:${password}@mongodb_test:27017`;
const port = 5000;

const usersController = require('./controllers/users');
const tasksController = require('./controllers/tasks');

app.use(express.json());
app.use(express.static(staticsPath));

app.use('/users', usersController);
app.use('/tasks', tasksController);

// const URL = `mongodb+srv://${user}:${password}@cluster0-wf3t8.mongodb.net/roadvisordb_test?retryWrites=true&w=majority`;
app.use((err, req, res, next) => {
    const status = err.statusCode || 500;
    res.status(status).json({
        statusCode: status,
        message: err.message
    });
}); 

// {
//     useUnifiedTopology: true,
//     useNewUrlParser: true
// }
mongoose.connect(URL, {
    dbName: dbName,
    useNewUrlParser: true
})
    .then(res => {
        console.log('Connected to databse');
        app.listen(port, () => {
            console.log('server is running on port ' + port);
        });
    })
    .catch(err => {
        console.log(err);

    });
