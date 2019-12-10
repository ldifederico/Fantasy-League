// Detect Caps Lock
var psw = document.getElementById("psw");
var psw1 = document.getElementById("psw1");
var text = document.getElementById("warning");
var text1 = document.getElementById("warning1");

psw.addEventListener("keyup", function(event) {
  if (event.getModifierState("CapsLock")) {
    text.style.display = "block";
  } else {
    text.style.display = "none"
  }
});

psw1.addEventListener("keyup", function(event) {
  if (event.getModifierState("CapsLock")) {
    text1.style.display = "block";
  } else {
    text1.style.display = "none"
  }
});

// Toggle password visibility
function showPassword() {
  var x = document.getElementById("psw");
  var y = document.getElementById("psw1");
  if (x.type === "password") {
    x.type = "text";
  } else {
    x.type = "password";
  }
  if (y.type === "password") {
    y.type = "text";
  } else {
    y.type = "password";
  }
}

// Verify password meets criteria
var psw = document.getElementById("psw");
var letter = document.getElementById("letter");
var capital = document.getElementById("capital");
var number = document.getElementById("number");
var length = document.getElementById("length");

// When the user clicks on the password field, show the message box
psw.onfocus = function() {
  document.getElementById("message").style.display = "block";
}

// When the user clicks outside of the password field, hide the message box
psw.onblur = function() {
  document.getElementById("message").style.display = "none";
}

// When the user starts to type something inside the password field
psw.onkeyup = function() {
  // Validate lowercase letters
  var lowerCaseLetters = /[a-z]/g;
  if(psw.value.match(lowerCaseLetters)) {  
    letter.classList.remove("invalid");
    letter.classList.add("valid");
  } else {
    letter.classList.remove("valid");
    letter.classList.add("invalid");
  }
  
  // Validate capital letters
  var upperCaseLetters = /[A-Z]/g;
  if(psw.value.match(upperCaseLetters)) {  
    capital.classList.remove("invalid");
    capital.classList.add("valid");
  } else {
    capital.classList.remove("valid");
    capital.classList.add("invalid");
  }

  // Validate numbers
  var numbers = /[0-9]/g;
  if(psw.value.match(numbers)) {  
    number.classList.remove("invalid");
    number.classList.add("valid");
  } else {
    number.classList.remove("valid");
    number.classList.add("invalid");
  }
  
  // Validate length
  if(psw.value.length >= 8) {
    length.classList.remove("invalid");
    length.classList.add("valid");
  } else {
    length.classList.remove("valid");
    length.classList.add("invalid");
  }
}

// Validate all forms are filled
function validateForm() {
  var x = document.forms["myForm"]["fname"].value;
  if (x == "") {
    alert("Form must be filled out");
    return false;
  }
}

async function createNewUser(event) {

    event.preventDefault();
    var data = {}

    data.firstName = $("#firstName").val();
    data.lastName = $("#lastName").val();
    data.email = $("#email").val();
    data.username = $("#username").val();
    data.password = $("#psw").val();
    data.password1 = $("#psw1").val();

    console.log(data.password);
    console.log(data.password1);

    if (data.password != "" && data.password1 != "" && data.firstName != "" && data.email != "" && data.username != "") {
      
      // Clear errors
      $(".incorrect").remove();

      // Password validation
      var re = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
      var pwtest = re.test(data.password);
      if (pwtest == false) {
        $("<div>").addClass("mb-n2 mt-1 incorrect").css({'color': 'red', "font-size": "14px", "max-width": "400px"}).text("Password must be at least 6 characters and contain a lower-case, upper-case, number, and special character.").insertAfter("#psw1");
      }
      else if (data.password1 !== data.password) {
        $("<div>").addClass("mb-n2 mt-1 incorrect").css({'color': 'red', "font-size": "14px"}).text("Passwords do not match.").insertAfter("#psw1");
      }

      // Username validation
      var re2 = /^[a-z0-9]+$/i
      var usernametest = re2.test(data.username)
      console.log(usernametest)
      if (usernametest == false) {
        $("<div>").addClass("mb-n2 mt-1 incorrect").css({'color': 'red', "font-size": "14px"}).text("Username can only contain letters and numbers.").insertAfter("#username");
      }

      // Email validiation
      var emailre = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
      var emailtest = emailre.test(data.email)
      if (emailtest == false) {
        $("<div>").addClass("mb-n2 mt-1 incorrect").css({'color': 'red', "font-size": "14px"}).text("Email address is incorrect.").insertAfter("#email");
      }
    
      let response = await $.ajax({
        url: "/register",
        method: "POST",
        data: data,
      });
    
      if (response.user == "User exists") {
          $("<div>").addClass("mb-n2 mt-1 incorrect").css({'color': 'red', "font-size": "14px"}).text("Username is already taken.").insertAfter("#username");
      };
      if (response.email == "Email exists") {
        $("<div>").addClass("mb-n2 mt-1 incorrect").css({'color': 'red', "font-size": "14px"}).text("Account with this email already exists.").insertAfter("#email");
      };
      if (response.success == "Success") {
        localStorage.setItem("userID", response.userID);
        window.location.href = "/main";
      };
    }
    else {
      $(".incorrect").remove();
      $("<div>").css({'color': 'red', "max-width": "400px"}).addClass("mt-3 incorrect").text("Please enter matching passwords or check that input field meets specifications").appendTo("#registerdiv");
    };
};

$("#registerbtn").click(createNewUser);