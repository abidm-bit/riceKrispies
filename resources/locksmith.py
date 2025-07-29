import pandas as pd
from faker import Faker
import random
import string

f = Faker()
chars = string.ascii_uppercase + string.digits

def generate_key():
    # Generate all 25 characters at once, then split into sections
    key = ''.join(random.choices(chars, k=25))
    return '-'.join([key[i:i+5] for i in range(0, 25, 5)])

# Use generator expression for memory efficiency if not storing in memory
keys = [generate_key() for _ in range(100_000)]

# Save to CSV
df = pd.DataFrame({'Product Key': keys})
df.to_csv("/Users/dema/VSCodeProjects/riceKrispies/generateTestData/generated_keys.csv", index=False)


print("100,000 keys generated and saved to 'generated_keys.csv'")
