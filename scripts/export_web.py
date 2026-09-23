# SKINMATCH — EXPORT DATA FOR MOBILE WEB APP

import json
from pathlib import Path

import pandas as pd


# -----------------------------------------
# PROJECT PATHS
# -----------------------------------------

BASE_DIR = Path(__file__).resolve().parent.parent

DATA_DIR = BASE_DIR / "data" / "processed"

OUTPUT_DIR = BASE_DIR / "mobile-web" / "data"

OUTPUT_DIR.mkdir(
    parents=True,
    exist_ok=True
)


# -----------------------------------------
# LOAD PROCESSED DATA
# -----------------------------------------

products = pd.read_csv(
    DATA_DIR / "skincare_products.csv",
    dtype={"product_id": "string"}
)

evidence = pd.read_csv(
    DATA_DIR / "skinmatch_database.csv",
    dtype={"product_id": "string"}
)

similarities = pd.read_csv(
    DATA_DIR / "ingredient_similarities.csv",
    dtype={
        "product_id": "string",
        "similar_product_id": "string"
    }
)


# -----------------------------------------
# HELPER FUNCTION
# -----------------------------------------

def clean_value(value):

    if pd.isna(value):
        return None

    return value


# -----------------------------------------
# PREPARE CONSUMER EVIDENCE
# -----------------------------------------

evidence_lookup = {}

for _, row in evidence.iterrows():

    product_id = str(row["product_id"])

    skin_type = str(row["skin_type"]).lower()

    if product_id not in evidence_lookup:

        evidence_lookup[product_id] = {}

    evidence_lookup[product_id][skin_type] = {

        "recommendation_rate": clean_value(
            row["recommendation_percentage"]
        ),

        "review_count": int(
            row["review_count"]
        ),

        "average_rating": clean_value(
            row["average_rating"]
        )
    }


# -----------------------------------------
# PREPARE SIMILAR PRODUCTS
# -----------------------------------------

similarity_lookup = {}

for _, row in similarities.iterrows():

    product_id = str(row["product_id"])

    if product_id not in similarity_lookup:

        similarity_lookup[product_id] = []

    similarity_lookup[product_id].append({

        "product_id": str(
            row["similar_product_id"]
        ),

        "similarity_score": float(
            row["similarity_score"]
        )
    })


# -----------------------------------------
# BUILD MOBILE PRODUCT DATABASE
# -----------------------------------------

mobile_products = []

for _, row in products.iterrows():

    product_id = str(row["product_id"])

    ingredients = []

    if pd.notna(
        row.get("ingredient_list_json")
    ):

        ingredients = json.loads(
            row["ingredient_list_json"]
        )

    product = {

        "product_id": product_id,

        "product_name": clean_value(
            row["product_name"]
        ),

        "brand_name": clean_value(
            row["brand_name"]
        ),

        "category": clean_value(
            row["product_category"]
        ),

        "price_usd": clean_value(
            row["price_usd"]
        ),

        "ingredients": ingredients,

        "skin_type_insights":
            evidence_lookup.get(
                product_id,
                {}
            ),

        "similar_products":
            similarity_lookup.get(
                product_id,
                []
            )
    }

    mobile_products.append(product)


# -----------------------------------------
# EXPORT JSON
# -----------------------------------------

output_file = (
    OUTPUT_DIR / "skinmatch_mobile.json"
)

with open(
    output_file,
    "w",
    encoding="utf-8"
) as file:

    json.dump(
        mobile_products,
        file,
        ensure_ascii=False,
        allow_nan=False,
        separators=(",", ":")
    )


# -----------------------------------------
# CONFIRM EXPORT
# -----------------------------------------

print("=" * 60)

print("SKINMATCH MOBILE DATA EXPORT")

print("=" * 60)

print(
    "\nProducts exported:",
    len(mobile_products)
)

print(
    "\nFile created:",
    output_file
)

print(
    "\nFile size:",
    round(
        output_file.stat().st_size / (1024 ** 2),
        2
    ),
    "MB"
)

print(
    "\nSUCCESS — MOBILE DATABASE READY!"
)