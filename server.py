from flask import Flask, request
from flask_cors import CORS

import openai as openai
import ignore as backend
import json

app = Flask(__name__)
CORS(app)
openai.api_key = backend.openai_key


def dogs_data():
    # TODO add database with sql so the table can be updated
    file = open('example_dogs.json')
    data = json.load(file)
    for row in data:
        dog_name = row
        dog_description = data[row]['description']
        dog_temperament = data[row]['temperament']
        dog_breed = data[row]['breed']
        dog_age = data[row]['age']
        dog_attributes = data[row]['attributes']
        backend.dogs[dog_name] = {"description": dog_description, "temperament": dog_temperament,
                                  "breed": dog_breed, "age": dog_age, "attributes": dog_attributes}
    file.close()
    username = str(backend.logged_users.get(request.remote_addr)).split(',')[0]
    data = {
        "username": username,
        "dogs": backend.dogs
    }
    return data


# TODO add database with sql so the table can be updated


@app.route('/api/data', methods=['GET'])
def get_data():
    # address = str(request.remote_addr)
    # headers = str(request.headers)
    return dogs_data()


@app.route('/api/add_dog', methods=['POST'])
def add_dog():
    dog = json.loads(request.get_data())
    dog_name = dog[0]
    dog_description = dog[1]['description']
    dog_temperament = dog[1]['temperament']
    dog_breed = dog[1]['breed']
    dog_age = dog[1]['age']
    # TODO add database with sql so the table can be updated
    if not backend.dogs.get(dog_name):
        attributes = openai.chat.completions.create(
            model="gpt-4-1106-preview",
            messages=[
                {"role": "system", "content": backend.system},
                {"role": "user", "content": f'Description: {dog_description}\nTemperament: {dog_temperament}'}
            ]
        )
        dog_attributes = attributes.choices[0].message.content
        print(dog_attributes)
        backend.dogs[dog_name] = {"description": dog_description, "breed": dog_breed, "age": dog_age,
                                  "temperament": dog_temperament, "attributes": json.loads(dog_attributes)}
        write_json(dog_name, backend.dogs.get(dog_name))
        return "OK"
    else:
        return "Name already taken, add something unique!"


def write_json(dog_name, dog_data):
    with open('example_dogs.json', 'r') as file:
        data = json.load(file)
    new_data = {
        dog_name:
            dog_data
    }
    data.update(new_data)
    with open('example_dogs.json', 'w') as file:
        json.dump(data, file, indent=2)
    print("JSON file updated!")


@app.route('/api/usercheck', methods=['GET'])
def user_check():
    ip = request.remote_addr
    user = str(backend.logged_users.get(ip)).split(',')[0]
    if user in backend.users.values():
        print("Everything is good!")
        return "OK"
    else:
        return "No Good!"


@app.route('/api/users', methods=['POST'])
def get_users():
    username = request.get_data(as_text=True).split(',')[0]
    password = request.get_data(as_text=True).split(',')[1]
    print(f'User: {username} tried to login using {password}')
    # TODO add database with sql so the table can be updated
    if username in backend.users.values():
        if username == backend.users.get(password):
            backend.logged_users[request.remote_addr] = f'{username},{password}'
            return "OK"
        else:
            return "Password incorrect"
    else:
        return "Please Register"


if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=False, port=5000)

