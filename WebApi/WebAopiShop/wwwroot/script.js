function showMsg(id, text, type) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = text;
    el.className = 'msg ' + type;
    el.style.display = 'block';
    if (type === 'success') setTimeout(() => el.style.display = 'none', 4000);
}

async function Register() {
    const userName = document.querySelector("#userName");
    const firstName = document.querySelector("#firstName");
    const lastName = document.querySelector("#lastName");
    const password = document.querySelector("#password");

    if (userName.value == "" || password.value == "") {
        showMsg('msg-register', 'יש למלא את כל השדות הנדרשים.', 'error');
        return;
    }
    if (!userName.checkValidity()) {
        showMsg('msg-register', 'כתובת האימייל אינה תקינה!', 'error');
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
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify(postData)
    });
    const dataPost = await postResponse.json();
    sessionStorage.setItem('currentUser', JSON.stringify(dataPost));
    showMsg('msg-register', '!ההרשמה הושלמה בהצלחה 👍', 'success');
}

async function Login() {
    const userName = document.querySelector("#e_userName");
    const password = document.querySelector("#e_password");

    if (userName.value == "" || password.value == "") {
        showMsg('msg-login', 'יש למלא את כל השדות הנדרשים.', 'error');
        return;
    }
    const postData = {
        userName: userName.value,
        password: password.value,
        firstName: null,
        lastName: null
    };
    const postResponse = await fetch('api/user/Login', {
        method: 'Post',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify(postData)
    });
    if (postResponse.status == 204) {
        showMsg('msg-login', 'פרטי המשתמש שגויים.', 'error');
        return;
    }
    const dataPost = await postResponse.json();
    if (postResponse.ok) {
        showMsg('msg-login', '!התחברת בהצלחה 👍', 'success');
        sessionStorage.setItem('currentUser', JSON.stringify(dataPost));
        setTimeout(() => window.location.href = "update.html", 1200);
    } else {
        showMsg('msg-login', 'ההתחברות נכשלה, בדוק את הפרטים ונסה שוב.', 'error');
    }
}

async function CheckPassword() {
    const password = document.querySelector("#password");
    const progress = document.querySelector("progress");
    const postResponse = await fetch('api/Password', {
        method: 'Post',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify(password.value)
    });
    const dataPost = await postResponse.json();
    if (postResponse.ok)
        progress.value = dataPost.strength / 4;
    else
        progress.value = 0;
}
