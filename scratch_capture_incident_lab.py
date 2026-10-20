"""
Capture Incident Lab after running full 5-stage investigation.
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

    # Click Incident Lab
    buttons = driver.find_elements(By.TAG_NAME, "button")
    for btn in buttons:
        if "Incident Lab" in btn.text:
            btn.click()
            break
    time.sleep(2)

    # Click Run Statutory Safety Investigation
    buttons = driver.find_elements(By.TAG_NAME, "button")
    for btn in buttons:
        if "Run Statutory Safety Investigation" in btn.text:
            btn.click()
            break
    
    # Wait for all 5 stages to complete (5 * 550ms = ~3s)
    time.sleep(4.5)

    shot = os.path.join(out_dir, "view_incident_lab_analyzed.png")
    driver.save_screenshot(shot)
    print("Saved:", shot)

finally:
    driver.quit()
    print("Incident lab run capture complete.")
