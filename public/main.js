const priorities = {
    'A': 'Alata',
    'M': 'Media',
    'B': 'Baja'
}

const isRequired = (val) => {
    return val === '' || val === null
        ? {
            status: false,
            mess: 'Este campo es requerido'
        }
        : {
            status: true,
            mess: null

        };
}

const isDateBigger = (val) => {
    const today = new Date();
    const inputDate = new Date(val.toString().split('-').join('/'));
    const error = {
        status: false,
        mess: 'La fecha debe ser mayor o igual a hoy'
    };
    today.setHours(0, 0, 0);
    today.setMilliseconds(0);
    return inputDate >= today
        ? {
            status: true
        }
        : error;
}
const formFields = [
    {
        field: 'dateDelivery',
        validations: [isRequired, isDateBigger],
        error: '',
        status: false
    },
    {
        field: 'title',
        validations: [isRequired],
        error: '',
        status: false
    },
    {
        field: 'userAssigned',
        validations: [isRequired],
        error: '',
        status: false
    },
    {
        field: 'priority',
        validations: [isRequired],
        error: '',
        status: false
    },
    {
        field: 'description',
        validations: [isRequired],
        error: '',
        status: false
    },
];
const generateModalContent = () => {
    const divWrapper = document.querySelector('.fieldsWrapper');
    return divWrapper.cloneNode(true);
};

const validateForms = (opcionalEdit) => {
    const getAllInputs = document.querySelectorAll('.formWrapper > div  input');
    const getAllSelects = document.querySelectorAll('.formWrapper > div  select');
    const getAllTextarea = document.querySelectorAll('.formWrapper > div  textarea');
    const groupFields = [...getAllInputs, ...getAllSelects, ...getAllTextarea];
    const formStatus = () => formFields.filter(field => field.status).length === formFields.length;
    groupFields.forEach(ele => {
        const { id, value } = ele;
        // console.log(value);
        const getForm = formFields
            .find(field => field.field.toLowerCase() === id.toLowerCase());
        getForm.validations.every(val => {
            const result = val(value);
            if (!result.status) {
                getForm.error = result.mess;
                getForm.status = result.status;
                return false
            }
            getForm.error = '';
            getForm.status = true;
            return true
        });
    });
    // console.log(formFields);
    // console.log(formStatus());

    if (formStatus()) {
        const createBody = {};
        groupFields.forEach(inputEle => {
            createBody[inputEle.id] = inputEle.value;
        });
        showErrors();
        console.log(opcionalEdit);

        if (opcionalEdit) {
            if (opcionalEdit.action === 'edit')
                editTask({ _id: opcionalEdit.id, ...createBody });
        } else {
            saveTask(createBody);
        }
    } else {
        showErrors();
    }
}

const showErrors = () => {
    formFields.forEach(f => {
        const getErrorEle = document.querySelector(`#${f.field}+p`);
        if (!f.status) {
            getErrorEle.innerHTML = f.error;
            getErrorEle.classList.add('error--show');
        } else {
            getErrorEle.classList.remove('error--show');
        }
    });
}

const saveTask = (body) => {
    fetch('/tasks/add', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
            'content-type': 'application/json'
        }
    })
        .then(res => res.json())
        .then(result => {
            closeModal('addTask');
            document.querySelector('#addTask').remove();
            getTasks();
            createSuccessModal(result.message);
        })
        .catch(err => {
            console.log(err);
        })
}

const getTasks = () => {
    fetch('/tasks')
        .then(res => res.json())
        .then(result => {
            generateTasksList(result.data);
        })
        .catch(err => {
            console.log(err.message);
        })
}

const getUsers = () => {
    const optionEle = document.createElement('option');
    const seleEle = document.querySelector('#userAssigned');
    optionEle.classList.add('opts')
    fetch('/users')
        .then(res => res.json())
        .then(result => {
            result.data.forEach(user => {
                const fullName = `${user.name} ${user.fLastName} ${user.sLastName}`;
                const newOpt = optionEle.cloneNode(true);
                newOpt.innerHTML = fullName;
                newOpt.value = user._id;
                seleEle.appendChild(newOpt);
            });
        })
        .catch(err => {
            console.log(err);
        });
}

const getSingleTask = (id) => {

    fetch('/tasks/' + id)
        .then(res => res.json())
        .then(result => {
            result.data.userAssigned = result.data.userAssigned._id;
            createEditModal(result.data);
        })
        .catch(err => {
            console.log(err);
        });
}

