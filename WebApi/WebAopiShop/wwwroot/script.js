//async function Register() {
//    const userName = document.querySelector("#userName");

//    // בדיקה: האם האימייל תקין לפי חוקי ה-HTML?
//    if (!userName.checkValidity()) {
//        alert("כתובת האימייל אינה תקינה!");
//        userName.reportValidity(); // גורם להופעת הבועה של הדפדפן
//        return; // עוצר את הפונקציה ולא שולח לשרת
//    }

//    // ... שאר הקוד של ה-Fetch יבוא כאן רק אם הכל תקין
//}

// JavaScript source code
async function Register() {
    const userName = document.querySelector("#userName")
    const firstName = document.querySelector("#firstName")
    const lastName = document.querySelector("#lastName")
    const password = document.querySelector("#password")
    if (!userName.checkValidity()) {
        alert("כתובת האימייל אינה תקינה!");
        userName.reportValidity(); 
        return; 
    }
    if (userName.value == "" || password.value == "") {
        alert("Please fill in required fields.")
        return;
    }
    const postData = {
        userName: userName.value,
        password: password.value,
        firstName: firstName.value,
        lastName: lastName.value
    };
    const postResponse = await fetch('api/user/Register', {
        method: 'Post',
        headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify(postData)
    });
    const dataPost = await postResponse.json();
    sessionStorage.setItem('currentUser', JSON.stringify(dataPost));
    alert("user registered succesfully👍👍!");
}
async function Login() {
    const userName = document.querySelector("#e_userName")
    const password = document.querySelector("#e_password")
    const postData = {
        userName: userName.value,
        password: password.value,
        firstName: null,
        lastName: null
    };
    if (userName.value == "" || password.value == "") {
        alert("Please fill in required fields.")
        return;
    }
    const postResponse = await fetch('api/user/Login', {
        method: 'Post',
        headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify(postData)
    });
    if (postResponse.status == 204) {
        alert("error with user details");
    }
    const dataPost = await postResponse.json();
    if (postResponse.ok) {
        alert("user Login succesfully👍👍!");
        sessionStorage.setItem('currentUser', JSON.stringify(dataPost));
        window.location.href = "../update.html";
    }
    else {
        alert("user Login failed!");
    }

} 
async function CheckPassword() {
    const password = document.querySelector("#password")
    const progress = document.querySelector("progress")
    const postResponse = await fetch('api/Password', {
        method: 'Post',
        headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify(password.value)
    });
    const dataPost = await postResponse.json();
    if (postResponse.ok)
        progress.value = dataPost.strength / 4;
    else
        progress.value = 0;
    
}