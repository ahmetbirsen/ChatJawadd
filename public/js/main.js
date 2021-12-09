const chatForm = document.getElementById('chat-form');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

const socket = io();

//Url'den username ve room adını almak
const {username,room} = Qs.parse(location.search,{
    ignoreQueryPrefix:true
})

console.log(username,room);
//serverdan gelen mesajı yakalıyoruz
socket.on('message',message => {
    console.log(message);
    outputMessage(message);
})

//Odaya Katılma
socket.emit('joinRoom',{username,room});

//Oda ve kullanıcıları alma
socket.on('roomUsers',({room, users}) => {
    outputRoomName(room);
    outputUsers(users);
});

//Mesaj gönderilme butonuna basıldığı zaman
chatForm.addEventListener('submit',(e)=>{
    
    e.preventDefault();
    //mesaj textini aldıgımız yer
    const msg = e.target.elements.msg.value;

    //server'a mesaj gönderme
    socket.emit('chatMessage',msg);
});

//bu fonksiyon gönderilen mesajı ekrana yazdırmak içindir
function outputMessage(message){
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `<p class="meta">${message.username}<span>${message.time}</span></p>
    <p class="text"> ${message.text}</p>
    `;
    document.querySelector('.chat-messages').appendChild(div);
}

//Oda isimlerini Ekrana yazdırma
function outputRoomName(room){
    roomName.innerText = room;
}

//Kullanıcı isimlerini Ekrana yazdırma
function outputUsers(users){
    userList.innerHTML = `
     ${users.map(user => `<li>${user.username}</li>`).join('')}
    `;
}