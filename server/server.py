from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
import os
import jwt
import secrets
from dotenv import load_dotenv
import datetime

dotenv_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(dotenv_path)
app = Flask(__name__)
cors = CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.environ.get("SECRET_KEY")
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)


# User table schema
class User(db.Model):
    id = db.Column(db.String, primary_key=True, default=secrets.token_hex(16))
    first_name = db.Column(db.String(), nullable=False)
    last_name = db.Column(db.String(), nullable=False)
    username = db.Column(db.String(15), unique=True, nullable=False)
    email = db.Column(db.String(320), unique=True, nullable=False)
    password = db.Column(db.String(80), nullable=False)
    '''
    The 'profile_image' is the profile picture of the user. This column will contain
    the profile picture's filename and the file will be located in the 'profile_pics'
    directory in the server.

    The 'podcasts' variable will create a relationship with the Podcast table.
    A user can create many podcasts and all those podcasts will belong to one user
    and that user is labeled as the owner which is also the back-reference.

    The 'comments' variable will create a relationship with the Comment table.
    Each comment will have a commenter which is the user that created the comment
    and a podcast which is the podcast in which the comment was posted on.

    The 'follower' and 'followee' variables will create a relationship with the Follow table.
    Each follow object will have a follower and a followee.
    '''
    profile_image = db.Column(
        db.String(30), nullable=False, default='default.png')
    podcasts = db.relationship(
        'Podcast', backref="owner", foreign_keys="Podcast.owner_id", lazy='dynamic')
    comments = db.relationship(
        "Comment", backref="commenter", foreign_keys="Comment.commenter_id", lazy='dynamic')
    follower = db.relationship(
        "Follow", backref='follower', foreign_keys="Follow.follower_id", lazy='dynamic')
    followee = db.relationship(
        "Follow", backref='followee', foreign_keys="Follow.followee_id", lazy='dynamic')


