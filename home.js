function setLink(url){
    if (checkFirstVisit()){
        var link = document.createElement('a');
        link.href = window.location.pathname + '/' + url;
        link.text = 'click here';
        document.body.appendChild(link);
    }
    else {
        console.log('not first visit, not setting link');
        alert('looks like youve visited this page already, so you cant do the experiment again!');

    }
}

var thisPage = window.location.pathname;

var socket = io(thisPage);

socket.on('change-link', function(data){
    console.log('event received');
    setLink(data);
});




 
function checkFirstVisit() {
  if(document.cookie.indexOf('mycookie') === -1) {
    // cookie doesn't exist, create it now
    document.cookie = 'mycookie=1';
    return true;
    //socket.emit('first-visit');
  }
  else {
    // not first visit, so alert
    //alert('You refreshed!');
    return false;
  }
  // if (sessionStorage.getItem("is_reloaded")){
  //   return false;
  // }
  // else {
  //   sessionStorage.setItem("is_reloaded", true);
  //   return true;
  //       }

}

