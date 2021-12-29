from flask import Flask, request
from flask_restful import Api, Resource, reqparse, abort
from logging import Logger
from pymongo import ASCENDING, DESCENDING
from pymongo.database import Database
from sessionchecker import SessionChecker
import time

parser = reqparse.RequestParser()
parser.add_argument("longitude", type=float, required=True)
parser.add_argument("latitude", type=float, required=True)
parser.add_argument("page", type=int, required=True)

PINS_PER_PAGE = 5


class Discover(Resource):
    def __init__(self, logger: Logger, db: Database, session_checker: SessionChecker):
        self.logger = logger
        self.db_pins_col = db.get_collection("pins")
        self.db_users_col = db.get_collection("users")
        self.session_checker = session_checker

    def post(self):
        try:
            args = parser.parse_args()
            longitude = args["longitude"]
            latitude = args["latitude"]
            page = args["page"]
        except Exception as e:
            abort(400)

        if longitude < -180 or longitude > 180 or latitude < -90 or latitude > 90:
            abort(400)

        # if user not login

        pins = (
            self.db_pins_col.find(
                {
                    "location": {
                        "$near": {
                            "$geometry": {
                                "type": "Point",
                                "coordinates": [longitude, latitude],
                            },
                            "$minDistance": 0,
                            "$maxDistance": 500000000,
                        }
                    },
                    "data.type": "public",
                }
            )
            .sort(
                [
                    ("commentsCounts", DESCENDING),
                    ("likeCounts", DESCENDING),
                    ("viewCounts", DESCENDING),
                    ("_id", DESCENDING),
                ]
            )
            .skip(int(PINS_PER_PAGE * page))
            .limit(PINS_PER_PAGE)
        )

        data = []
        for pin in pins:
            data.append(str(pin["_id"]))

        return {"error": 0, "data": data}
