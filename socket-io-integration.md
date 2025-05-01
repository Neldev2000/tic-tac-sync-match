# Socket.io Integration for Local Testing

This document provides instructions for setting up local real-time testing using Socket.io as an alternative to Supabase for development.

## Overview

The application can operate in two modes:
- **Cloud mode**: Uses Supabase for real-time functionality (default)
- **Local mode**: Uses Socket.io for real-time functionality (for development)

## Setup Instructions

### 1. Install Dependencies

Make sure you have installed all the required dependencies:

```bash
npm install
```

### 2. Configure Environment

Create a `.env.local` file in the project root with the following content:

```
NEXT_PUBLIC_USE_LOCAL_SOCKET=true
NEXT_PUBLIC_SOCKET_IO_URL=http://localhost:3001
```

To switch back to Supabase mode, set `NEXT_PUBLIC_USE_LOCAL_SOCKET=false` or remove the variable.

### 3. Start the Socket.io Server and Development Server

Run both the Socket.io server and the development server concurrently:

```bash
npm run dev:local
```

This will start:
- Socket.io server on port 3001
- Vite development server on the default port

You can also run them separately:

```bash
# Socket.io server only
npm run socket-server

# Vite development server only
npm run dev
```

## How It Works

The application uses a factory pattern to determine which implementation to use:

1. On startup, the application checks the `NEXT_PUBLIC_USE_LOCAL_SOCKET` environment variable
2. If set to `true`, the Socket.io implementation is used
3. If set to `false` (or not set), the Supabase implementation is used

## Architecture

- **Service Interfaces**: Define the contract for both implementations
  - `IGameService`: Core game operations
  - `IRealtimeService`: Subscription methods

- **Service Implementations**:
  - Supabase: Uses Supabase API and real-time channels
  - Socket.io: Uses Socket.io client to connect to the local server

- **Service Factory**: Creates the appropriate service based on the environment

- **Socket.io Server**: Provides a local backend for development and testing

## Troubleshooting

### Socket.io Server Not Starting

If you encounter issues starting the Socket.io server:

1. Make sure all dependencies are installed
2. Check for port conflicts on port 3001
3. Look for errors in the console output

### Socket.io Client Not Connecting

If the client cannot connect to the Socket.io server:

1. Verify the server is running
2. Check the `NEXT_PUBLIC_SOCKET_IO_URL` is set correctly
3. Look for connection errors in the browser console

## Development Notes

- The Socket.io server uses an in-memory store that mimics the Supabase database structure
- Game state is not persisted when using the Socket.io implementation
- The Socket.io implementation should provide functional parity with the Supabase implementation 