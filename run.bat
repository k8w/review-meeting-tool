cd backend
start ts-node index.ts
cd ../frontend
start http-server -c-1 -p 80 -o http://localhost/admin
cd ..