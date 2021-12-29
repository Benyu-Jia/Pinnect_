from flask_restful import Resource, reqparse, abort
from logging import Logger
from pymongo.database import Database
from sessionchecker import SessionChecker

import time

post_parser = reqparse.RequestParser()
post_parser.add_argument("session", type=str)

MAX_RECOMMENDED_FRIENDS = 3


def populate_recommendations(logger, db_users):
    while True:
        logger.info("Populating recommended friends for users")
        for user_A in db_users.find():
            recommended_friends = []
            for user_B in db_users.find():
                if user_A == user_B:  # does this work?
                    continue
                AB_similarity = check_similarity(
                    user_A["interests"], user_B["interests"]
                )
                if len(recommended_friends) >= MAX_RECOMMENDED_FRIENDS:
                    recommended_friends.sort(key=get_similar)
                    if recommended_friends[0][0] < AB_similarity:
                        recommended_friends[0] = [AB_similarity, user_B["username"]]
                else:
                    recommended_friends.append([AB_similarity, user_B["username"]])
            recommended_friends.sort(key=get_similar)
            db_users.update_one(
                {"_id": user_A["_id"]},
                {"$set": {"recommendFriends": recommended_friends}},
            )
        logger.info("Populated recommended friends for users")
        time.sleep(5)


def check_similarity(A_interests, B_interests):
    if A_interests == None or B_interests == None:
        return 0

    if len(A_interests) == 0 or len(B_interests) == 0:
        return 0

    sum = 0

    for Asinterest in A_interests:
        for BsInterest in B_interests:
            if Asinterest == BsInterest:
                sum = sum + 1

    ratio = sum / len(A_interests)

    return ratio


def get_similar(val):
    return val[0]


class RecommendFriends(Resource):
    def __init__(self, logger: Logger, db: Database, session_checker: SessionChecker):
        self.logger = logger
        self.users = db.get_collection("users")
        self.session_checker = session_checker

    def post(self):
        try:
            args = post_parser.parse_args()
            session = args["session"]
        except Exception as e:
            abort(400)

        if session == None:
            abort(400)

        username = self.session_checker.verify_session(session)
        if username == None:
            abort(401)

        user_record = self.users.find_one({"username": username})
        if "recommendFriends" not in user_record:
            return {"error": 0, "recommendFriends": []}

        return {"error": 0, "recommendFriends": user_record["recommendFriends"]}

