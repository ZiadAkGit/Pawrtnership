let submit_checker = localStorage.getItem("submited");
let dogs_checker = localStorage.getItem("dogs_chosen");
let dogs_result = [];
function submitQuiz() {
	const user_choices = {};
	var counter_checker = 0;
	const inputs = document.getElementsByTagName("input");
	for (let i = 0; i < inputs.length; i++) {
		if (inputs[i].checked) {
			user_choices[inputs[i].name] = parseInt(inputs[i].value);
			counter_checker++;
		}
	}
	if (counter_checker === 5) {
		fetch(`${currentProtocol}//${currentHost}:5000/api/submit_quiz`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(user_choices),
		})
			.then((response) => {
				return response.json()
			})
			.then((dogs) => {
				for (let dog in dogs) {
					dog_attribute = {
						"energy_level": dogs[dog][5],
						"playfulness": dogs[dog][6],
						"intelligence": dogs[dog][7],
						"trainability": dogs[dog][8],
						"temperament": dogs[dog][10],
					}
					const chosen_dog = [
						{
							dog_name: dog,
							description: dogs[dog][1],
							temperament: dogs[dog][2],
							breed: dogs[dog][4],
							age: dogs[dog][9],
							attributes: dog_attribute,
						},
					];
					dogs_result.push(chosen_dog);
				}
				alert(
					"Quiz Submited :)\nGoing to the dashboard page to see your result 🐾"
				);
				const dogs_sent = JSON.stringify(dogs_result);
				localStorage.setItem("submited", "Quiz Submited");
				localStorage["dogs_chosen"] = dogs_sent;
				window.location.href = "dashboard.html";
			})
			.catch((error) => {
				localStorage.setItem("submited", false);
				console.error("Error in fetch:", error);
			});
	} else {
		alert("Please fill in all the quiz🐾");
		counter_checker = 0;
	}
}
function resetQuiz() {
	localStorage["submited"] = "Not submited";
	alert("Localstorage reseted\nA new quiz has been started!");
	location.reload();
}
