from flask import Flask, request
from flask_restful import Api, Resource, reqparse, abort
from logging import Logger
from pymongo.database import Database
from sessionchecker import SessionChecker


class FriendList(Resource):
    def __init__(self, logger: Logger, db: Database, session_checker: SessionChecker):
        self.logger = logger
        self.users = db.get_collection("users")
        self.session_checker = session_checker

    def get(self):
        if "session" not in request.args:
            abort(400)
        session = request.args["session"]
        username = self.session_checker.verify_session(session)
        if username == None:
            abort(401)
        friend_states = self.users.find_one({"username": username})["friendsStates"]
        return {"error": 0, "friendStates": friend_states}
