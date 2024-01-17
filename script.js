const currentHost = window.location.hostname;
const currentProtocol = window.location.protocol;
const h1_welcome = document.getElementById("welcoming_message");
var currentPage = window.location.href;
if (currentPage.includes("dashboard.html")) {
    document.getElementById("dashboardLink").classList.add("active");
} else if (currentPage.includes("quiz.html")) {
    document.getElementById("quizLink").classList.add("active");
} else if (currentPage.includes("dogs.html")) {
    document.getElementById("dogsLink").classList.add("active");
}

let dogs_chosen = localStorage.getItem('dogs_chosen');
let quiz_submit = localStorage.getItem('submited');


async function get_users(username, password) {
    try {
        const response = await fetch(
            `${currentProtocol}//${currentHost}:5000/api/users`,
            {
                method: "POST",
                body: `${username},${password}`,
            }
        );
        const result = await response.text();
        return result;
    } catch (error) {
        console.error("Error:", error);
        return error;
    }
}

function showChosenDogs(dogs) {
    const result = [];
    const all_dogs = dogs;
    for (let dog in all_dogs) {
        Array.from(document.getElementsByClassName("dog_breed")).forEach((breed) => {
            if (breed.textContent.includes(dog)) {
                const chosen_dog = [
                    dog, {
                        description: all_dogs[dog]["description"],
                        temperament: all_dogs[dog]["temperament"],
                        breed: all_dogs[dog]["breed"],
                        age: all_dogs[dog]["age"],
                        attributes: all_dogs[dog]["attributes"]
                    },
                ];
                result.push(chosen_dog);
            }
        });
    }
    return result;
}

function getData() {
    if (quiz_submit != "Quiz Submited") {
        const dogListContainer = document.getElementById("dogList");
        dogListContainer.innerHTML = "";
        fetch(`${currentProtocol}//${currentHost}:5000/api/data`)
            .then((response) => response.json())
            .then((data) => {
                const username = data["username"];
                const dogs = data["dogs"];
                console.log(`Hey ${username}, Don't even try!`);
                Object.entries(dogs).forEach((dog) => {
                    dog_name = dog[0];
                    dog_breed = dog[1]["breed"];
                    const listItem = document.createElement("li");
                    listItem.className = "dog_breed";
                    listItem.textContent = `${dog_name} the ${dog_breed}`;
                    listItem.onclick = () => showDogDetails(dog);
                    dogListContainer.appendChild(listItem);
                });
            })
            .catch((error) => {
                console.error("Error:", error);
                return error;
            });
    } else {
        const dogListContainer = document.getElementById("dogList");
        dogListContainer.innerHTML = "";
        const result_dog = JSON.parse(dogs_chosen);
        for (let dog in result_dog) {
            const final_dog = result_dog[dog];
            dog_name = final_dog[0];
            dog_breed = final_dog[1]["breed"];
            const listItem = document.createElement("li");
            listItem.className = "dog_breed";
            listItem.textContent = `${dog_name} the ${dog_breed}`;
            listItem.onclick = () => showDogDetails(final_dog);
            dogListContainer.appendChild(listItem);
        };
    }
}

async function login() {
    const usernameInput = document.getElementById("username").value;
    const passwordInput = document.getElementById("password").value;
    if (usernameInput && passwordInput) {
        const values = await get_users(usernameInput, passwordInput);
        if (values == "OK") {
            window.location.href = "dashboard.html";
        } else {
            alert(`Error: ${values}`);
        }
    } else {
        alert("Fill in Username and Password!");
    }
}

function showDogDetails(dog) {
    const dogDetailsContainer = document.getElementById("dogDetailsContainer");
    dog_name = dog[0];
    dog_breed = dog[1]["breed"];
    dog_description = dog[1]["description"];
    dog_temperament = dog[1]["temperament"];
    dog_age = dog[1]["age"];
    dog_attributes = dog[1]["attributes"];
    if (dog) {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
        dogDetailsContainer.innerHTML = `
            <h2>${dog_name} - ${dog_age} years old</h2> 
            <p><b>Breed:</b> ${dog_breed}</p>
            <p><b>Description:</b> ${dog_description}</p>
            <ul id="dogs_attributes"><b>Attributes: </b>
            <li class="dogs_attributes">Enegry Level: ${dog_attributes["energy_level"]}</li>
            <li class="dogs_attributes">Intelligence Level: ${dog_attributes["intelligence"]}</li>
            <li class="dogs_attributes">Playfulness Level: ${dog_attributes["playfulness"]}</li>
            <li class="dogs_attributes">Temperament Level: ${dog_attributes["temperament"]}</li>
            <li class="dogs_attributes">Trainability Level: ${dog_attributes["trainability"]}</li>
            </ul>
        `;
    }
}

function addDog() {
    const dogNameInput = document.getElementById("dogName").value;
    const dogBreedInput = document.getElementById("dogBreed").value;
    const dogDescriptionInput = document.getElementById("dogDescription").value;
    const dogTemperamentInput = document.getElementById("dogTemperament").value;
    const dogAge = document.getElementById("dogage").value;
    if (dogNameInput && dogBreedInput) {
        const dogListContainer = document.getElementById("dogList");
        const listItem = document.createElement("li");
        const dog = [
            dogNameInput,
            {
                description: dogDescriptionInput,
                temperament: dogTemperamentInput,
                breed: dogBreedInput,
                age: dogAge,
            },
        ];
        listItem.className = "dog_breed";
        listItem.textContent = `${dogNameInput} the ${dogBreedInput}`;
        listItem.onclick = () => showDogDetails(dog);
        fetch(`${currentProtocol}//${currentHost}:5000/api/add_dog`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(dog),
        })
            .then((response) => response.text())
            .then((responseData) => {
                if (responseData == "OK") {
                    console.log("Data has been stored!");
                    alert(
                        "Dog has been added\nGo to the Dashboard screen to see your paw friend 🐾"
                    );
                    dogListContainer.appendChild(listItem);
                    document.getElementById("dogName").value = "";
                    document.getElementById("dogBreed").value = "";
                    document.getElementById("dogDescription").value = "";
                    document.getElementById("dogTemperament").value = "";
                    document.getElementById("dogage").value = "";
                } else alert(responseData);
            });
    } else {
        alert("Please enter both dog name and breed.");
    }
}

async function checkAuthentication() {
    let check = true;
    await fetch(`${currentProtocol}//${currentHost}:5000/api/usercheck`)
        .then((response) => response.text())
        .then((data) => {
            if (data === "OK") {
                check = true;
            } else {
                check = false;
            }
        });
    return check;
}

if (window.location.href.includes("dashboard.html")) {
    checkAuthentication()
        .then((data) => {
            if (data) {
                getData();
            } else {
                // window.location.replace("index.html");
                console.log(`Data is: ${data}`);
            }
        })
        .catch(function (error) {
            alert("Error accord\nPlease login again", console.log(error));
            window.location.replace("index.html");
        });
}
