# Use an official Node.js runtime as a parent image
FROM node

# Copy the rest of your application code
COPY . .

# Install dependencies
RUN npm install

CMD ["node","app.js"]