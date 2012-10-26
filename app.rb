require 'sinatra'

get '/song/:id' do
  p params[:id]
end

post '/song/' do
  p 1
end

put '/song/:id' do
  p params[:id]
end

delete '/song/:id' do
  p params[:id]
end
