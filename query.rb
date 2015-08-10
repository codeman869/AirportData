require 'mongo'
require 'json'

client = Mongo::Client.new(["127.0.0.1:27017"], :database => "assignment2", :connect => :direct, :server_selection_timeout => 60)

@airports = Hash.new

def add_to_file(docs, filename, array_name)
	if File::exist?(filename)
		f = File.open(filename, "a:UTF-8")
	else
		f = File.open(filename, "w:UTF-8")
		f.puts "{"
	end

	i = docs.count

	f.puts "\"#{array_name}\":["

	docs.each do |doc|

		if array_name == "flights"
			doc["source"] = @airports[doc["source"].to_s].to_i
			doc["target"] = @airports[doc["target"].to_s].to_i

		end
		i = i - 1
		if i > 0
			f.puts JSON.generate(doc) + ","
		else
			f.puts JSON.generate(doc)
		end

	end

	if array_name == "flights"
		f.puts "]\n}"
	else
		f.puts "],"

	end

	f.close


end

documents = client[:airports].find.aggregate(
	[
		{"$project" => {:_id => 0, :name => "$name", :city => "$city"}}
	]
	)


i = 0
documents.each do |doc|
	@airports.merge!({doc["name"].to_s => i})

	i = i + 1

end

#puts @airports

add_to_file(documents,"final.json","airports")

puts "Added airports to final.json"


documents = client[:flights].find.aggregate(
	[
		{"$sort" => {:source => 1, :dest => 1}}, {"$group" => {:_id => {:source => "$source", :dest => "$dest"},:strength => {"$sum" => 1}}},
		{"$project" => {"_id" => 0, "source" => "$_id.source", "target" => "$_id.dest", "value" => "$strength"}}
	]
	)


add_to_file(documents,"final.json","flights")

puts "Added flights to final.json"

