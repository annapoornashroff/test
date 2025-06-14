#!/bin/bash

# Activate virtual environment if it exists
if [ -d "venv" ]; then
    source venv/bin/activate
fi

# Run tests with proper Python path
PYTHONPATH=$PYTHONPATH:$(pwd) pytest tests/core/ -v "$@" 