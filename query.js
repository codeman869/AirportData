use assignment2
db.flights.aggregate([{"$sort":{"source":1,"dest":1}},{"$group":{"_id":{"source":"$source","dest":"$dest"},"strength":{$sum:1}}}])