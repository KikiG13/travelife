#!/bin/bash

API="http://localhost:4741"
URL_PATH="/destinations"

curl "${API}${URL_PATH}/${ID}" \
  --include \
  --request PATCH \
  --header "Content-Type: application/json" \
--header "Authorization: Bearer ${TOKEN}" \
--data '{
    "destination": {
      "country": "'"${COUNTRY}"'",
      "city": "'"${CITY}"'",
      "comment": "'"${COMMENT}"'" ,
      "favoriteDish": "'"${favoriteDish}"'",
      "site1": "'"${site1}"'",
      "site2": "'"${site2}"'",
      "site3": "'"${site3}"'",
      "photo": "'"${photo}"'",
      "rating": "'"${rating}"'",
      "owner": "'"${owner}"'"
    }
  }'

echo
