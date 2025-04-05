#!/bin/bash

# Wait for MongoDB to be ready
echo "Waiting for MongoDB to be ready..."
until mongosh mongodb://admin:password@mongodb:27017/admin --quiet --eval "db.adminCommand('ping')" > /dev/null 2>&1; do
  echo "MongoDB not ready yet, waiting..."
  sleep 2
done
echo "MongoDB is ready!"

# Check if database already has data
echo "Checking if database already has data..."
USER_COUNT=$(mongosh mongodb://admin:password@mongodb:27017/elisa-secure-access --quiet --eval "db.users.countDocuments()")

if [ "$USER_COUNT" -eq "0" ]; then
  echo "Database is empty, running seed script..."
  # Run the seed script
  node scripts/seedDatabase.js
  
  # Check if the seed was successful
  if [ $? -eq 0 ]; then
    echo "Database successfully provisioned with schema and sample data!"
  else
    echo "Error: Database seeding failed!"
    exit 1
  fi
else
  echo "Database already has data (found $USER_COUNT users), skipping seed script."
fi

echo "Setup complete!" 