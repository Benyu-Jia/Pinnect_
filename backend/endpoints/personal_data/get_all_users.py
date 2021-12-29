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
post_parser.add_argument("any1", type=str)
class GetAllUsers(Resource):
    def __init__(self, logger: Logger, db: Database, session_checker: SessionChecker):
        self.logger = logger
        self.db_users = db.get_collection("users")
        self.session_checker = session_checker
    def post(self):
        try:
            args = post_parser.parse_args()
            session = args["session"]
            any1 = args["any1"]
        except Exception as e:
            abort(400)
        if session == None :
            abort(400)
        username = self.session_checker.verify_session(session)
        if username == None:
            abort(401) 
        
        allUser_record = self.db_users.find({})      
        data = []
        for i in allUser_record:
            
            # for each  in i:
            #     print (each)
            data.append((i["profile"]))
        if allUser_record == None:
            return {"error": 1, "message": "user does not exist"}
        else:
            #user_record["username"] = str(user_record["username"])
            return {"error": 0, "users": loads(dumps(data))}
