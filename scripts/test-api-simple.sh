#!/bin/bash

# Simple API endpoint test script
# Usage: ./scripts/test-api-simple.sh [base_url]
# Default base_url: http://localhost:3000

BASE_URL=${1:-http://localhost:3000}

echo "🧪 Testing API Endpoints"
echo "📍 Base URL: $BASE_URL"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

test_endpoint() {
    local name=$1
    local url=$2
    local method=${3:-GET}
    local data=${4:-}
    
    echo -n "Testing: $name ... "
    
    if [ "$method" = "POST" ]; then
        response=$(curl -s -w "\n%{http_code}" -X POST "$url" \
            -H "Content-Type: application/json" \
            -d "$data" 2>&1)
    else
        response=$(curl -s -w "\n%{http_code}" "$url" 2>&1)
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" = "200" ]; then
        echo -e "${GREEN}✓${NC} (HTTP $http_code)"
        echo "  Response preview: $(echo "$body" | head -c 100)..."
    else
        echo -e "${RED}✗${NC} (HTTP $http_code)"
        echo "  Error: $body"
    fi
    echo ""
}

# Test endpoints
test_endpoint "Get Account (steemit)" \
    "$BASE_URL/api/steem/account?username=steemit"

test_endpoint "Get Ranked Posts (Trending)" \
    "$BASE_URL/api/steem/posts?sort=trending&limit=5"

test_endpoint "Get Ranked Posts (Hot)" \
    "$BASE_URL/api/steem/posts?sort=hot&limit=5"

test_endpoint "Get Account Posts (steemit)" \
    "$BASE_URL/api/steem/posts?sort=blog&account=steemit&limit=5"

test_endpoint "Get Notifications (steemit)" \
    "$BASE_URL/api/steem/notifications?account=steemit&limit=10"

test_endpoint "Get Unread Notifications (steemit)" \
    "$BASE_URL/api/steem/unread-notifications?account=steemit"

test_endpoint "Check Authority (Invalid - should fail)" \
    "$BASE_URL/api/auth/check-authority" \
    "POST" \
    '{"username":"nonexistent","password":"test"}'

echo "✅ Testing complete!"

