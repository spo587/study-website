function setLink(url){
    var link = document.createElement('a');
    link.href = window.location.pathname + '/' + url;
    link.text = 'click here';
    document.body.appendChild(link);
}

var thisPage = window.location.pathname;

var socket = io(thisPage);

socket.on('change-link', function(data){
    console.log('event received');
    setLink(data);
});

 
// function checkFirstVisit() {
//   // if(document.cookie.indexOf('mycookie')==-1) {
//   //   // cookie doesn't exist, create it now
//   //   document.cookie = 'mycookie=1';
//   //   //socket.emit('first-visit');
//   // }
//   // else {
//   //   // not first visit, so alert
//   //   alert('You refreshed!');
//   // }
//   if (sessionStorage.getItem("is_reloaded")) alert('Reloaded!');
//   else {
//     sessionStorage.setItem("is_reloaded", true);
//         }

// }

