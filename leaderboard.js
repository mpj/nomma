
function setCookie(c_name,value,exdays)
{
  var exdate=new Date();
  exdate.setDate(exdate.getDate() + exdays);
  var c_value=escape(value) + ((exdays==null) ? "" : "; expires="+exdate.toUTCString());
  document.cookie=c_name + "=" + c_value;
}

function getCookie(c_name)
{
  var i,x,y,ARRcookies=document.cookie.split(";");
  for (i=0;i<ARRcookies.length;i++) {
    x=ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
    y=ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
    x=x.replace(/^\s+|\s+$/g,"");
    if (x==c_name) {
      return unescape(y);
    }
  }
}


// Set up a collection to contain player information. On the server,
// it is backed by a MongoDB collection named "players."

var MAX_VOTES = 3;
var ENTER_KEY_CODE = 13;

Players = new Meteor.Collection("players");
Users = new Meteor.Collection("users");

if (Meteor.is_client) {
  Template.leaderboard.players = function () {
    return Players.find({}, {sort: {score: -1, name: 1}});
  };

  Template.leaderboard.events = {
    'click .clear': function() {
      if (confirm("Are you sure?"))
        Players.update({}, {$set: {score:0}}, {multi: true})
        Users.update({}, {$set: {votes:0}}, {multi: true})
    },
    'focus .newPlayer': function (e) {
      $(e.target).val("");
    },

    'keyup .newPlayer': function(e) {
      var $input = $(e.currentTarget);
      var inputClass = $input.attr("class");
      var inputVal = $input.val();

      if (e.keyCode == ENTER_KEY_CODE) {
        if (inputVal.length == 0)
          return;

        Players.insert({name: $input.val(), score:0 } );
        $input.val('')
      }
       
    },

  };

  Template.player.events = {

    'click': function (e) {

      if (e.altKey) {
        Players.remove(this._id);
        return;
      }

      console.log("gc1", getCookie('userID'))
      if (!getCookie('userID'))
        setCookie('userID', Users.insert({ votes: 1}));
      console.log("gc2", getCookie('userID'))
      var user = Users.findOne(getCookie('userID'));

      if (user.votes >= MAX_VOTES)
        return alert("You've already voted " + MAX_VOTES + " times today!");

      Users.update(getCookie('userID'), {$inc: {votes: 1}});
     
      var id = this._id;
      $(e.target).parent().effect("highlight", {}, 250, function() {
        Players.update(id, {$inc: {score: 1}});
      });
    }
  };
}


if (Meteor.is_server) {
  Meteor.startup(function () {
    
  });
}