const editTask = (taskBody) => {
    console.log(taskBody);
    const bodyToSend = { ...taskBody };
    delete bodyToSend._id;
    fetch('tasks/edit/' + taskBody._id, {
        method: 'PUT',
        body: JSON.stringify(bodyToSend),
        headers: {
            'content-type': 'application/json'
        }
    })
        .then(res => res.json())
        .then(result => {
            console.log(result);
            closeModal('editTask');
            document.querySelector('#editTask').remove();
            getTasks();
            createSuccessModal(result.message);
        })
        .catch(err => {
            console.log(err);
        });
}

const disableTask = (id) => {
    fetch('/tasks/disable/' + id, {
        method: 'PUT',
        headers: {
            'content-type': 'application/json'
        }
    })
        .then(res => res.json())
        .then(result => {
            console.log(result);
            createSuccessModal(result.message);
            getTasks();
        })
        .catch(err => {
            console.log(err);
        });
}

const deleteTask = (id) => {
    fetch('/tasks/delete/' + id, {
        method: 'DELETE'
    })
        .then(res => res.json())
        .then(result => {
            createSuccessModal(result.message);
            getTasks();
        })
        .catch(err => {
            console.log(err.message);
        });

}

const searchAllVals = (value) => {
    fetch('tasks/search/' + value, {
        method: 'GET'
    })
        .then(res => res.json())
        .then(result => {
            console.log(result);
            if (result.statusCode === 404) {
                throw new Error(result.message);
            }
            generateTasksList(result.data);
        })
        .catch(err => {
            console.log(err);
            generateTasksList([], err);
        });
}

/***************** Dyanamic render elements  *******************/
const createNotFound = (mess) => {
    const divContainer = document.createElement('div');
    const pEle = document.createElement('p');
    const divSvg = document.createElement('div')
    divContainer.classList.add('notFoundSearch');
    divSvg.classList.add('notFoundSearchSvg');
    pEle.innerHTML = mess;
    divContainer.appendChild(divSvg);
    divContainer.appendChild(pEle);
    return divContainer;
}

const createCard = (task) => {
    const liELe = document.createElement('li');
    const iEle = document.createElement('i');
    const pELe = document.createElement('p');
    const h2Ele = document.createElement('h2');
    const spanEle = document.createElement('span');
    const divEle = document.createElement('div');
    const button = document.createElement('button');
    liELe.classList.add('cardsList__item');
    h2Ele.classList.add('taskTitle');
    spanEle.classList.add('capsule');
    button.classList.add('btn');
    iEle.classList.add('material-icons');
    const iClose = iEle.cloneNode(true);
    const taskDate = pELe.cloneNode(true);
    const desc = pELe.cloneNode(true);
    const owner = divEle.cloneNode(true);
    const ownerLabel = pELe.cloneNode(true);
    const ownerName = pELe.cloneNode(true);
    const btnWrapper = divEle.cloneNode(true);
    const btnDelete = button.cloneNode(true);
    const btnEdit = button.cloneNode(true);
    const iEdit = iEle.cloneNode(true);
    const iDelete = iEle.cloneNode(true);
    iClose.classList.add('btnClose');
    taskDate.classList.add('taskDate');
    desc.classList.add('description');
    owner.classList.add('owner');
    ownerLabel.classList.add('ownerLabel');
    ownerName.classList.add('ownerName');
    btnWrapper.classList.add('btnsWrapper');
    btnDelete.classList.add('btnDelete');
    btnEdit.classList.add('btnEdit');
    iClose.innerHTML = 'close';
    iEdit.innerHTML = 'edit';
    iDelete.innerHTML = 'delete';
    taskDate.innerHTML = task.creationDate;
    h2Ele.innerHTML = task.title;
    spanEle.innerHTML = priorities[task.priority];
    desc.innerHTML = task.description;
    ownerLabel.innerHTML = 'Encargado:';
    ownerName.innerHTML = task.userAssigned.name;
    btnEdit.appendChild(iEdit);
    btnDelete.appendChild(iDelete);
    btnEdit.innerHTML += 'Editar';
    btnDelete.innerHTML += 'Eliminar';
    owner.appendChild(ownerLabel);
    owner.appendChild(ownerName);
    btnWrapper.appendChild(btnEdit);
    btnWrapper.appendChild(btnDelete);
    liELe.appendChild(iClose);
    liELe.appendChild(h2Ele);
    liELe.appendChild(spanEle);
    liELe.appendChild(desc);
    liELe.appendChild(owner);
    liELe.appendChild(btnWrapper);
    btnEdit.id = task._id;
    btnDelete.id = task._id;
    iClose.id = task._id;
    if (!task.status) {
        // console.log(task.status);
        h2Ele.classList.add('taskTitle--disable');
        btnEdit.remove();
    }
    return liELe;
}

