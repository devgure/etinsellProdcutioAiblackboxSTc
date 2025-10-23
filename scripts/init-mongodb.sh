#!/bin/bash

set -e

echo "🗄️  Initializing MongoDB for Etincel..."

# Wait for MongoDB
echo "⏳ Waiting for MongoDB to be ready..."
sleep 15

# Create indexes via mongosh
docker exec etincel-mongodb mongosh --quiet <<EOF
use etincel

// Create indexes for users collection
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ phone: 1 }, { unique: true, sparse: true })
db.users.createIndex({ location: "2dsphere" })
db.users.createIndex({ isPremium: 1 })
db.users.createIndex({ planType: 1 })
db.users.createIndex({ createdAt: 1 })
db.users.createIndex({ lastSwipeReset: 1 })

// Create indexes for matches
db.matches.createIndex({ matchedAt: -1 })
db.matches.createIndex({ userIds: 1 })
db.matches.createIndex({ chatId: 1 })

// Create indexes for likes
db.likes.createIndex({ senderId: 1, receiverId: 1 }, { unique: true })
db.likes.createIndex({ likedAt: -1 })

// Create indexes for messages
db.messages.createIndex({ chatId: 1, sentAt: -1 })
db.messages.createIndex({ senderId: 1 })

// Create indexes for photos
db.photos.createIndex({ userId: 1 })
db.photos.createIndex({ moderationStatus: 1 })

// Create indexes for transactions
db.transactions.createIndex({ userId: 1, createdAt: -1 })
db.transactions.createIndex({ status: 1 })
db.transactions.createIndex({ type: 1 })

// Create indexes for subscriptions
db.subscriptions.createIndex({ userId: 1 })
db.subscriptions.createIndex({ status: 1 })
db.subscriptions.createIndex({ currentPeriodEnd: 1 })

print("✅ MongoDB indexes created successfully!")
EOF

echo "✅ MongoDB initialization complete!"