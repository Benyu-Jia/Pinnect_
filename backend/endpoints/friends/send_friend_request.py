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


class SendRequest(Resource):
    def __init__(self, logger: Logger, db: Database, session_checker: SessionChecker):
        self.logger = logger
        self.db_users = db.get_collection("users")
        self.session_checker = session_checker

    def post(self):
        try:
            args = post_parser.parse_args()
            session = args["session"]
            user = args["user"]
        except Exception as e:
            abort(400)
        if session == None:
            abort(400)
        username = self.session_checker.verify_session(session)
        if username == None:
            abort(401)
        if user == None:
            abort(401)
        if username == user:
            return {"error": 4, "message": "cannot send request to yourself"}
        # username as X, user as Y
        # get into Y's info
        user_record = self.db_users.find_one({"username": user})

        # append friend status into data
        data = []
        data.append(user_record["friendsStates"])
        if len(user_record) == 0:
            return {"error": 1, "message": "invalid user account"}
        friend = data[0]["friends"]
        wait = data[0]["wait"]
        blackList = data[0]["blackList"]

        # check if X is in Y's friend list or not
        if username not in friend:
            # if not friend, check if  already in the waitting room
            if username in wait:
                return {"error": 3, "message": "already send a request"}

            # else send request, store into await
            wait.append(username)

            result = self.db_users.update_one(
                {"username": user},
                {
                    "$set": {
                        "friendsStates": {
                            "friends": friend,
                            "wait": wait,
                            "blackList": blackList,
                        },
                    }
                },
            )
            print(wait)
            if result == 0:
                abort(404)
            else:
                return {"error": 0}
        # if my friend, show message "already a friend"
        else:
            return {"error": 2, "message": "already a friend"}

    def get(self):
        try:
            args = post_parser.parse_args()
            session = args["session"]
            user = args["user"]
        except Exception as e:
            abort(400)
        if session == None:
            abort(400)
        username = self.session_checker.verify_session(session)
        if username == None:
            abort(401)
        # username as X, user as Y
        # get into Y's info
        user_record = self.db_users.find_one({"username": username})
        # append friend status into data
        data = []
        data.append(user_record["friendsStates"])
        temp = []
        temp.append(user_record["profile"])
        if len(data) == 0:
            return {"error": 1, "message": "invalid user account"}
        friend = data[0]["friends"]
        wait = data[0]["wait"]
        blackList = data[0]["blackList"]

        return {"error": 0, "waits": wait}
