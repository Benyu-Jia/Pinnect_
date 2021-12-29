from flask import Flask, request
from flask_restful import Api, Resource, reqparse, abort
from flask_bcrypt import Bcrypt
from logging import Logger
from pymongo.database import Database
import regex as re
import time
from sessionchecker import SessionChecker

parser = reqparse.RequestParser()
parser.add_argument("session", type=str, required=True)


class GetInterests(Resource):
    """
    This module handles adding user interests.
    """

    def __init__(self, logger: Logger, db: Database, session_checker: SessionChecker):
        self.logger = logger
        self.db_users = db.get_collection("users")
        self.session_checker = session_checker

    def post(self):
        try:
            args = parser.parse_args()
            session = args["session"]
        except Exception as e:
            abort(400)

        if session == None:
            abort(400)

        username = self.session_checker.verify_session(session)

        if username == None:
            abort(401)

        current_user = self.db_users.find_one({"username": username})  # UNSURE

        interests = current_user["interests"]

        return {"error": 0, "interests": interests}
