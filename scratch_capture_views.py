"""
Capture Incident Lab, Synthesized Compliance Audit, and Dark/Petroleum theme variations.
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

    # 1. Capture Incident Lab View
    buttons = driver.find_elements(By.TAG_NAME, "button")
    for btn in buttons:
        if "Incident Lab" in btn.text:
            btn.click()
            break
    time.sleep(2)
    driver.save_screenshot(os.path.join(out_dir, "view_incident_lab.png"))
    print("Saved view_incident_lab.png")

    # 2. Capture Synthesized Dossier View
    buttons = driver.find_elements(By.TAG_NAME, "button")
    for btn in buttons:
        if "Executive Dossier" in btn.text or "DGMS Audit" in btn.text:
            btn.click()
            break
    time.sleep(2)
    
    # Click synthesize button
    buttons = driver.find_elements(By.TAG_NAME, "button")
    for btn in buttons:
        if "SYNTHESIZE" in btn.text:
            btn.click()
            break
    time.sleep(3)
    driver.save_screenshot(os.path.join(out_dir, "view_synthesized_dossier.png"))
    print("Saved view_synthesized_dossier.png")

    # 3. Cycle theme to dark/petroleum
    theme_btn = None
    buttons = driver.find_elements(By.TAG_NAME, "button")
    for btn in buttons:
        if "Titanium" in btn.text or "Theme" in btn.text:
            theme_btn = btn
            break
    if theme_btn:
        theme_btn.click() # switches to petroleum or dark
        time.sleep(1)

    # Go back to 3D Twin -> Step 3
    buttons = driver.find_elements(By.TAG_NAME, "button")
    for btn in buttons:
        if "3D Twin" in btn.text:
            btn.click()
            break
    time.sleep(2)

    buttons = driver.find_elements(By.TAG_NAME, "button")
    for btn in buttons:
        if "3. AI Output" in btn.text:
            btn.click()
            break
    time.sleep(2)
    driver.save_screenshot(os.path.join(out_dir, "view_sif_output_themed.png"))
    print("Saved view_sif_output_themed.png")

finally:
    driver.quit()
    print("Captures complete.")
