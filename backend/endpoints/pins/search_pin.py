from flask import Flask, request
from flask_restful import Api, Resource, reqparse, abort
from logging import Logger
from pymongo.database import Database
from bson.objectid import ObjectId
from bson.json_util import loads, dumps
from sessionchecker import SessionChecker
import time
import json

post_parser = reqparse.RequestParser()
post_parser.add_argument("search_key", type=str, required=True)


class SearchPins(Resource):
    def __init__(self, logger: Logger, db: Database, session_checker: SessionChecker):
        self.logger = logger
        self.db_pins_col = db.get_collection("pins")
        self.db_users = db.get_collection("users")
        self.session_checker = session_checker

    def post(self):
        try:
            args = post_parser.parse_args()
            search_key = args["search_key"].lower()
        except:
            abort(400)

        # find all pins whose subject contains pattern
        if len(search_key) != 0:
            result = self.db_pins_col.find({"hashtags": {"$regex": search_key}})

        if result == None:
            return {"error": 1, "message": "No pins found"}

        pin_ids = []
        for each_obj in result:
            str_id = str(each_obj["_id"])
            pin_ids.append(str_id)

        return {"error": 0, "pin_ids": pin_ids}
