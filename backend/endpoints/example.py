from flask import Flask
from flask_restful import Resource, Api


class Example(Resource):
    def get(self):
        return {
            "name": "John",
            "age": 18,
            "gender": "male",
            "description": "This is an example of a response from an entrypoint.",
        }