const createAddTaskModal = () => {
    const formWrapper = generateModalContent();
    formWrapper.classList.add('fieldsWrapper--show');
    document.body.appendChild(
        createModal(
            'addTask',
            'Agregar Tarea', // El titulo del modal
            formWrapper,    // Pegan el contenido perzonalizado que necesitan meter en  el modal
            // un  arreglo de botones, que ajusta sus propiedades
            [
                {
                    name: 'Agregar', // nombre del boton
                    event: 'click', // evento al que va a reaccionar
                    action: () => {
                        validateForms();
                        closeModal('addTask');
                    }, // metodo qeu va a ejecutar, echo por ustedes
                    style: buttons.PRIMARY // OPCIONAL
                },
                {
                    name: 'Cancelar', // nombre del boton
                    event: 'click', // evento al que va a reaccionar
                    action: () => {
                        closeModal('addTask')
                        document.querySelector('#addTask').remove();
                    }, // metodo qeu va a ejecutar, echo por ustedes
                    style: buttons.SECONDARY // OPCIONAL
                },

            ]
        )
    );
    openModal('addTask');
}

const createEditModal = (task) => {
    const formEle = generateModalContent();
    formEle.classList.add('fieldsWrapper--show');
    const allFormElemnts = [
        ...formEle.querySelectorAll('input'),
        ...formEle.querySelectorAll('select'),
        ...formEle.querySelectorAll('textarea')
    ]

    Object.keys(task).forEach(key => {
        const matchedTask = allFormElemnts.find(ele => ele.id === key);
        if (matchedTask) {
            if (matchedTask.type === 'date') {
                const incomingDateVal = new Date(task[key]).toJSON().split('T')[0];
                matchedTask.value = incomingDateVal;

            } else if (matchedTask.tagName.toLowerCase() === 'select') {
                matchedTask.querySelectorAll('option').forEach(op => {
                    if (op.value === task[key]) {
                        op.selected = true;
                    }
                })
            } else {
                matchedTask.value = task[key];
            }
        }
    });
    document.body.appendChild(
        createModal(
            'editTask',
            'Editar Tarea', // El titulo del modal
            formEle,    // Pegan el contenido perzonalizado que necesitan meter en  el modal
            // un  arreglo de botones, que ajusta sus propiedades
            [
                {
                    name: 'Modificar', // nombre del boton
                    event: 'click', // evento al que va a reaccionar
                    action: () => {
                        validateForms({ id: task._id, action: 'edit' })
                    }, // metodo qeu va a ejecutar, echo por ustedes
                    style: buttons.PRIMARY // OPCIONAL
                },
                {
                    name: 'Cancelar', // nombre del boton
                    event: 'click', // evento al que va a reaccionar
                    action: () => {
                        closeModal('editTask')
                        document.querySelector('#editTask').remove();
                    }, // metodo qeu va a ejecutar, echo por ustedes
                    style: buttons.SECONDARY // OPCIONAL
                },

            ],
            { // objeto con ajustes del modal
                position: { // posicion de los elementos de modal
                    header: '', // titulo acepta: 'start', 'center' & 'end'
                    body: '',  // body del modal acepta: 'start', 'center' & 'end'
                    action: '' // contenedor de botones acepta: 'start', 'center' & 'end'
                },
                height: '', // altura custom del modal, SOLO USAR PORCENTAJES (MAX=88%)
                width: '' // ancho custom del modal, SOLO USAR PORCENTAJES (MAX=91%)
            }
        )
    );
    openModal('editTask');
}

const createSuccessModal = (mess) => {
    const pEle = document.createElement('p');
    pEle.innerHTML = mess;
    pEle.classList.add('info-mess');
    document.body.appendChild(
        createModal(
            'successModal',
            'Exito!', // El titulo del modal
            pEle,    // Pegan el contenido perzonalizado que necesitan meter en  el modal
            // un  arreglo de botones, que ajusta sus propiedades
            [
                {
                    name: 'Ok', // nombre del boton
                    event: 'click', // evento al que va a reaccionar
                    action: () => {
                        closeModal('successModal')
                        document.querySelector('#successModal').remove();
                    }, // metodo qeu va a ejecutar, echo por ustedes
                    style: buttons.PRIMARY // OPCIONAL
                }
            ],
            { // objeto con ajustes del modal
                height: '', // altura custom del modal, SOLO USAR PORCENTAJES (MAX=88%)
                width: '30%' // ancho custom del modal, SOLO USAR PORCENTAJES (MAX=91%)
            }
        )
    );
    openModal('successModal');
}

