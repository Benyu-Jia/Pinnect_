from flask import Flask
from flask_restful import Api, Resource, reqparse, abort

from logging import Logger
from pymongo.database import Database
from bson.json_util import dumps
import json

from sessionchecker import SessionChecker

get_parser = reqparse.RequestParser()
get_parser.add_argument("session", type=str)
get_parser.add_argument("username", type=str)

put_parser = reqparse.RequestParser()
put_parser.add_argument("session", type=str)
put_parser.add_argument("key", type=str)
put_parser.add_argument("val", type=str)

put_allowed_fields = [
    "first_name",
    "last_name",
    "age",
    "gender",
    "phone",
    "location.city",
    "location.state",
    "location.country",
]


class Profile(Resource):
    def __init__(self, logger: Logger, db: Database, session_checker: SessionChecker):
        self.logger = logger
        self.db_users = db.get_collection("users")
        self.session_checker = session_checker

    def post(self):
        try:
            args = get_parser.parse_args()
            session = args["session"]
            username = args["username"]
        except:
            abort(400)

        if session == None and username == None:
            abort(400)

        if session == None and username != None:
            # Get other user's profile.
            find_result = self.db_users.find_one({"username": username})
            if find_result == None:
                abort(404)
            else:
                return {"error": 0, "profile": find_result["profile"]}

        elif session != None and username == None:
            # Get current user's profile.
            username = self.session_checker.verify_session(session)
            if username == None:
                abort(401)

            userdata = self.db_users.find_one({"username": username})
            if userdata == None:
                self.logger.warning(
                    f"User {username} is in db.sessions but not in db.users"
                )
                abort(500)

            self.logger.warn(userdata["profile"])
            return {"error": 0, "profile": userdata["profile"]}

        else:
            abort(501)

    def put(self):
        try:
            args = put_parser.parse_args()
            session = args["session"]
            key = args["key"]
            val = args["val"]
        except:
            abort(400)

        if key not in put_allowed_fields:
            abort(400)

        username = self.session_checker.verify_session(session)
        if username == None:
            abort(401)

        if key == "age":
            val = int(val)

        self.db_users.update_one(
            {"username": username}, {"$set": {f"profile.{key}": val}}
        )
        return {"error": 0}
