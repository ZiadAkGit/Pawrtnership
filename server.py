from flask import Flask, request
from flask_cors import CORS

import ignore as backend
import json

app = Flask(__name__)
CORS(app)


def dogs_data():
    # TODO add database with sql so the table can be updated
    file = open('example_dogs.json')
    data = json.load(file)
    for row in data:
        dog_name = row
        dog_description = data[row]['description']
        dog_temperament = data[row]['temperament']
        dog_energy = data[row]['energy']
        dog_breed = data[row]['breed']
        backend.dogs[dog_name] = {"description": dog_description, "temperament": dog_temperament, "energy": dog_energy,
                                  "breed": dog_breed}
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
    address = str(request.remote_addr)
    headers = str(request.headers)
    # print(address + " has logged in, Headers are: \n" + headers.strip())
    # dog = input("Write a dog name: ")
    return dogs_data()


@app.route('/api/add_dog', methods=['POST'])
def add_dog():
    dog = json.loads(request.get_data())
    dog_name = dog[0]
    dog_description = dog[1]['description']
    dog_temperament = dog[1]['temperament']
    dog_energy = dog[1]['energy']
    dog_breed = dog[1]['breed']
    # TODO add database with sql so the table can be updated
    if not backend.dogs.get(dog_name):
        backend.dogs[dog_name] = {"description": dog_description, "temperament": dog_temperament, "energy": dog_energy,
                                  "breed": dog_breed}
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


# @app.route('/api/instance', methods=['POST'])
# def save_instance():
#     input_data = request.get_json()
#     try:
#         # cookie = input_data["cookie"]
#         # browser = input_data["browser"]
#         headers = request.headers.items()
#         for head in headers:
#             if head.__contains__("Authorization"):
#                 try:
#                     password = str(head[-1]).split("1%40&!3")[-1]
#                     if password.strip() is not None and password in ignore.passwords:
#                         user = ignore.users.get(password)
#                         ignore.logged_users[request.remote_addr] = [user, 0]
#                         print(f'Password used: {password}\nUsers List: {ignore.logged_users}')
#                         return "Password Clear", 200
#                     else:
#                         return "Instance Error", 500
#                 except TypeError:
#                     return "Instance Error", 500
#     except TypeError:
#         return "Instance Error", 500
#
#
# @app.route('/api/username', methods=['POST'])
# def checking_username():
#     input_data = request.get_json()
#     print(request)
#     print(input_data)
#     return 200
