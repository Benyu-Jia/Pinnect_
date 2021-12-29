from flask import Flask
from flask_restful import Api, Resource, reqparse, request, abort

from logging import Logger
from pymongo.database import Database
import json

from sessionchecker import SessionChecker

post_parser = reqparse.RequestParser()
post_parser.add_argument("session", type=str, required=True)
post_parser.add_argument("data", required=True)


class Settings(Resource):
    """
    This endpoint returns and updates a Pinnect user's preference.
    
        Path : /api/preferences
        Auth : Required
    
    GET
    ---
    
    Returns the preferences data of the user.

    Request as such `/api/preferences?session=<...>`
    
    POST
    ----
    Updates the preference of a user.

    Request format:
    
        {
          session: <...>,
          data: {
            <...>
          }
        }
    
    Everything inside `data` will be the user's new preference.

    Returns `{error: 0}` upon success.
    """

    def __init__(self, logger: Logger, db: Database, session_checker: SessionChecker):
        self.logger = logger
        self.users = db.get_collection("users")
        self.session_checker = session_checker

    def get(self):
        """
        Returns the preferences data of the user
        """
        if "session" not in request.args:
            abort(400)
        session = request.args["session"]
        username = self.session_checker.verify_session(session)
        if username == None:
            abort(401)

        userdata = self.users.find_one({"username": username})
        if userdata == None:
            self.logger.warning(
                f"User {username} is in db.sessions but not in db.users"
            )
            abort(500)

        return {"error": 0, "settings": userdata["settings"]}

    def post(self):
        """
        Updates the preference of a user
        """
        args = post_parser.parse_args()
        session = args["session"]
        data = args["data"]

        username = self.session_checker.verify_session(session)
        if username == None:
            abort(401)

        update_result = self.users.update_one(
            {"username": username}, {"$set": {"settings": json.loads(data)}}
        )
        if update_result.matched_count == 0:
            self.logger.warning(
                f"User {username} is in db.sessions but not in db.users"
            )
            abort(500)

        return {"error": 0}