const createConfirmActionModal = (id, title, mess) => {
    const pEle = document.createElement('p');
    pEle.innerHTML = mess;
    pEle.classList.add('info-mess');
    document.body.appendChild(
        createModal(
            'confirmModal',
            title, // El titulo del modal
            pEle,    // Pegan el contenido perzonalizado que necesitan meter en  el modal
            // un  arreglo de botones, que ajusta sus propiedades
            [
                {
                    name: 'Eliminar', // nombre del boton
                    event: 'click', // evento al que va a reaccionar
                    action: () => {
                        deleteTask(id);
                        document.querySelector('#confirmModal').remove();
                    }, // metodo qeu va a ejecutar, echo por ustedes
                    style: buttons.PRIMARY // OPCIONAL
                },
                {
                    name: 'Cancel', // nombre del boton
                    event: 'click', // evento al que va a reaccionar
                    action: () => {
                        closeModal('confirmModal')
                        document.querySelector('#confirmModal').remove();
                    }, // metodo qeu va a ejecutar, echo por ustedes
                    style: buttons.SECONDARY // OPCIONAL
                }
            ],
            { // objeto con ajustes del modal
                height: '', // altura custom del modal, SOLO USAR PORCENTAJES (MAX=88%)
                width: '30%' // ancho custom del modal, SOLO USAR PORCENTAJES (MAX=91%)
            }
        )
    );
    openModal('confirmModal');
}

const generateTasksList = (list, err) => {
    const getTasksList = document.querySelector('.cardsList');
    const getTasksListDis = document.querySelector('.cardsListD');
    const btnDis = document.querySelector('#btnDisableCards span');
    const notFoundEle = document.querySelector('.notFoundSearch');
    getTasksListDis.classList.add('cardsListD--hide');
    getTasksList.innerHTML = '';
    getTasksListDis.innerHTML = '';
    btnDis.innerHTML = 'Inhabilitadas()';
    let contDis = 0;
    if (list.length > 0) {
        if (notFoundEle) notFoundEle.remove();
        list.forEach((task, i) => {
            const newCard = createCard(task);

            newCard.querySelector('.btnDelete').onclick =
                createConfirmActionModal.bind(this,
                    newCard.querySelector('.btnDelete').id,
                    'Eliminar',
                    '¿Estas seguro que quieres eliminar esta tarea?'
                );
            if (task.status) {//
                newCard.querySelector('.btnEdit').onclick =
                    getSingleTask.bind(this, newCard.querySelector('.btnEdit').id);
                newCard.querySelector('.btnClose').onclick =
                    disableTask.bind(this, newCard.querySelector('.btnClose').id);
                getTasksList.appendChild(
                    newCard
                );
            } else {
                contDis = contDis + 1;
                getTasksListDis.appendChild(
                    newCard
                );
            }

        });
    } else {
        document.querySelector('.cards').appendChild(createNotFound(err.message));
    }
    btnDis.innerHTML = btnDis.innerHTML.split(')')[0] + contDis + ')';
}

document.querySelector('.btnAdd').onclick = createAddTaskModal;
document.querySelector('#btnDisableCards').onclick = (e) => {
    document.querySelector('.cardsListD').classList.toggle('cardsListD--hide');
}
// document.querySelector('#searchbar').onchange = (e) => {
//     searchAllVals(e.target.value);
// }

let isPressed = false;
document.querySelector('#searchbar').onkeyup = e => {
    if (isPressed) {

    } else {
        setTimeout(() => {
            console.log(document.querySelector('#searchbar').value);
            isPressed = false;
            searchAllVals(document.querySelector('#searchbar').value);
        }, 1800);
        isPressed = true;
    }
    // console.log(e.target.value);

}

document.querySelector('.selecCover').onclick = () => {
    document.querySelector('.customSelectList').classList.toggle('customSelectList--show');
}

window.addEventListener('click', (e) => {
    const isDropdownItem = [...e.toElement.classList]
        .find(s => s.toLowerCase() !== 'customList--item'.toLowerCase()
            && s.toLowerCase() !== 'customselectlist'
            && s.toLowerCase() !== 'seleccover');

    if (isDropdownItem) document.querySelector('.customSelectList').classList.remove('customSelectList--show');
});

getTasks();
getUsers();
// validateForms();
// showErrors()
