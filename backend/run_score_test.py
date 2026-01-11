from services.scoring_service import calculate_credit_score

# Minimal call: no plaid needed for this test
result = calculate_credit_score(transactions=[])
print(result)
