let submit_checker = localStorage.getItem("submited");
let dogs_checker = localStorage.getItem("dogs_chosen");
let dogs_result = [];
function submitQuiz() {
	const user_choices = {};
	const inputs = document.getElementsByTagName("input");
	for (let i = 0; i < inputs.length; i++) {
		if (inputs[i].checked) {
			user_choices[inputs[i].name] = parseInt(inputs[i].value);
		}
	}
	fetch(`${currentProtocol}//${currentHost}:5000/api/submit_quiz`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(user_choices),
	})
		.then((response) => response.json())
		.then((dogs) => {
			for (let dog in dogs) {
				const chosen_dog = [
					dog,
					{
						description: dogs[dog]["description"],
						temperament: dogs[dog]["temperament"],
						breed: dogs[dog]["breed"],
						age: dogs[dog]["age"],
						attributes: dogs[dog]["attributes"],
					},
				];
				dogs_result.push(chosen_dog);
			}
			localStorage.setItem("submited", "Quiz Submited");
			localStorage["dogs_chosen"] = JSON.stringify(dogs_result);
			alert(
				"Quiz Submited :)\nGoing to the dashboard page to see your result 🐾"
			);
			window.location.href = "dashboard.html";
		})
		.catch((error) => {
			localStorage.setItem("submited", false);
			console.error("Error in fetch:", error);
		});
}
function resetQuiz() {
	localStorage["submited"] = "Not submited";
	alert("Localstorage reseted\nA new quiz has been started!");
	location.reload();
}
