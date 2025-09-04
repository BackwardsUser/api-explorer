FROM node:14

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

# Ensure TypeScript is installed globally (optional, if not in devDependencies)
RUN npm install -g typescript

# Build the TypeScript code
RUN npm run build

EXPOSE 2989

# Run the compiled JavaScript output
CMD ["node", "dist/index.js"]
