const currentHost = window.location.hostname;
const currentProtocol = window.location.protocol;
const h1_welcome = document.getElementById("welcoming_message");

async function get_users(username, password) {
    try {
        const response = await fetch(`${currentProtocol}//${currentHost}:5000/api/users`, {
            method: 'POST',
            body: `${username},${password}`
        });
        const result = await response.text();
        return result;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}


function getData() {
    const dogListContainer = document.getElementById("dogList");
    dogListContainer.innerHTML = "";
    document.getElementsByClassName("add-dog-container")[0].style.display = "block";
    fetch(`${currentProtocol}//${currentHost}:5000/api/data`)
        .then(response => response.json())
        .then(data => {
            const username = data["username"];
            const dogs = data["dogs"];
            h1_welcome.innerText = `Hello ${username}, Your dogs list is below:`;
            Object.entries(dogs).forEach(dog => {
                dog_name = dog[0]
                dog_breed = dog[1]["breed"];
                dog_description = dog[1]["description"];
                dog_energy = dog[1]["energy"];
                dog_temperament = dog[1]["temperament"];
                const listItem = document.createElement("li");
                listItem.textContent = `${dog_name} the ${dog_breed}`;
                listItem.onclick = () => showDogDetails(dog);
                dogListContainer.appendChild(listItem);
            });
        })
        .catch(error => {
            console.error('Error:', error);
            return error;
        });
}


async function login() {
    const usernameInput = document.getElementById("username").value;
    const passwordInput = document.getElementById("password").value;
    const values = await get_users(usernameInput, passwordInput);
    if (values == "OK") {
        window.location.href = "dogs.html";
    } else {
        alert(values);
    }
}


function showDogDetails(dog) {
    const dogDetailsContainer = document.getElementById("dogDetailsContainer");
    dog_name = dog[0];
    dog_breed = dog[1]["breed"];
    dog_description = dog[1]["description"];
    dog_energy = dog[1]["energy"];
    dog_temperament = dog[1]["temperament"];
    if (dog) {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        dogDetailsContainer.innerHTML = `
            <h2>${dog_name}</h2> 
            <p><b>Breed:</b> ${dog_breed}</p>
            <p><b>Temp:</b> ${dog_temperament}</p>
            <p><b>Energy:</b> ${dog_energy}</p>
            <p><b>Description:</b> ${dog_description}</p>
        `;
    }
}


function addDog() {
    const dogNameInput = document.getElementById("dogName").value;
    const dogBreedInput = document.getElementById("dogBreed").value;
    const dogDescriptionInput = document.getElementById("dogDescription").value;
    const dogTemperamentInput = document.getElementById("dogTemperament").value;
    const dogEnergyInput = document.getElementById("dogEnergy").value;
    if (dogNameInput && dogBreedInput) {
        const dogListContainer = document.getElementById("dogList");
        const listItem = document.createElement("li");
        const dog =
            [
                dogNameInput,
                {
                    "description": dogDescriptionInput,
                    "energy": dogEnergyInput,
                    "temperament": dogTemperamentInput,
                    "breed": dogBreedInput
                }
            ]
        listItem.textContent = `${dogNameInput} the ${dogBreedInput}`;
        listItem.onclick = () => showDogDetails(dog);
        fetch(`${currentProtocol}//${currentHost}:5000/api/add_dog`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dog)
        }).then(response => response.text())
            .then(responseData => {
                if (responseData == "OK") {
                    console.log("Data has been stored!");
                    dogListContainer.appendChild(listItem);
                    document.getElementById("dogName").value = "";
                    document.getElementById("dogBreed").value = "";
                    document.getElementById("dogDescription").value = "";
                    document.getElementById("dogTemperament").value = "";
                    document.getElementById("dogEnergy").value = "";
                } else
                    alert(responseData);
            });
    } else {
        alert("Please enter both dog name and breed.");
    }
}


async function checkAuthentication() {
    let check = true;
    await fetch(`${currentProtocol}//${currentHost}:5000/api/usercheck`)
        .then(response => response.text())
        .then(data => {
            if (data === "OK") {
                check = true;
            }
            else {
                check = false;
            }
        });
    return check;
}

if (window.location.href.includes("dogs.html")) {
    checkAuthentication().then(data => {
        if (data) {
            getData();
        }
        else {
            window.location.replace("index.html");
        }
    });
} else {
    alert("Please login to move forward")
}