# Podcast table schema
class Podcast(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    '''
    The 'owner_id' variable will be equal to the owner's id in the database.
    The 'podcast_title' is the title of the podcast and the 'podcast_description'
    is just a small description on things that are discussed in the podcast.

    The 'podcast_title' and 'podcast_description' columns are self-explanatory.

    The 'podcast_file' is the audio file for the podcast. This column will contain
    that file's name and the file will be located in the 'podcast_files' directory in
    the server.

    The 'likes' variable will create a relationship with the Like table.
    Each podcast will have a certain number of likes and each like object
    has a user that liked a podcast and the podcast that was liked.

    The 'comments' variable will create a relationship with the Comment table.
    Each comment will have a podcast that the comment was posted on and a user
    which is the user that created the comment on that specific podcast.
    '''
    owner_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    podcast_title = db.Column(db.String(50), nullable=False)
    podcast_description = db.Column(db.String(500), nullable=False)
    podcast_file = db.Column(db.String(30), unique=True, nullable=False)
    likes = db.relationship("Like", backref="podcast",
                            foreign_keys="Like.podcast_id", lazy='dynamic')
    comments = db.relationship(
        "Comment", backref="podcast", foreign_keys="Comment.podcast_id", lazy='dynamic')


# Like table schema
class Like(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    '''The 'podcast_id' variable will be equal to the podcast's id which was liked.'''
    podcast_id = db.Column(db.Integer, db.ForeignKey(
        "podcast.id"), nullable=False)


# Comment table schema
class Comment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    '''
    The 'commenter_id' will be equal to the commenter's id in the database.
    It can be also known as the user that created the comment on the podcast.

    The 'podcast_id' will be equal to the podcast that was being commented on.
    This value will just be the id of that podcast.
    '''
    commenter_id = db.Column(
        db.Integer, db.ForeignKey("user.id"), nullable=False)
    podcast_id = db.Column(db.Integer, db.ForeignKey(
        "podcast.id"), nullable=False)


# Follower table schema
class Follow(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    '''
    The 'follower_id' is the user id of the person who is the follower
    of another user.

    The 'followee_id' is the user id of the person who was followed
    by another user.

    For example, if user_1 follows user_2, user_1 is the follower, and user_2
    is the followee.
    '''
    follower_id = db.Column(db.Integer, db.ForeignKey("user.id"))
    followee_id = db.Column(db.Integer, db.ForeignKey("user.id"))


# API route for creating new users.
@app.route("/api/register", methods=['POST'])
def register():
    '''
    Lines 130-135 will retrieve the data that was sent from the
    frontend for account registration.
    '''
    user = request.json['user']
    first_name = user['firstName']
    last_name = user['lastName']
    username = user['username']
    email = user['email']
    password = user['password']

    '''
    Lines 142-149 will try to check if a user with the given email
    or username already exists or not. If a user does exist, it will
    return an error message to the frontend that a user already exists.
    '''
    username_exists = User.query.filter_by(username=username).first()
    email_exists = User.query.filter_by(email=email).first()

    if username_exists or email_exists:
        print("Username or email already exists.")
        return jsonify({
            "message": "Username or email already exists."
        })

    '''
    Lines 160-171 will first check if there are no users with the given email and username
    and if there are no users then that means that this account can be created.
    In order to create the account, the plaintext password will first be hashed
    using the Flask-Bcrypt library. Then, the 'new_user' variable will create a new
    User object and will fill out all the fields required to create a user.
    Those changes will then be saved to the database and a message stating that a user
    has been created will be sent to the frontend.
    '''
    if username_exists == None and email_exists == None:
        hashed_password = bcrypt.generate_password_hash(
            password).decode('utf-8')

        new_user = User(first_name=first_name, last_name=last_name,
                        username=username, email=email, password=hashed_password)
        db.session.add(new_user)
        db.session.commit()
        print("User has been created.")
        return jsonify({
            "message": "User has been created!"
        })


# API route for logging users in.
@app.route("/api/login", methods=['POST'])
def login():
    '''
    Lines 183-184 will retrieve the data that was sent from the
    frontend for logging in.
    '''
    username = request.json['user']['username']
    password = request.json['user']['password']

    '''
    The code below will first query the database to check whether
    or not a user with the given username exists or not. If a user does not
    exist, then it will send an error message to the frontend clarifying
    that the user does not exist.

    If the user does exist, then the code will then check to see if the password
    given matches the password hash in the database. If the passwords do not match,
    the backend will send an error message to the frontend stating that an invalid
    password was entered in.

    If the password does match, then that means that everything has been validated,
    therefore, the backend will create a JWT and send that to the frontend and that JWT
    will be stored in the browser's localStorage and will be used for authentication.
    '''
    user = User.query.filter_by(username=username).first()

    if user == None:
        print("User does not exist.")
        return jsonify({
            "message": "User does not exist."
        })
    if user:
        if not bcrypt.check_password_hash(user.password, password):
            print("Invalid password.")
            return jsonify({
                "message": "Invalid password."
            })
        if bcrypt.check_password_hash(user.password, password):

            '''
            'jwt_key' will encrypt the user's id by using the JWT_SECRET_KEY
            which is an environment variable that contains a hash used for encryption.

            This key will expire in 86400 seconds (equivalent to 1 day) after being created.
            '''
            jwt_key = jwt.encode({"id": user.id, "exp": datetime.datetime.now(tz=datetime.timezone.utc) + datetime.timedelta(seconds=86400)},
                                 os.environ.get("JWT_SECRET_KEY"), algorithm='HS256')
            print("Verification successful.")
            return jsonify({
                "message": "Verification successful!",
                "token": jwt_key
            })


@app.route("/api/profile-picture/<username>", methods=['GET'])
def return_profile_picture(username):
    user = User.query.filter_by(username=username).first()
    if user:
        return send_file(f'profile_pics/{user.profile_image}')
    else:
        return jsonify({"message": "User does not exist."})


# Auth verification
def verify_authentication():
    '''
    The code below will first try to get the token that was
    sent in the header from the frontend in order to retrieve user
    details.

    If something goes wrong, it will send an error message stating that.

    If the token has been expired, then it will send an error message stating
    that the token has expired.

    If there is a decoding error, then it will state that there was a decoding error.

    If everything is fine, then it will return 'Verification successful', along with the
    current user's id in case any data needs to be retrieved. This information is sent through
    a tuple making it easily accessible.
    '''
    try:
        token = request.headers['x-access-token']
        try:
            decoded_id = jwt.decode(token, os.environ.get(
                'JWT_SECRET_KEY'), algorithms=['HS256'])
            print("Verification successful.")
            return ("Verification successful.", decoded_id['id'])
        except jwt.exceptions.ExpiredSignatureError:
            print("This token has expired.")
            return "This token has expired."
        except jwt.exceptions.DecodeError:
            print("Decoding error.")
            return "Decoding error."
    except:
        print("Something went wrong.")
        return "Something went wrong."


'''
In the following routes where logins are required, each
route will call the verify_authentication() function in order to make sure
that a user is logged in, in order to view the information in those routes.
'''


# Dashboard API route.
@app.route("/api/dashboard", methods=['GET'])
def dashboard():
    if request.method == 'GET':
        response = verify_authentication()
        if response[0] == "Verification successful.":
            user = User.query.filter_by(id=response[1]).first()
            return jsonify({"message": "Verification successful.", "user": user.username})
        elif response == "This token has expired.":
            return jsonify({"message": "This token has expired."})
        elif response == "Decoding error.":
            return jsonify({"message": "Decoding error."})
        elif response == "Something went wrong":
            return jsonify({"message": "Something went wrong."})


# Account API route.
@app.route("/api/account", methods=['GET', 'POST'])
def account():
    if request.method == "GET":
        response = verify_authentication()
        if response[0] == "Verification successful.":
            user = User.query.filter_by(id=response[1]).first()
            return jsonify({"message": "Verification successful.", "userData": {
                "firstName": user.first_name,
                "lastName": user.last_name,
                "username": user.username,
                "email": user.email
            }})
        elif response == "This token has expired.":
            return jsonify({"message": "This token has expired."})
        elif response == "Decoding error.":
            return jsonify({"message": "Decoding error."})
        elif response == "Something went wrong":
            return jsonify({"message": "Something went wrong."})

    if request.method == 'POST':
        response = verify_authentication()
        if response[0] == "Verification successful.":
            current_user = User.query.filter_by(id=response[1]).first()
            username_valid = False
            email_valid = False
            first_name = request.json['data']['firstName']
            last_name = request.json['data']['lastName']
            username = request.json['data']['username']
            email = request.json['data']['email']
            '''
            Lines 341-358 will check if there is any updates that are being made to the current
            user's email or username. If there are any updates being made, the code will
            first query to see if there is an email or username that already exists. If 
            there is no email or username that exists, then the username_valid and email_valid
            variables will be set to True, otherwise they will remain false.

            If the user's email or user's username remains the same, then the variables will be
            set to True.
            '''
            if current_user.username != username:
                username_exists = User.query.filter_by(
                    username=username).first()
                if username_exists == None:
                    username_valid = True
                elif username_exists:
                    username_valid = False
            else:
                username_valid = True

            if current_user.email != email:
                email_exists = User.query.filter_by(email=email).first()
                if email_exists == None:
                    email_valid = True
                elif email_exists:
                    email_valid = False
            else:
                email_valid = True
            '''
            Lines 366-375 will check if the username_valid and email_valid variables are True,
            if they are true, then it's going to update the user's account settings.

            If not, then it will send an error message to the frontend stating the that
            the username or email already exists.
            '''
            if username_valid and email_valid:
                current_user.first_name = first_name
                current_user.last_name = last_name
                current_user.username = username
                current_user.email = email
                db.session.commit()
                return jsonify({"message": "Verification successful.", "accountUpdated": True})

            if not username_valid or not email_valid:
                return jsonify({"message": "Verification successful.", "accountUpdated": False, "error": "Username or email belongs to another user."})

        elif response == "This token has expired.":
            return jsonify({"message": "This token has expired."})
        elif response == "Decoding error.":
            return jsonify({"message": "Decoding error."})
        elif response == "Something went wrong":
            return jsonify({"message": "Something went wrong."})


# API route for changing user passwords.
@app.route("/api/change-password", methods=['GET', 'POST'])
def change_password():
    if request.method == 'GET':
        response = verify_authentication()
        if response[0] == "Verification successful.":
            return jsonify({"message": "Verification successful."})
        elif response == "This token has expired.":
            return jsonify({"message": "This token has expired."})
        elif response == "Decoding error.":
            return jsonify({"message": "Decoding error."})
        elif response == "Something went wrong":
            return jsonify({"message": "Something went wrong."})

    if request.method == "POST":
        response = verify_authentication()
        if response[0] == "Verification successful.":
            current_user = User.query.filter_by(id=response[1]).first()
            current_password = request.json['data']['currentPassword']
            new_password = request.json['data']['newPassword']
            '''
            Lines 416-423 will check if the current password that the user enters in 
            is equal to the current password that is saved in the database.
            If the passwords match, then a new password hash will be generated for the new
            password and the user's password will be updated. Otherwise, it will not
            be updated.
            '''
            if bcrypt.check_password_hash(current_user.password, current_password):
                new_password_hash = bcrypt.generate_password_hash(
                    new_password).decode("utf-8")
                current_user.password = new_password_hash
                db.session.commit()
                return jsonify({"message": "Verification successful.", "passwordUpdated": True})
            if not bcrypt.check_password_hash(current_user.password, current_password):
                return jsonify({"message": "Verification successful.", "passwordUpdated": False})
        elif response == "This token has expired.":
            return jsonify({"message": "This token has expired."})
        elif response == "Decoding error.":
            return jsonify({"message": "Decoding error."})
        elif response == "Something went wrong":
            return jsonify({"message": "Something went wrong."})


if __name__ == "__main__":
    db.create_all()
    app.run(debug=True, port='8080')
