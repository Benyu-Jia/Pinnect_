from flask import Flask, request
from flask_restful import Api, Resource, reqparse, abort
from logging import Logger
from pymongo.database import Database
from bson.objectid import ObjectId
from bson.json_util import loads, dumps
from sessionchecker import SessionChecker
import time

post_parser = reqparse.RequestParser()
post_parser.add_argument("session", type=str)
post_parser.add_argument("user", type=str)


class GetUser(Resource):
    def __init__(self, logger: Logger, db: Database, session_checker: SessionChecker):
        self.logger = logger
        self.db_users = db.get_collection("users")
        self.session_checker = session_checker

    def post(self):
        try:
            args = post_parser.parse_args()
            session = args["session"]
            user = args["user"]
        except:
            abort(400)
        if session == None:
            abort(400)
        username = self.session_checker.verify_session(session)
        if username == None:
            abort(401)
        user_record = self.db_users.find({"username": user})
        data = []
        for i in user_record:
            print(i)
            for each in i:
                print(each)
            data.append((i["profile"]))
        if len(data) == 0:
            return {"error": 1, "message": "user does not exist"}
        else:
            # user_record["username"] = str(user_record["username"])
            return {"error": 0, "users": (data)}
