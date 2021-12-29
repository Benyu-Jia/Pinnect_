from flask import Flask, request
from flask_restful import Api, Resource, reqparse, abort
from logging import Logger
from pymongo.database import Database
from bson.objectid import ObjectId
from bson.json_util import loads, dumps
from sessionchecker import SessionChecker
import numpy as np
import time
import math
from sklearn.neighbors import NearestNeighbors
import random
post_parser = reqparse.RequestParser()
post_parser.add_argument("session", type=str, required=True)
post_parser.add_argument("page", type=int, required=True)

PINS_PER_PAGE = 5


class Recommend(Resource):
    def __init__(self, logger: Logger, db: Database, session_checker: SessionChecker):
        self.logger = logger
        self.db_users = db.get_collection("users")
        self.db_pins_col = db.get_collection("pins")
        self.session_checker = session_checker

    def post(self):
        try:
            args = post_parser.parse_args()
            session = args["session"]
            page = args["page"]
        except Exception as e:
            print(e)
            abort(400)
        username = self.session_checker.verify_session(session)
        
        allUser_record = self.db_users.find({})
        allPin_record = self.db_pins_col.find({"data.type": "public"})
        the_matrix = np.zeros((allPin_record.count(), allUser_record.count()))

        ########################
        #    based on users    #
        #######################
        list1 =[]
        rand = []

        u1 = self.db_users.find_one({"username":username})
        if u1 is not None:
            if "recommendFriends" not in u1:
                list1 = []
            else:
                list1.append(u1["recommendFriends"])
            for each in list1:
                p1 = self.db_pins_col.find({"data.username":each})
                for each in p1:
                    rand.append(str(p1[each]["_id"]))
            random.shuffle(rand)
            rand = rand[0:6]

        #####################
        #  based on items   #
        ####################
        pinIndex = 0
        userIndex = 0
        dict1 = {}
        likes = []
        for pin in range(0, allPin_record.count()):
            #likes.append(len(allPin_record[pin]["likes"]))
            pin_id = str(allPin_record[pin]["_id"])
            dict1[pin] = pin_id
            for user in range(0, allUser_record.count()):
                #rating each pin
                rating = 0
                like = comment = view = share = []
                for val in allUser_record[user]["profile"]["stats"]:
                    if val == "likes" or val == "likeCounts":
                        if val == 'likes':
                            like = allUser_record[user]["profile"]["stats"]["likes"]
                        if type(like) == int:
                            rating += like
                            like = []
                        if len(like) == 0:
                            if val == "likeCounts":
                                likes = allUser_record[user]["profile"]["stats"]["likeCounts"]
                                rating += likes
                    if val == "comment" or val == "commentsCounts":
                        if val == 'comment':
                            comment = allUser_record[user]["profile"]["stats"]["comment"]
                        if type(comment) == int:
                            rating += comment
                            comment = []
                        if len(comment) == 0:
                            if val == "commentsCounts":
                                comments = allUser_record[user]["profile"]["stats"]["commentsCounts"]
                                rating += comments
                    if val == "views" or val == "viewCounts":
                        if val == 'views':
                            view = allUser_record[user]["profile"]["stats"]["views"]
                        if type(view) == int:
                            rating += view
                            view = []
                        if len(view) == 0:
                            if val == "viewCounts":
                                views = allUser_record[user]["profile"]["stats"]["viewCounts"]
                                rating += views
                    if val == "shares" or val == "shareCounts":
                        if val == 'shares':
                            share = allUser_record[user]["profile"]["stats"]["shares"]
                        if type(share) == int:
                            rating += share
                            share = []
                        if len(share) == 0:
                            if val == "shareCounts":
                                shares = allUser_record[user]["profile"]["stats"]["shareCounts"]
                                rating += shares
                # print(allUser_record[user]['profile']['stats'])
                
                if allUser_record[user]["username"] == username:
                    pinIndex = pin
                    userIndex = user
                for each in like:
                    if pin_id in each["pin_id"]:
                        rating += 1.5
                        break
                    break
                for each in comment:
                    if pin_id in each["pin_id"]:
                        rating += 0.5
                        break
                for each in share:
                    if pin_id in each["pin_id"]:
                        rating += 1.5
                        break
                cnt = 0
                for each in view:
                    if pin_id in each["pin_id"]:
                        cnt += 1
                if cnt >= 5:
                    rating += 1.5
                elif cnt != 0:
                    rating += 0.5
                the_matrix[pin][user] = rating
                cnt = 0
                rating = 0
        
        original = the_matrix.copy()
        #similar pins
        matrix = self.similarity(
            the_matrix, allPin_record.count(), allUser_record.count()
        )
        theind = self.pinInd(matrix, pinIndex, userIndex)
        theList = []
        for each in theind:
            if each in dict1.keys():
                # remove pins that belong to user himself
                theList.append(self.userCheck(dict1[each], username, page))

        #append pins based on user filter
        if len(rand) >= 0:
            for each in rand:
                # remove pins that belong to user himself
                theList.append(self.userCheck(each, username, page))
     
        # popluar pins
        popular = []
        index1 = []
        tmp2 = []
        
      
        for each in range(0, len(original)):
            tmp2.append(np.sum(original[each]))
           
        arr1 = np.sort(tmp2)
        index1 = np.argsort(tmp2)
        # choose top 5 highest relation pins for each pin
        index1 = index1[len(index1)-5 : ]
        
        for each in index1:
            
            if each in dict1.keys():
                # remove pins that belong to user himself
                theList.append(self.userCheck(dict1[each], username, page))
                popular.append(self.userCheck(dict1[each], username, page))
        
        #return my pin list  
        if popular != None:  
            popular = list(filter(None,popular))
            popular = set((popular))
        if username == None:
            return {"error": 0, "data": loads(dumps(popular))}

        knn_index = self.knn_method(the_matrix, theind)
        for each in knn_index:
            if each in dict1.keys():
                # remove pins that belong to user himself
                theList.append(self.userCheck(dict1[each], username, page))

        theList = list(filter(None,theList))
        theList = set((theList))
        return {"error": 0, "data": loads(dumps(theList))}
       
    # global baseline estimate
    def gre(self, the_matrix, pin_record, user_record):
        the_matrix[the_matrix == 0] = np.nan
        # global baseline estimate
        avg = np.average(the_matrix[~np.isnan(the_matrix)])
        the_matrix1 = ~np.isnan(the_matrix)
        # we check each pin's avg rating and  each user's avg rating
        pinAvg = []
        for each in range(0, pin_record):
            
            pinAvg.append(np.sum(the_matrix[each])/ pin_record)
        userAvg = []
        for each in range(0, user_record):
            userAvg.append(np.nanmean(the_matrix[:, each]))

        GBE = the_matrix1
        for pin in range(0, pin_record):
            for user in range(0, user_record):
                GBE[pin][user] = avg + (pinAvg[pin] - 2.5) + (userAvg[user] - 2.5)
        return GBE

    def similarity(self, the_matrix, pin_record, user_record):
        # repalce  0 as Null
        the_matrix[the_matrix == 0] = np.nan
        # dont consider any values that is a null
        the_matrix1 = ~np.isnan(the_matrix)

        # we get each rows' avg (each pin's rating avg)
        pinAvg = []
        for each in range(0, pin_record):
            pinAvg.append(np.nanmean(the_matrix[each]))
        # CF
        CF = the_matrix
        # print(CF)
        for pin in range(0, pin_record):
            for user in range(0, user_record):
                CF[pin][user] = the_matrix[pin][user] - pinAvg[pin]
        sim = self.calc_sim(CF, pin_record, user_record)
        weight = self.calc_weight(sim, CF, pin_record, user_record)
        return weight

    def cos_similarity(self, the_matrix, a, b):
        """
	    计算两个pin之间的余弦相似度
	    """
        len_a = np.count_nonzero(~np.isnan(a))
        len_b = np.count_nonzero(~np.isnan(b))
        len_ab = 0
        for each in range(0, len(a)):
            if ~np.isnan(a[each]) and ~np.isnan(b[each]):
                len_ab += 1
        if len_ab != 0:
            return len_ab / math.sqrt(len_a * len_b)
        return 0

    """
    计算pin的相同度
    """

    def calc_sim(self, the_matrix, pin_record, user_record):
        cos_sim_data = []
        # cos_sim_data = np.zeros(5)
        for i in range(pin_record):
            dict_temp = []
            a = the_matrix[i]
            for j in range(pin_record):
                b = the_matrix[j]
                dict_temp.append(self.cos_similarity(the_matrix, a, b))
            cos_sim_data.append(dict_temp)
        return cos_sim_data

    """
    预测rating行为
    """

    def calc_weight(self, sim, matrix, pin_record, user_record):
        the_matrix = matrix.copy()
        a1 = []
        for each in range(0, len(sim)):
            # choose top 5 highest relation pins for each pin
            a1.append(np.sum(sim[each]))

        arr1 = np.sort(a1)
        index1 = np.argsort(a1)
        index1 = index1[len(index1) - 5 :]
        for each in range(0, len(sim)):
            # do the prediction here
            i = 0
            for val in the_matrix[each]:
                if np.isnan(val):
                    sumV = 0
                    sumN = 0
                    for j in index1:
                        sumV += arr1[j] * the_matrix[j][i]
                        sumN += arr1[j]
                if sumN != 0:
                    the_matrix[each][i] = sumV * 1.0 / sumN
                sumV = 0
                sumN = 0
                i += 1

        return the_matrix

    # return the index of pin in the matrix
    def pinInd(self, matrix, pinIndex, userIndex):
        the_matrix = matrix[:, userIndex]
        
        ar = np.sort(the_matrix)
        index1 = np.argsort(the_matrix)
        index1 = index1[len(index1)-5:]
        return index1

    # 最近距离
    def knn_method(self, mat, index):
        # 每个用户对每个pin的rating & 每个pin的rating数量
        
        maximum = index[0] # recommend pins based on that pin => the one has the maximum rating received from the user
        matrix = mat.copy()
        matrix[np.isnan(matrix)] = 0
        
        model_knn = NearestNeighbors(metric = 'cosine',algorithm = 'brute')
        model_knn.fit(matrix)

        distance, indices = model_knn.kneighbors(matrix[maximum,:].reshape(1,-1),n_neighbors=5)
        print(len(distance.flatten()))
        print(indices)
        for i in range(len(distance.flatten())):
            if i == 0:
                print("Recommendation for pin" + str(i))
            else: 
                return indices[0] 
        return None

    def selfInt(self, username):
        list1 = self.db_users.find({"usernanme": username})
        for i in list1:
            print(i)
        # for each in list1:
        #     list2 = self.db_pins_col.find({"data": {"username": each}})
        #     print(list2["_id"])
        return None
    # check if the pin is created by user himself
    def userCheck(self, val, username, page):
        pin_record = (
            self.db_pins_col.find({"_id": ObjectId(val)})
            .sort("created_at", -1)
            .skip(int(page * PINS_PER_PAGE))
            .limit(PINS_PER_PAGE )
        )
        if pin_record:
            for a in pin_record:
                if (a["data"]["username"]) == username:
                    return None
                else:
                    return val
