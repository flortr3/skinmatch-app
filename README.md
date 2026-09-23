# SkinMatch
### Ingredient-Based Skincare Analysis and Recommendation System

SkinMatch is a Data Science project that helps consumers explore skincare
products through ingredient analysis, consumer recommendation statistics,
and a content-based recommendation engine.

The project combines Python, supervised Machine Learning research,
TF-IDF, Cosine Similarity, and an installable mobile web application.

## Live Application

**Try SkinMatch:**

https://flortr3.github.io/skinmatch-app/

SkinMatch can be added to the home screen of a compatible smartphone
and opened as a Progressive Web App (PWA).

No account or personal skin-type information is required.

## Data Science Notebook

The complete Data Science methodology, including data preprocessing,
ingredient feature engineering, Logistic Regression, model evaluation,
and ingredient similarity analysis, is documented in the following notebook:

[View SkinMatch Data Science Notebook](notebooks/SkinMatch_DataScience.ipynb)
---

## 1. Project Overview

Consumers often struggle to understand skincare formulations and
determine how products have been experienced by people with different
skin types.

SkinMatch was developed to make skincare information easier to explore.

Users can search for a Sephora skincare product and receive:

- Product information.
- Full ingredient profile.
- Consumer recommendation statistics for four skin types.
- Number of reviews supporting each recommendation rate.
- Products with similar ingredient profiles.

SkinMatch automatically compares results for:

- Dry skin
- Oily skin
- Normal skin
- Combination skin

Users are not required to enter their own skin type.

---

## 2. Research Question

Can machine learning predict whether a skincare product will be
recommended by consumers with a specific skin type based on its
ingredient profile?

The research investigates relationships between:

- Skin type
- Product category
- Ingredient composition
- Consumer recommendation behavior

---

## 3. Dataset

**Source:** Sephora Products and Skincare Reviews

**Platform:** Kaggle

https://www.kaggle.com/datasets/nadyinky/sephora-products-and-skincare-reviews

The original dataset contains product information and consumer reviews.

After preprocessing, the ingredient analysis included:

| Dataset Information | Result |
|---|---:|
| Original products | 8,494 |
| Original skincare products | 2,420 |
| Skincare products with ingredient information | 2,286 |
| Products with valid reviews in the ML dataset | 2,223 |
| Valid skincare reviews in the ML dataset | 893,263 |

The source data is historical and does not represent live Sephora
inventory, prices, reviews, or product formulations.

---

## 4. Data Science Methodology

The project follows this pipeline:

Data Collection
→ Data Cleaning
→ Ingredient Extraction
→ Feature Engineering
→ Machine Learning
→ Model Evaluation
→ Ingredient Similarity
→ Mobile Application

### Data Preprocessing

The original product and review files were integrated using product
identifiers.

The preprocessing workflow included:

- Filtering skincare products.
- Removing products without usable ingredient information.
- Standardizing skin-type values.
- Retaining valid recommendation labels.
- Extracting and normalizing ingredient names.
- Calculating recommendation statistics by product and skin type.

### Ingredient Feature Engineering

Ingredient lists were converted into structured features suitable
for machine learning and product similarity analysis.

The preprocessing also accounted for chemical names containing commas
and common ingredient naming variations.

---

## 5. Supervised Machine Learning

Logistic Regression was used to investigate whether consumer
recommendations could be predicted from:

- Skin type
- Product category
- Ingredient features

The model used 500 selected ingredient features and categorical
product information.

Products were divided into training and test sets using a group-based
split to prevent the same product from appearing in both sets.

### Model Evaluation

| Metric | Baseline | Logistic Regression |
|---|---:|---:|
| Accuracy | 0.8478 | 0.8478 |
| Balanced Accuracy | 0.5000 | 0.5000 |
| ROC-AUC | 0.5000 | 0.5712 |
| Average Precision | 0.8478 | 0.8783 |
| Brier Score | 0.1291 | 0.1283 |

The model demonstrated limited ability to distinguish positive and
negative recommendations for previously unseen products.

At the default classification threshold, it classified all test
reviews as positive recommendations.

Therefore, the classifier was retained as an academic research
component rather than used to generate consumer-facing skin
suitability predictions.

---

## 6. Ingredient-Based Recommendation Engine

SkinMatch includes a content-based recommendation engine using:

**TF-IDF + Cosine Similarity**

