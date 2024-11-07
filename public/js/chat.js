const username = localStorage.getItem('name');

console.log(username);
if (!username) {
    window.location.replace('/');
    throw new Error('Username is required');

}

const lblStatusOnline = document.querySelector('#status-online');
const lblStatusOffline = document.querySelector('#status-offline');
const userUlElement = document.querySelector('ul');

const form = document.querySelector('form');
const input = document.querySelector('input');
const chatElement = document.querySelector('#chat');


const socket = io({
    auth: {
        token: '123',
        name: username
    }
});

const renderUsers = (users) => {
    console.log(users);
    userUlElement.innerHTML = '';
    users.forEach((user) => {
        const liElemnt =  document.createElement('li');
        liElemnt.innerText = user.name;
        userUlElement.appendChild(liElemnt);
    });

}

const renderMessage = (payload) => {
    debugger;
    const {userId,message,name} = payload;
    const divElement =  document.createElement('div');
    divElement.classList.add('message');
    if(userId !== socket.id){
        divElement.classList.add('incoming');
    }

    divElement.innerHTML = `
    <small>${name}</small>
    
    <p>${message}</p>
    `;
    chatElement.appendChild(divElement);

    chatElement.scrollTo = chatElement.scrollHeight;
}

form.addEventListener('submit',(event) => {
    event.preventDefault();
    const message = input.value;
    input.value = '';

    socket.emit('send-message',message);

});


socket.on('connect', () => {
    console.log("Conectado");
    lblStatusOnline.classList.remove('hidden');
    lblStatusOffline.classList.add('hidden');
});

socket.on('disconnect', () => {
    console.log("Desconectado");
    lblStatusOnline.classList.add('hidden');
    lblStatusOffline.classList.remove('hidden');
});

socket.on('welcome-message', (data) => {
    console.log({data});
})

socket.on('on-clients-changed', renderUsers);
socket.on('on-message', renderMessage);