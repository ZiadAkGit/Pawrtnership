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

let dogs_chosen = localStorage.getItem("dogs_chosen");
let quiz_submit = localStorage.getItem("submited");
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
		Array.from(document.getElementsByClassName("dog_breed")).forEach(
			(breed) => {
				if (breed.textContent.includes(dog)) {
					const chosen_dog = [
						dog,
						{
							description: all_dogs[dog]["description"],
							temperament: all_dogs[dog]["temperament"],
							breed: all_dogs[dog]["breed"],
							age: all_dogs[dog]["age"],
							attributes: all_dogs[dog]["attributes"],
						},
					];
					result.push(chosen_dog);
				}
			}
		);
	}
	return result;
}

if (window.location.href.includes("index.html")) {
	document
		.getElementById("password")
		.addEventListener("keypress", function (event) {
			if (event.key === "Enter") {
				event.preventDefault();
				login();
			}
		});
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
			const final_dog = result_dog[dog][0];
			dog_name = final_dog["dog_name"];
			dog_breed = final_dog["breed"];
			const listItem = document.createElement("li");
			listItem.className = "dog_breed";
			listItem.textContent = `${dog_name} the ${dog_breed}`;
			listItem.onclick = () => showDogDetails(final_dog);
			dogListContainer.appendChild(listItem);
		}
	}
}

async function login() {
	const usernameInput = document.getElementById("username").value;
	const passwordInput = document.getElementById("password").value;
	const spinner = document.getElementsByClassName("ldio-8kldcctdadd")[0];
	if (usernameInput && passwordInput) {
		spinner.style.display = "block";
		const values = await get_users(usernameInput, passwordInput);
		if (values == "OK") {
			spinner.style.display = "none";
			window.location.href = "dashboard.html";
		} else {
			spinner.style.display = "none";
			alert(`Error: ${values}`);
		}
	} else {
		alert("Fill in Username and Password!");
	}
}

function showDogDetails(dog) {
	const dogDetailsContainer = document.getElementById("dogDetailsContainer");
	dog_name = dog["dog_name"];
	dog_breed = dog["breed"];
	dog_description = dog["description"];
	dog_temperament = dog["temperament"];
	dog_age = dog["age"];
	dog_attributes = dog["attributes"];
	if (dog) {
		window.scrollTo({
			top: 0,
			behavior: "smooth",
		});
		dogDetailsContainer.innerHTML = `
            <h2>${dog_name} - ${dog_age} years old</h2> 
            <p><b>Breed:</b> ${dog_breed}</p>
            <p><b>Description:</b> ${dog_description}</p>
        `;
	}
}

function addDog() {
	const dogNameInput = document.getElementById("dogName").value;
	const dogBreedInput = document.getElementById("dogBreed").value;
	const dogDescriptionInput = document.getElementById("dogDescription").value;
	const dogTemperamentInput = document.getElementById("dogTemperament").value;
	const dogAge = document.getElementById("dogage").value;
	if (dogNameInput && dogBreedInput && dogDescriptionInput) {
		const dogListContainer = document.getElementById("dogList");
		const listItem = document.createElement("li");
		const dog =
		{
			dog_name: dogNameInput,
			description: dogDescriptionInput,
			temperament: dogTemperamentInput,
			breed: dogBreedInput,
			age: dogAge,
		};
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
					dogListContainer.appendChild(listItem);
					alert(
						"Dog has been added\nGo to the Dashboard screen to see your paw friend 🐾"
					);
					window.location.href = "dashboard.html";
				} else alert(responseData);
			});
	} else {
		alert(
			"The following fields are required:\nDog Name, Dog Breed and Description🐾"
		);
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
				window.location.replace("index.html");
				console.log(`Data is: ${data}`);
			}
		})
		.catch(function (error) {
			alert("Error accord\nPlease login again", console.log(error));
			window.location.replace("index.html");
		});
}
