#!/bin/bash

# Activate virtual environment if it exists
if [ -d "venv" ]; then
    source venv/bin/activate
fi

# Function to run specific test
run_test() {
    echo "Running test: $1"
    PYTHONPATH=$PYTHONPATH:$(pwd) pytest tests/core/test_user_operations.py -v -k "$1" --log-cli-level=INFO
}

# Parse command line argument
case "$1" in
    "create")
        run_test "create"
        ;;
    "delete")
        run_test "delete"
        ;;
    "cleanup")
        run_test "cleanup"
        ;;
    *)
        echo "Usage: $0 {create|delete|cleanup}"
        echo "  create  - Run only the create user test"
        echo "  delete  - Run only the delete user test"
        echo "  cleanup - Run only the cleanup test"
        exit 1
        ;;
esac 