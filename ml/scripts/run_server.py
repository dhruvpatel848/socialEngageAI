#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
EngageAI ML Service Server

This script starts the FastAPI server for the ML service.

Usage:
    python run_server.py [--host HOST] [--port PORT] [--reload]
"""

import os
import sys
import argparse
import logging
import uvicorn
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 
                                         'logs', 'server.log'))
    ]
)

logger = logging.getLogger(__name__)

# Ensure logs directory exists
os.makedirs(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'logs'), exist_ok=True)

def parse_args():
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(description='Run the EngageAI ML service server')
    
    parser.add_argument('--host', type=str, 
                        default=os.getenv('HOST', '0.0.0.0'),
                        help='Host to run the server on')
    parser.add_argument('--port', type=int, 
                        default=int(os.getenv('PORT', 8000)),
                        help='Port to run the server on')
    parser.add_argument('--reload', action='store_true',
                        help='Enable auto-reload for development')
    
    return parser.parse_args()

def main():
    """Main function to run the server."""
    args = parse_args()
    
    logger.info(f"Starting EngageAI ML service server on {args.host}:{args.port}")
    
    # Add the project root to the Python path
    import sys
    import os
    sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    
    # Run the server
    uvicorn.run(
        "src.main:app",
        host=args.host,
        port=args.port,
        reload=args.reload,
        log_level="info"
    )

if __name__ == "__main__":
    main()