The recommendation system:

1. Extracts ingredients from each product.
2. Converts ingredient lists into numerical features.
3. Applies TF-IDF weighting.
4. Calculates Cosine Similarity between product ingredient profiles.
5. Identifies similar products within the same skincare category.

The resulting recommendations are generated algorithmically rather
than manually assigned.

Ingredient similarity represents similarity between the available
ingredient lists. It does not establish equivalent effectiveness,
concentrations, safety, or dermatological suitability.

---

## 7. Consumer Recommendation Analysis

SkinMatch calculates observed recommendation rates for each product
and skin type.

Recommendation Rate =

(Positive Recommendations / Total Reviews) × 100

The application displays recommendation percentages alongside the
number of reviews and average rating.

These results describe historical consumer experiences rather than
clinical predictions.

---

## 8. Application Features

The SkinMatch mobile application includes:

- Product search by name or brand.
- Product category filtering.
- Product information and ingredient lists.
- Recommendation statistics across four skin types.
- Ingredient-based product matching.
- Shared ingredient comparisons.
- Installable mobile web interface.

The application does not require users to provide personal health
information or identify their own skin type.

---

## 9. Technologies Used

### Data Science

- Python
- pandas
- NumPy
- SciPy
- scikit-learn
- Jupyter Notebook

### Machine Learning and Recommendation Methods

- Logistic Regression
- TF-IDF
- Cosine Similarity
- Ingredient Feature Engineering

### Application Development

- HTML
- CSS
- JavaScript
- Progressive Web App (PWA)
- GitHub Pages

---

## 10. Project Architecture

The Data Science pipeline was developed in Python.

The processed product catalog, recommendation statistics, and
ingredient similarity results were exported to JSON.

The mobile application reads these precomputed results using
JavaScript.

This architecture allows the application to function without
running Python or retraining models on the user's phone.

---
## Reproducing the Data Science Project

The Data Science workflow was developed using Python 3.11.

### 1. Download the Original Dataset

Download the Sephora Products and Skincare Reviews dataset from Kaggle:

https://www.kaggle.com/datasets/nadyinky/sephora-products-and-skincare-reviews

Place the original CSV files in:

`data/raw/`

### 2. Set Up the Python Environment

```bash
conda create --name skinmatch python=3.11 -y
conda activate skinmatch
python -m pip install -r requirements.txt
```

### 3. Run the Data Science Notebook

Open:

`notebooks/SkinMatch_DataScience.ipynb`

Execute the notebook to reproduce the data cleaning, ingredient feature
engineering, Logistic Regression experiment, model evaluation, and
ingredient similarity calculations.

The notebook generates the processed datasets used by the application.

### 4. Export the Application Data

Run:

```bash
python scripts/export_web.py
```

The script generates:

`mobile-web/data/skinmatch_mobile.json`

The exported JSON contains the product catalog, ingredient profiles,
consumer recommendation statistics, and precomputed ingredient
similarity results.

For GitHub Pages deployment, the contents of `mobile-web` are published
at the root of the application repository.

The original Kaggle CSV files are not included in this repository.

---

## 11. Limitations

SkinMatch has several important limitations:

- Consumer skin types are self-reported.
- The dataset contains historical Sephora information.
- Some products have limited review coverage.
- Ingredient concentrations are not available.
- Similar ingredient lists do not guarantee equivalent product effects.
- The supervised learning model showed limited predictive performance.
- Barcode scanning is not implemented in the current version.
- The application does not provide medical or dermatological advice.

---

## 12. Future Improvements

Potential future development includes:

- Verified barcode-to-product identification.
- A larger skincare product database.
- Improved ingredient normalization.
- More detailed ingredient information.
- Updated consumer review data.
- Further investigation of predictive models using additional features.

---

## 13. Academic Context

SkinMatch was developed as a final Data Science course project.

The project demonstrates the complete process of transforming raw
data into a practical application, including preprocessing,
feature engineering, supervised learning, model evaluation,
content-based recommendations, and mobile deployment.

The predictive research and ingredient similarity engine are
separate components with distinct purposes.

The application does not present experimental Machine Learning
predictions as validated skin compatibility assessments.

---

## Disclaimer

SkinMatch is an educational project and is not affiliated with Sephora.

Consumer recommendation statistics and ingredient similarities are
provided for informational purposes only.

The application does not replace professional dermatological advice.
