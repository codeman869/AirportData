require 'json'
require 'csv'
require 'pp'

nodes = Hash.new
flights = Array.new
i = 0
CSV.foreach("airline_data.csv") do |row|
	if i > 0
		nodes.store(row[5].to_sym,row[6])
		flights << JSON.generate({:source => row[5], :dest => row[9], :time => row[13].to_i})
	end
	i = i + 1
end
f = File.open("airports.json", mode:"w:UTF-8")
nodes.each do |node|
	f.puts JSON.generate(:name => node[0], :city => node[1])
end

f.close


f = File.open("flights.json", mode: "w:UTF-8")



flights.each do |flight|
	f.puts flight
end


f.close

puts "Done"


