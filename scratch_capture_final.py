"""
Capture optimal, high-resolution YUKTI submission screenshots with crisp framing.
"""
import time
import json
import os
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By

opt = Options()
opt.add_argument("--headless=new")
opt.add_argument("--window-size=1920,1080")
opt.add_argument("--device-scale-factor=1.25") # High-DPI crisp rendering
opt.add_argument("--disable-gpu")
opt.add_argument("--no-sandbox")
opt.add_argument("--disable-dev-shm-usage")
opt.add_argument("--hide-scrollbars")

driver = webdriver.Chrome(options=opt)

try:
    driver.get("http://localhost:3000")
    time.sleep(2)

    session = {
        "name": "Concerned Safety Official",
        "badge_id": "OIL-CSO-8042",
        "position": "Chief Safety Officer",
        "position_code": "CHIEF_SAFETY_OFFICER",
        "clearance_level": "DGMS Level-4 (Installation Safety Controller)",
        "organization": "Oil India Limited — E&P HSE Directorate",
        "jurisdiction": "All Refineries & Exploration Assets",
        "session_expiry": "8 Hours (Shift Alpha)"
    }
    driver.execute_script(f"localStorage.setItem('sentinelsif_officer_session', '{json.dumps(session)}');")
    driver.get("http://localhost:3000")
    time.sleep(4)

    out_dir = r"D:\Engineering\Projects\SentinelSIF\YUKTI_Submission"
    os.makedirs(out_dir, exist_ok=True)

    # Click "3. AI Output & SIF Gap"
    buttons = driver.find_elements(By.TAG_NAME, "button")
    for btn in buttons:
        if "3. AI Output" in btn.text:
            btn.click()
            break
    time.sleep(2)

    # Capture Master Screenshot 1: High-DPI AI Output & SIF Discordance Dashboard
    master_path = os.path.join(out_dir, "SentinelSIF_YUKTI_Dashboard.png")
    driver.save_screenshot(master_path)
    print("Saved Master Dashboard:", master_path)

    # Let's also capture 3D Twin with active shockwave at Stage 2 (Packing Gland Weep)
    for btn in buttons:
        if "2. 3D Model" in btn.text:
            btn.click()
            break
    time.sleep(3)
    
    twin_path = os.path.join(out_dir, "SentinelSIF_3D_DigitalTwin.png")
    driver.save_screenshot(twin_path)
    print("Saved 3D Twin:", twin_path)

finally:
    driver.quit()
    print("Captures complete.")
