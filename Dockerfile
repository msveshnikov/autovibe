FROM oven/bun:1.2.5-slim as base
WORKDIR /app

# Install dependencies
COPY package.json bun.lockb ./
RUN bun install 

# Copy source code
COPY . .

# Expose the port
EXPOSE 3000

# Start the server
CMD ["bun", "server/index.js"]