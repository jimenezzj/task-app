const buttons = {
    PRIMARY: 'btnPrimary',
    SECONDARY: 'btnSecondary'
}

const createModal = (id, header, modalBody, actions, options) => {
    let modalWrapper = document.createElement('div');
    modalWrapperClasses = modalWrapper.classList.add('modalWrapper') // check this
    modalWrapperClasses = modalWrapper.classList.add('modalWrapper--close') // check this
    let modalContent = document.createElement('div');
    modalContentClasses = modalContent.classList.add('modalContent'); // check this
    let backDrop = document.createElement('div');
    backDropClasses = backDrop.classList.add('backDrop'); // check this
    let modalHeader = document.createElement('h1');
    modalHeader.classList.add('modalHeader');

    modalHeader.innerHTML = header;
    modalBody.classList.add('modalBody')

    let modalActionsContainer = document.createElement('div');
    modalActionsContainer.classList.add('modalActionsContainer');
    generateButtons(actions).forEach(btn => {
        modalActionsContainer.appendChild(btn);
    });

    backDrop.addEventListener('click', () => {
        modalWrapper.classList.add('modalWrapper--close');
    });

    modalContent.appendChild(modalHeader);
    modalContent.appendChild(modalBody);
    modalContent.appendChild(modalActionsContainer);

    modalWrapper.appendChild(backDrop);
    modalWrapper.appendChild(modalContent);
    modalWrapper.style.maxWidth = '88%';
    modalWrapper.style.maxHeight = '90%';
    modalWrapper.id = id;

    if (options) setExtraOptions(options, modalHeader, modalBody, modalActionsContainer, modalContent);

    return modalWrapper;
}


const generateButtons = (btnsInfo) => {
    let modalBtn = document.createElement('button');
    modalBtn.classList.add('modalBtn');
    return btnsInfo.map(btnData => {
        let newBtn = modalBtn.cloneNode(true);
        newBtn.innerHTML = btnData.name;
        newBtn.addEventListener(btnData.event, btnData.action);
        if (btnData.style) newBtn.classList.add(btnData.style);
        return newBtn;
    });
};

const setExtraOptions = (options, mHeader, mBody, mActions, mContent) => {
    let { position, height, width } = options;
    if (position) {
        Object.keys(position).forEach(key => {
            if (key) {
                switch (key) {
                    case 'header':
                        mHeader.classList.add('modalHeader--' + position[key]);
                        break;
                    case 'body':
                        mBody.classList.add('modalBody--' + position[key]);
                        break;
                    case 'actions':
                        mActions.classList.add('modalActions--' + position[key]);
                        break;

                    default:
                        console.log('No se selecciono ningun elemento del modal');
                        break;
                }
            }
        });
    }
    if (height) {
        mContent.style.height = height;
    }
    if (width) {
        console.log(width);
        mContent.style.width = width;
    }
}

const closeModal = (id) => {
    document.querySelector('#' + id).classList.remove('modalWrapper--open');
    document.querySelector('#' + id).classList.add('modalWrapper--close');
}

const openModal = (id) => {
    document.querySelector('#' + id).classList.remove('modalWrapper--close');
    document.querySelector('#' + id).classList.add('modalWrapper--open');
}

/* metodo que crea un modal que recibe
4 parametros (1 opcional, el ultimo),
createModal(
    'Eliminar', // El titulo del modal
    bodyContent,    // Pegan el contenido perzonalizado que necesitan meter en  el modal
    // un  arreglo de botones, que ajusta sus propiedades
    [
       {
          name: 'Guardar', // nombre del boton
          event: 'click', // evento al que va a reaccionar
          action: saveUser, // metodo qeu va a ejecutar, echo por ustedes
          style:  buttons.PRIMARY // OPCIONAL
        }
    ],
    { // objeto con ajustes del modal
        position : { // posicion de los elementos de modal
                    header: '', // titulo acepta: 'start', 'center' & 'end'
                    body: '',  // body del modal acepta: 'start', 'center' & 'end'
                    action: '' // contenedor de botones acepta: 'start', 'center' & 'end'
                  },
        height: '', // altura custom del modal, SOLO USAR PORCENTAJES (MAX=88%)
        width: '' // ancho custom del modal, SOLO USAR PORCENTAJES (MAX=91%)
    }


*/