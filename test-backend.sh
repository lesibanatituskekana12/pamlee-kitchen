#!/bin/bash

# Backend Functionality Test Script
# Tests all API endpoints to ensure backend is fully functional

echo "🔍 Testing Pamlee Kitchen Backend"
echo "=================================="
echo ""

BASE_URL="http://localhost:3000"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0

# Test function
test_endpoint() {
    local name=$1
    local method=$2
    local endpoint=$3
    local data=$4
    local headers=$5
    local expected_field=$6
    
    echo -n "Testing: $name... "
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -H "$headers" "$BASE_URL$endpoint")
    else
        response=$(curl -s -X $method -H "Content-Type: application/json" -H "$headers" -d "$data" "$BASE_URL$endpoint")
    fi
    
    if echo "$response" | jq -e ".$expected_field" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ PASS${NC}"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}✗ FAIL${NC}"
        echo "Response: $response"
        ((FAILED++))
        return 1
    fi
}

# 1. Health Check
echo "1️⃣  Health Check"
test_endpoint "API Health" "GET" "/api/health" "" "" "success"
echo ""

# 2. Admin Login
echo "2️⃣  Authentication"
LOGIN_RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" -d '{"email":"admin@pamlee.co.za","password":"admin123"}' "$BASE_URL/api/auth/login")
TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.token')

if [ "$TOKEN" != "null" ] && [ ! -z "$TOKEN" ]; then
    echo -e "${GREEN}✓ PASS${NC} Admin Login"
    echo "Token: ${TOKEN:0:30}..."
    ((PASSED++))
else
    echo -e "${RED}✗ FAIL${NC} Admin Login"
    echo "Response: $LOGIN_RESPONSE"
    ((FAILED++))
fi
echo ""

# 3. Get User Info
echo "3️⃣  User Info"
test_endpoint "Get Current User" "GET" "/api/auth/me" "" "Authorization: Bearer $TOKEN" "success"
echo ""

# 4. Products
echo "4️⃣  Products"
test_endpoint "Get All Products" "GET" "/api/products" "" "" "success"
test_endpoint "Get Product by ID" "GET" "/api/products/1" "" "" "success"
echo ""

# 5. Orders
echo "5️⃣  Orders"
test_endpoint "Get All Orders (Admin)" "GET" "/api/orders" "" "Authorization: Bearer $TOKEN" "success"

# Get first order ID
FIRST_ORDER=$(curl -s -H "Authorization: Bearer $TOKEN" "$BASE_URL/api/orders" | jq -r '.orders[0].trackerId')
if [ "$FIRST_ORDER" != "null" ] && [ ! -z "$FIRST_ORDER" ]; then
    echo -e "${GREEN}✓ PASS${NC} Found order: $FIRST_ORDER"
    ((PASSED++))
    
    # Test get specific order
    test_endpoint "Get Specific Order" "GET" "/api/orders/$FIRST_ORDER" "" "" "success"
else
    echo -e "${YELLOW}⚠ WARN${NC} No orders found"
fi
echo ""

# 6. Stats
echo "6️⃣  Statistics"
STATS_RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" "$BASE_URL/api/stats")
TOTAL_ORDERS=$(echo $STATS_RESPONSE | jq -r '.stats.totalOrders')
TOTAL_REVENUE=$(echo $STATS_RESPONSE | jq -r '.stats.totalRevenue')

if [ "$TOTAL_ORDERS" != "null" ]; then
    echo -e "${GREEN}✓ PASS${NC} Get Stats"
    echo "  Total Orders: $TOTAL_ORDERS"
    echo "  Total Revenue: R$TOTAL_REVENUE"
    ((PASSED++))
else
    echo -e "${RED}✗ FAIL${NC} Get Stats"
    echo "Response: $STATS_RESPONSE"
    ((FAILED++))
fi
echo ""

# 7. Database Connection
echo "7️⃣  Database"
DB_TYPE=$(curl -s "$BASE_URL/api/health" | jq -r '.database')
if [ "$DB_TYPE" = "MongoDB" ]; then
    echo -e "${GREEN}✓ PASS${NC} MongoDB Connected"
    ((PASSED++))
else
    echo -e "${RED}✗ FAIL${NC} Database Connection"
    ((FAILED++))
fi
echo ""

# Summary
echo "=================================="
echo "📊 Test Summary"
echo "=================================="
echo -e "Total Tests: $((PASSED + FAILED))"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed! Backend is fully functional.${NC}"
    exit 0
else
    echo -e "${RED}⚠️  Some tests failed. Please check the errors above.${NC}"
    exit 1
fi
