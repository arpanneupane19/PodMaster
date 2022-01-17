from flask import Flask, request, jsonify, send_file
from werkzeug.utils import secure_filename
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_mail import Mail, Message
import os
import jwt
import json
import secrets
from dotenv import load_dotenv
import datetime
from PIL import Image

dotenv_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(dotenv_path)
app = Flask(__name__)
cors = CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.environ.get("SECRET_KEY")
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 465
app.config['MAIL_USERNAME'] = os.environ.get("EMAIL")
app.config['MAIL_PASSWORD'] = os.environ.get('PASSWORD')
app.config['MAIL_USE_TLS'] = False
app.config['MAIL_USE_SSL'] = True
mail = Mail(app)


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
    The code below will retrieve the data that was sent from the
    frontend for account registration.
    '''
    user = request.json['user']
    first_name = user['firstName']
    last_name = user['lastName']
    username = user['username']
    email = user['email']
    password = user['password']

    '''
    The code below will try to check if a user with the given email
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
    The code below will first check if there are no users with the given email and username
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
    The code below will retrieve the data that was sent from the
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

            This key will expire in 172800 seconds (equivalent to 2 days) after being created.
            '''
            jwt_key = jwt.encode({"id": user.id, "exp": datetime.datetime.now(tz=datetime.timezone.utc) + datetime.timedelta(seconds=172800)},
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
            podcasts = Podcast.query.filter_by(owner=user).all()
            podcasts_json = []
            for podcast in podcasts:
                podcast_dict = {"podcast_title": podcast.podcast_title, "podcast_description": podcast.podcast_description, "podcast_id": podcast.id, "likes": podcast.likes.count(), "comments": podcast.comments.count()}
                podcasts_json.append(podcast_dict)
            return jsonify({"message": "Verification successful.", "user": user.username, "podcasts": podcasts_json})
        elif response == "This token has expired.":
            return jsonify({"message": "This token has expired."})
        elif response == "Decoding error.":
            return jsonify({"message": "Decoding error."})
        elif response == "Something went wrong":
            return jsonify({"message": "Something went wrong."})


@app.route("/api/return-podcast/<podcast_id>", methods=['GET'])
def return_podcast(podcast_id):
    '''The code below will return a podcast to the frontend.'''
    podcast = Podcast.query.filter_by(id=podcast_id).first()
    if podcast:
        return send_file(f'podcast_files/{podcast.podcast_file}')
    else:
        return jsonify({"message": "Podcast not found."})


# Function for compressing and saving podcast file
def save_and_compress_podcast_file(podcast_file):
    '''
    The code below will save the podcast file that is uploaded.

    First a random hex token is generated for the new filename. Then 
    Then, using os.path.splitext(), you can get the file extension of the file. 
    The variable 'new_filename' will combine the random hex token which is the new filename
    with the file extension. Next, the podcast file's path is declared and then the file is saved into 
    that path.

    Once that is complete, the file is then compressed and the filename is 
    returned by this function.
    '''

    random_hex = secrets.token_hex(16)
    file_ext = os.path.splitext(secure_filename(podcast_file.filename))[1]
    new_filename = random_hex + file_ext
    podcast_file_path = os.path.join(app.root_path, 'podcast_files', new_filename)
    podcast_file.save(podcast_file_path)

    return new_filename


# Upload Podcast API route.
@app.route("/api/upload-podcast", methods=['GET','POST'])
def upload_podcast():
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

    if request.method == 'POST':
        response = verify_authentication()
        if response[0] == "Verification successful.":
            '''
            The code below will first retrieve the current user by using their user ID that
            is returned in the response variable. Once the current user has been found,
            the podcast title is stored in the 'podcast_title' variable and the same thing
            goes for the description and the podcast file. 

            The podcast file is first passed as an argument to another function called
            'save_and_compress_podcast_file()'. That function will not only save the file but
            also compress it in order to save space. When it saves the file, the filename will
            be a hex token. That filename will be returned by the function and then
            the podcast will be created.
            '''
            current_user = User.query.filter_by(id=response[1]).first()
            podcast_title = request.form['podcastTitle']
            podcast_description = request.form['podcastDescription']
            podcast_file = request.files['podcastFile']
            podcast_filename = save_and_compress_podcast_file(podcast_file)
            new_podcast = Podcast(owner=current_user, podcast_title=podcast_title, podcast_description=podcast_description, podcast_file=podcast_filename)
            db.session.add(new_podcast)
            db.session.commit()
            print("Podcast has been uploaded.")
            return jsonify({"message": "Verification successful.", "podcastUploaded": True})
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
            The code below will check if there is any updates that are being made to the current
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
            The code below will check if the username_valid and email_valid variables are True,
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
            The code below will check if the current password that the user enters in 
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


# Function that will compress and save user files.
def save_and_compress_file(file):
    '''
    The code below will save the profile picture that is submitted and will compress
    it.

    First, a random hex token is generated for the new filename. Then, using os.path.splitext(), the
    file extension is retrieved. The variable 'new_filename' will combine the new filename from
    the hex token with the file extension. Once the new filename has been created, the file
    is then saved into the path that is defined by the 'file_path' variable.

    Once all of that is complete, the Pillow module will compress the image to a size of 
    250x250. Then the code will return the filename to the 'update_profile_picture()' 
    so that the new changes can be saved into the database.
    '''
    random_hex = secrets.token_hex(16)
    file_ext = os.path.splitext(secure_filename(file.filename))[1]
    new_filename = random_hex + file_ext
    file_path = os.path.join(app.root_path, 'profile_pics', new_filename)
    file.save(file_path)

    output_size = (250, 250)
    i = Image.open(file)
    i.thumbnail(output_size)
    i.save(file_path)

    return new_filename


# API route for updating user profile pictures.
@app.route("/api/update-profile-picture", methods=['GET', 'POST'])
def update_profile_picture():
    if request.method == 'GET':
        response = verify_authentication()
        if response[0] == 'Verification successful.':
            return jsonify({"message": "Verification successful."})
        elif response == "This token has expired.":
            return jsonify({"message": "This token has expired."})
        elif response == "Decoding error.":
            return jsonify({"message": "Decoding error."})
        elif response == "Something went wrong":
            return jsonify({"message": "Something went wrong."})

    if request.method == 'POST':
        response = verify_authentication()
        if response[0] == 'Verification successful.':
            current_user = User.query.filter_by(id=response[1]).first()
            '''
            The code below will first retrieve the file that was passed into the request
            and that file is contained in the 'file' variable. Then, the filename is returned
            by the 'save_and_compress_file()'. This function is used to save the file
            and compress it and then return the filename to this route so that the new changes
            can be saved in the database.
            '''
            file = request.files['file']
            filename = save_and_compress_file(file)
            current_user.profile_image = filename
            db.session.commit()
            return jsonify({"message": "Verification successful.", "statusResponse": "Image uploaded successfully!"})
        elif response == "This token has expired.":
            return jsonify({"message": "This token has expired."})
        elif response == "Decoding error.":
            return jsonify({"message": "Decoding error."})
        elif response == "Something went wrong":
            return jsonify({"message": "Something went wrong."})


# Forgot Password API route.
@app.route("/api/forgot-password", methods=['POST'])
def forgot_password():
    if request.method == 'POST':
        '''
        The code below will be used to send a reset link to a user's inbox.
        First, the frontend will send an email and the URL to the frontend through a
        POST request. Then, the email is used to query a user to check if they exist. 
        If a user does not exist, the backend will send an error message 
        to the frontend stating that the user does not exist.
        If a user does exist, a token will be generated and a reset
        link will be sent to the email along with the token.
        '''
        email = request.json['data']['email']
        frontend_url = request.json['data']['frontendURL']
        user = User.query.filter_by(email=email).first()
        if user == None:
            print("User does not exist and an email has not been sent.")
            return jsonify({"userValid": False})

        if user:
            # This token will expire in 15 minutes.
            jwt_key = jwt.encode({"email": user.email, "exp": datetime.datetime.now(tz=datetime.timezone.utc) + datetime.timedelta(seconds=900)},
                                 os.environ.get("JWT_SECRET_KEY"), algorithm='HS256')
            mail_subject = "PodMaster Password Reset"
            mail_body = f'''
            Hello {user.first_name} {user.last_name}, 
            
            Your email was recently used to make a password reset for your PodMaster account. 

            If you need to reset your password, please visit the link at the bottom of this email (this link will expire in 15 minutes). 
            
            If you did not make this request, you can simply ignore this email and no changes will be made.

            Reset Link: {frontend_url}/reset-password/{jwt_key}

            Sincerely,
            PodMaster Security Team
            '''

            email = Message(
                mail_subject, sender='noreply@demo.com', recipients=[user.email])
            email.body = mail_body
            mail.send(email)

            print("User exists and email has been sent to reset password.")
            return jsonify({'userValid': True, 'emailSent': True})


# Reset Password API Route
@app.route("/api/reset-password/<token>", methods=['GET', 'POST'])
def reset_password(token):
    '''
    If a GET request is sent, the code will first check if the token that was passed
    in the URL is valid. If it is valid, then it will send a verification successful message
    to the frontend along with the user's email. If there is an error, it will send that error.
    '''
    if request.method == 'GET':
        try:
            decoded_email = jwt.decode(token, os.environ.get(
                "JWT_SECRET_KEY"), algorithms=['HS256'])
            user_email = decoded_email['email']
            user = User.query.filter_by(email=user_email).first()
            if user:
                print("Verification successful.")
                return jsonify({"message": "Verification successful.", "userEmail": user.email})
        except jwt.exceptions.ExpiredSignatureError:
            print("This token has expired.")
            return jsonify({"message": "This token has expired."})
        except jwt.exceptions.DecodeError:
            print("Decoding error.")
            return jsonify({"message": "Decoding error."})

    '''
    If a POST request is sent, the code will first check if the token that was passed 
    in the URL is valid. If it is valid, then it will get the user's account by using the token,
    then it will hash the new password, then that new password will be saved and a
    verification successful message along with a 'passwordUpdated' value set to True will be sent
    to the frontend.
    
    If there are any errors, it will send those errors.
    '''
    if request.method == 'POST':
        try:
            decoded_email = jwt.decode(token, os.environ.get(
                "JWT_SECRET_KEY"), algorithms=['HS256'])
            user_email = decoded_email['email']
            user = User.query.filter_by(email=user_email).first()
            if user:
                new_password = request.json['data']['newPassword']
                new_password_hash = bcrypt.generate_password_hash(
                    new_password).decode('utf-8')
                user.password = new_password_hash
                db.session.commit()
                print("Verification successful.")
                return jsonify({"message": "Verification successful.", "passwordUpdated": True})
        except jwt.exceptions.ExpiredSignatureError:
            print("This token has expired.")
            return jsonify({"message": "This token has expired."})
        except jwt.exceptions.DecodeError:
            print("Decoding error.")
            return jsonify({"message": "Decoding error."})


if __name__ == "__main__":
    db.create_all()
    app.run(debug=True, port='8080')
