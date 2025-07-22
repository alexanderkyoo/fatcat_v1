from playwright.sync_api import sync_playwright
from bs4 import BeautifulSoup
import re

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto("https://www.chilis.com/menu", wait_until="domcontentloaded")
    html = page.content()
    browser.close()

soup = BeautifulSoup(html, "html.parser")
items = []

# Grab all menu item blocks
product_cards = soup.find_all("div", attrs={
    "data-testid": re.compile(r"^mobile-product-card(?!.*-name$)")
})

for card in product_cards:
    data_testid = card.get("data-testid", "")
    prefix = "mobile-product-card"
    if data_testid.startswith(prefix):
        raw = data_testid[len(prefix):]
        first_hyphen_idx = raw.find("-")
        if first_hyphen_idx != -1:
            category = raw[:first_hyphen_idx].strip()
            item = raw[first_hyphen_idx+1:].strip()
            print(f"{category} → {item}")


# Print results
for item in items:
    print(f"{item['category']} → {item['name']}")
