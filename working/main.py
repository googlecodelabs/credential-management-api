#!/usr/bin/python
# Copyright Google Inc. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
# coding: -*- utf-8 -*-

from google.appengine.ext import vendor
vendor.add('lib')

import os
import sys
import binascii
import json
import urllib
from bcrypt import bcrypt
from flask import Flask, request, make_response, render_template,\
                  session, redirect, url_for
from oauth2client import client

from google.appengine.ext import ndb
from google.appengine.api import urlfetch

# Does `client_secrets.json` file exist?
if os.path.isfile('client_secrets.json') is False:
    sys.exit('client_secrets.json not found.')

# Load `client_secrets.json` file
keys = json.loads(open('client_secrets.json', 'r').read())['web']

CLIENT_ID = keys['client_id']

app = Flask(
    __name__,
    static_url_path='',
    static_folder='static',
    template_folder='templates'
)
app.debug = True

# `SECRET_KEY` can be anything as long as it is hidden, but we use
# `client_secret` here for convenience
SECRET_KEY = keys['client_secret']
app.config.update(
    SECRET_KEY=SECRET_KEY
)


# App Engine Datastore to save credentials
class CredentialStore(ndb.Model):
    profile = ndb.JsonProperty()

    @classmethod
    def remove(cls, key):
        ndb.Key(cls.__name__, key).delete()

    @classmethod
    def hash(cls, password):
        return bcrypt.hashpw(password, bcrypt.gensalt())

    @classmethod
    def verify(cls, password, hashed):
        if bcrypt.hashpw(password, hashed) == hashed:
            return True
        else:
            return False


@app.before_request
def csrf_protect():
    # All incoming POST requests will pass through this
    if request.method == 'POST':
        # Obtain CSRF token embedded in the session
        csrf_token = session.get('csrf_token', None)
        # Compare the POST'ed CSRF token with the one in the session
        if not csrf_token or csrf_token != request.form.get('csrf_token'):
            # Return 403 if empty or they are different
            return make_response('Forbidden', 403)


@app.route('/')
def index():
    # Issue a CSRF token if not included in the session
    if 'csrf_token' not in session:
        session['csrf_token'] = binascii.hexlify(os.urandom(24))

    # Obtain id from session
    id = session.get('id', None)

    # If session includes `id`, the user is already signed in
    if id is not None:
        store = CredentialStore.get_by_id(id)
        if store is not None:
            return redirect(url_for('main'))

    return render_template('index.html',
                           path=request.path,
                           client_id=CLIENT_ID,
                           csrf_token=session['csrf_token'])


@app.route('/main')
def main():
    # TODO: Is this required?
    if 'csrf_token' not in session:
        session['csrf_token'] = binascii.hexlify(os.urandom(24))

    # Obtain id from session
    id = session.get('id', None)

    # If session doesn't include `id`, the user is not signed in
    if id is None:
        return redirect(url_for('signin'))

    # Obtain Datastore entry by email address
    store = CredentialStore.get_by_id(id)

    # If the store doesn't exist, fail.
    if store is None:
        return redirect(url_for('signin'))

    profile = store.profile

    return render_template('main.html',
                           path=request.path,
                           name=profile['name'],
                           imageUrl=profile['imageUrl'],
                           csrf_token=session['csrf_token'])


@app.route('/signin')
def signin():
    if 'csrf_token' not in session:
        session['csrf_token'] = binascii.hexlify(os.urandom(24))

    return render_template('signin.html',
                           path=request.path,
                           client_id=CLIENT_ID,
                           csrf_token=session['csrf_token'])


@app.route('/auth/password', methods=['POST'])
def pwauth():
    # The POST should include `email`
    email = request.form.get('email', None)[:32]
    # The POST should include `password`
    password = request.form.get('password', None)[:32]

    if not email or not password:
        return make_response('Authentication failed', 401)

    # Obtain Datastore entry by email address
    store = CredentialStore.get_by_id(email)

    # If the store doesn't exist, fail.
    if store is None:
        return make_response('Authentication failed', 401)

    profile = store.profile

    # If the profile doesn't exist, fail.
    if profile is None:
        return make_response('Authentication failed', 401)

    # If the password doesn't match, fail.
    if CredentialStore.verify(password, profile['password']) is False:
        return make_response('Authentication failed', 401)

    session['id'] = email

    # Not making a session for demo purpose/simplicity
    return make_response('Authenticated', 200)


@app.route('/auth/google', methods=['POST'])
def gauth():
    # The POST should include `id_token`
    id_token = request.form.get('id_token', '')[:3072]

    # Verify the `id_token` using API Client Library
    idinfo = client.verify_id_token(id_token, CLIENT_ID)

    # Additional verification: See if `iss` matches Google issuer string
    if idinfo['iss'] not in ['accounts.google.com',
                             'https://accounts.google.com']:
        return make_response('Authentication failed', 401)

    id = idinfo['sub']

    # For now, we'll always store profile data after successfully
    # verifying the token and consider the user authenticated.
    store = CredentialStore.get_by_id(id)

    if store is None:
        store = CredentialStore(id=id)

    # Construct a profile object
    store.profile = {
        'id':        id,
        'imageUrl':  idinfo.get('picture', None),
        'name':      idinfo.get('name', None),
        'email':     idinfo.get('email', None)
    }
    store.put()

    session['id'] = id

    # Not making a session for demo purpose/simplicity
    return make_response('Authenticated', 200)


@app.route('/register', methods=['POST'])
def register():
    # The POST should include `email`
    email = request.form.get('email', None)[:32]

    # The POST should include `password`
    _password = request.form.get('password', None)[:32]

    # Validate the parameters POST'ed (intentionally not too strict)
    if not email or not _password:
        return make_response('Bad Request', 400)

    # Hash password
    password = CredentialStore.hash(_password)
    # Perform relevant sanitization/validation on your own code.
    # This demo omits them on purpose for simplicity.
    profile = {
        'id':       email,
        'email':    email,
        'name':     request.form.get('name', ''),
        'password': password,
        'imageUrl': '/images/default_img.png'
    }

    # Overwrite existing user
    store = CredentialStore(id=profile['id'], profile=profile)
    store.put()

    session['id'] = profile['id']

    # Not making a session for demo purpose/simplicity
    return make_response('Registered', 200)


@app.route('/unregister', methods=['POST'])
def unregister():
    # Obtain id from session
    id = session.get('id', None)

    # If session includes `id`, the user is already signed in
    if id is None:
        return make_response('Authentication failed', 401)
    store = CredentialStore.get_by_id(id)
    if store is None:
        return make_response('Authentication failed', 401)

    profile = store.profile

    if profile is None:
        return make_response('Authentication failed', 401)

    # Remove the user account
    CredentialStore.remove(id)

    # Not terminating a session for demo purpose/simplicity
    return make_response('Unregistered', 200)


@app.route('/signout')
def signout():
    # Terminate sessions
    session.pop('id', None)

    # Not terminating a session for demo purpose/simplicity
    return redirect(url_for('index',
                            quote='You are signed out'))
