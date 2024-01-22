from flask import Flask, request
from flask_cors import CORS
from collections import Counter

import openai as openai
import ignore as backend
import json
import sqlite3


app = Flask(__name__)
CORS(app)
openai.api_key = backend.openai_key
dogs_database = sqlite3.connect('dogs_database.db', check_same_thread=False)
users_database = sqlite3.connect('users.db', check_same_thread=False)
dogs_cursor = dogs_database.cursor()
users_cursor = users_database.cursor()


def dogs_data(ip):
    username = users_cursor.execute(f'''select username from logged_users where ip = "{ip}"''').fetchall()
    data = {
        "username": username,
        "dogs": dogs_cursor.execute('''SELECT * FROM dogs''').fetchall()
    }
    return data


@app.route('/api/data', methods=['GET'])
def get_data():
    address = str(request.remote_addr)
    # headers = str(request.headers)
    return dogs_data(address)


@app.route('/api/submit_quiz', methods=['POST'])
def quiz_submission():
    client_attributes = json.loads(request.get_data())
    score_100 = []
    score_75 = []
    score_50 = []
    dogs = dogs_cursor.execute('''
        SELECT * FROM dogs
    ''').fetchall()
    for i in dogs:
        energy_level = dogs_cursor.execute(f'''SELECT energy_level FROM dogs where name="{i[0]}"''').fetchall()[0][0]
        playfulness = dogs_cursor.execute(f'''SELECT playfulness FROM dogs where name="{i[0]}"''').fetchall()[0][0]
        intelligence = dogs_cursor.execute(f'''SELECT intelligence FROM dogs where name="{i[0]}"''').fetchall()[0][0]
        trainability = dogs_cursor.execute(f'''SELECT trainability FROM dogs where name="{i[0]}"''').fetchall()[0][0]
        temperament = dogs_cursor.execute(f'''SELECT temperament_attribute FROM dogs where name="{i[0]}"''').fetchall()[0][0]
        dog_attributes = {'energy_level': energy_level, 'playfulness': playfulness,
                          'intelligence': intelligence, 'temperament': temperament, 'trainability': trainability}
        if dog_attributes == client_attributes:
            score_100.append(i)
        else:
            for j in dog_attributes:
                if dog_attributes[j] == client_attributes[j]:
                    score_75.append(i)
                else:
                    score_50.append(i)
    best_dogs = dict(Counter(score_100))
    second_option = dict(Counter(score_75))
    last_option = dict(Counter(score_50))
    max_best = [dog for dog, count in best_dogs.items() if count == max(best_dogs.values())]
    max_second = [dog for dog, count in second_option.items() if count == max(second_option.values())]
    max_last = [dog for dog, count in last_option.items() if count == max(last_option.values())]
    best_choice = []
    if len(best_dogs) > 0:
        best_choice = max_best
    elif len(second_option) >= 2:
        best_choice = max_second
    else:
        best_choice = max_last
    chosen_dogs = {}
    print(best_choice)
    for dog in best_choice:
        chosen_dogs[dog[0]] = list(dogs_cursor.execute(f'''SELECT * FROM dogs where name = "{dog[0]}"''').fetchone())
        print(chosen_dogs[dog[0]])
    return json.dumps(chosen_dogs)


@app.route('/api/add_dog', methods=['POST'])
def add_dog():
    dog = json.loads(request.get_data())
    dog_name = dog["dog_name"]
    dog_description = dog['description']
    dog_temperament = dog['temperament']
    dog_breed = dog['breed']
    dog_age = dog['age']
    dog_name_check = dogs_cursor.execute(f'''
    SELECT * FROM dogs where name="{dog_name}"
''').fetchone()
    if not dog_name_check:
        gpt_attributes = openai.chat.completions.create(
            model="gpt-4-1106-preview",
            messages=[
                {"role": "system", "content": backend.system},
                {"role": "user", "content": f'Description: {dog_description}\nTemperament: {dog_temperament}'}
            ]
        )
        dog_attributes = json.loads(gpt_attributes.choices[0].message.content)
        energy_level = dog_attributes["energy_level"]
        playfulness = dog_attributes["playfulness"]
        intelligence = dog_attributes["intelligence"]
        temperament = dog_attributes["temperament"]
        trainability = dog_attributes["trainability"]
        new_dog_values = {
            "name": dog_name,
            "description": dog_description,
            "temperament": dog_temperament,
            "breed": dog_breed,
            "energy_level": energy_level,
            "playfulness": playfulness,
            "intelligence": intelligence,
            "trainability": trainability,
            "age": dog_age,
            "temperament_attribute": temperament
        }
        dogs_cursor.execute(f'''
    INSERT INTO dogs (
        name, description, temperament, breed, 
        energy_level, playfulness, intelligence, trainability, age, temperament_attribute
    ) VALUES (
        '{new_dog_values["name"]}', '{new_dog_values["description"]}', '{new_dog_values["temperament"]}',
        '{new_dog_values["breed"]}', '{new_dog_values["energy_level"]}',
        '{new_dog_values["playfulness"]}', '{new_dog_values["intelligence"]}', '{new_dog_values["trainability"]}',
        {new_dog_values["age"]}, '{new_dog_values["temperament_attribute"]}'
)''')
        dogs_database.commit()
        return "DOG ADDED"
    else:
        return "Name already taken, add something unique!"


@app.route('/api/usercheck', methods=['GET'])
def user_check():
    ip = request.remote_addr
    user = users_cursor.execute(f'''
        SELECT username from logged_users
        where ip = "{ip}"
    ''').fetchall()[0][0]
    if user:
        print("Everything is good!")
        return "OK"
    else:
        return "No Good!"


@app.route('/api/users', methods=['POST'])
def get_users():
    username = request.get_data(as_text=True).split(',')[0]
    password = request.get_data(as_text=True).split(',')[1]
    ip = request.remote_addr
    users = users_cursor.execute('''SELECT username FROM users 
                                 WHERE username IS NOT NULL''').fetchall()
    for user in users:
        if username == str(user[0]).strip():
            chosen_password = users_cursor.execute(f'''SELECT password from users 
            where username="{username}"''').fetchall()[0][0]
            if password == chosen_password:
                print(f'{username} has been logged in from {ip}')
                users_cursor.execute(f'''
                    INSERT INTO logged_users(ip, username, password)
                    VALUES ("{ip}", "{username}", "{password}") 
                ''')
                users_database.commit()
                return "OK"
            else:
                return "Password incorrect"
    else:
        return "Please Register"


if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=False, port=5000)

