# Code written by Arpan Neupane.
# Copyright (c) Arpan Neupane 2022. All rights reserved.

from configs import db
import uuid


def uuid_gen():
    return str(uuid.uuid4())


# User table schema
class User(db.Model):
    id = db.Column(db.String, primary_key=True,
                   default=uuid_gen, unique=True)
    first_name = db.Column(db.String(), nullable=False)
    last_name = db.Column(db.String(), nullable=False)
    username = db.Column(db.String(15), unique=True, nullable=False)
    email = db.Column(db.String(320), unique=True, nullable=False)
    password = db.Column(db.String(80), nullable=False)
    deactivated = db.Column(db.Boolean, default=False, nullable=False)
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
        'Podcast', backref="owner", foreign_keys="Podcast.owner_id", lazy='dynamic', cascade="all,delete")
    comments = db.relationship(
        "Comment", backref="commenter", foreign_keys="Comment.commenter_id", lazy='dynamic', cascade="all,delete")
    likes = db.relationship("Like", backref="liker",
                            foreign_keys="Like.liker_id", lazy='dynamic', cascade="all,delete")
    follower = db.relationship(
        "Follow", backref='follower', foreign_keys="Follow.follower_id", lazy='dynamic', cascade="all,delete")
    followee = db.relationship(
        "Follow", backref='followee', foreign_keys="Follow.followee_id", lazy='dynamic', cascade="all,delete")

    def is_following_user(self, user):
        '''
        This method will either return True or False. A user object is passed in as an argument
        and this method will check to see if the current user is following the user that was passed
        in as an argument. If they are following them, then True will be returned, otherwise False will
        be returned.
        '''
        is_following = Follow.query.filter_by(
            follower=self, followee=user).count() > 0
        return is_following

    def has_liked_podcast(self, podcast):
        '''
        This method will either return True or False. A user object is passed in as an argument
        and this method will check to see if the current user is following the user that was passed
        in as an argument. If they are following them, then True will be returned, otherwise False will
        be returned.
        '''
        has_liked = Like.query.filter_by(
            liker=self, podcast=podcast).count() > 0
        return has_liked


# Podcast table schema
class Podcast(db.Model):
    id = db.Column(db.String, primary_key=True, default=uuid_gen)
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
    owner_id = db.Column(db.String, db.ForeignKey("user.id"), nullable=False)
    podcast_title = db.Column(db.String(50), nullable=False)
    podcast_description = db.Column(db.String(500), nullable=False)
    podcast_file = db.Column(db.String(30), unique=True, nullable=False)
    likes = db.relationship("Like", backref="podcast",
                            foreign_keys="Like.podcast_id", lazy='dynamic', cascade="all,delete")
    comments = db.relationship(
        "Comment", backref="podcast", foreign_keys="Comment.podcast_id", lazy='dynamic', cascade="all,delete")


# Like table schema
class Like(db.Model):
    id = db.Column(db.String, primary_key=True, default=uuid_gen)
    '''The 'podcast_id' variable will be equal to the podcast's id which was liked.'''
    podcast_id = db.Column(db.String, db.ForeignKey(
        "podcast.id"), nullable=False)
    liker_id = db.Column(db.String, db.ForeignKey("user.id"), nullable=False)


# Comment table schema
class Comment(db.Model):
    id = db.Column(db.String, primary_key=True, default=uuid_gen)
    '''
    The 'commenter_id' will be equal to the commenter's id in the database.
    It can be also known as the user that created the comment on the podcast.
    The 'podcast_id' will be equal to the podcast that was being commented on.
    This value will just be the id of that podcast.
    '''
    comment = db.Column(db.String(150), nullable=False)
    commenter_id = db.Column(
        db.String, db.ForeignKey("user.id"), nullable=False)
    podcast_id = db.Column(db.String, db.ForeignKey(
        "podcast.id"), nullable=False)


# Follower table schema
class Follow(db.Model):
    id = db.Column(db.String, primary_key=True, default=uuid_gen)
    '''
    The 'follower_id' is the user id of the person who is the follower
    of another user.
    The 'followee_id' is the user id of the person who was followed
    by another user.
    For example, if user_1 follows user_2, user_1 is the follower, and user_2
    is the followee.
    '''
    follower_id = db.Column(db.String, db.ForeignKey("user.id"))
    followee_id = db.Column(db.String, db.ForeignKey("user.id"))
