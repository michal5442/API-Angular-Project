async function Update() {
    const userName = document.querySelector("#userName")
    const firstName = document.querySelector("#firstName")
    const lastName = document.querySelector("#lastName")
    const password = document.querySelector("#pass")
    const currentUserJson = sessionStorage.getItem('currentUser');
    const currentUser = JSON.parse(currentUserJson);
    const currentUserId = currentUser.userId;
    const currentUserName = currentUser.userName;
    const currentPassword = currentUser.password;
    const currentFirstName = currentUser.firstName;
    const currentLastName = currentUser.lastName;
    if (userName.value == "") {
        userName.value = currentUserName;
    }
    if (password.value == "") {
        password.value = currentPassword;
    }
    if (firstName.value == "") {
        firstName.value = currentFirstName;
    }
    if (lastName.value == "") {
        lastName.value = currentLastName;
    }
    const putData = {
        userId: currentUserId,
        userName: userName.value,
        password: password.value,
        firstName: firstName.value,
        lastName: lastName.value
    };
    const updateData = await fetch(`https://localhost:44393/api/users/${currentUserId}`, {
        method: 'Put',
        headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify(putData)
    });
    if (updateData.ok) {
        sessionStorage.setItem('currentUser', JSON.stringify(putData));
        alert("User update successfully👍👍!");
    } else {
        alert("User update failed!");
    }
}