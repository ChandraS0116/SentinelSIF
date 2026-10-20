"""
Capture high-resolution screenshots of the running SentinelSIF application.
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
    print("Navigating to http://localhost:3000...")
    driver.get("http://localhost:3000")
    time.sleep(2)

    # Inject authenticated officer profile into localStorage
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
    
    # Reload page with authenticated session
    driver.get("http://localhost:3000")
    time.sleep(4)

    # Let WebGL canvas render
    time.sleep(3)

    out_dir = r"D:\Engineering\Projects\SentinelSIF\YUKTI_Submission"
    os.makedirs(out_dir, exist_ok=True)

    # Shot 1: Default 3D Twin Simulation (Step 2)
    shot1 = os.path.join(out_dir, "shot1_digital_twin_3d.png")
    driver.save_screenshot(shot1)
    print("Saved Shot 1:", shot1)

    # Shot 2: Click "3. AI Output & SIF Gap"
    buttons = driver.find_elements(By.TAG_NAME, "button")
    for btn in buttons:
        if "3. AI Output" in btn.text:
            btn.click()
            break
    time.sleep(2)
    shot2 = os.path.join(out_dir, "shot2_sif_output_gap.png")
    driver.save_screenshot(shot2)
    print("Saved Shot 2:", shot2)

    # Shot 3: Navigate to Compliance Audit view
    for btn in buttons:
        if "DGMS Audit" in btn.text or "Dossier" in btn.text:
            btn.click()
            break
    time.sleep(2)
    shot3 = os.path.join(out_dir, "shot3_compliance_audit.png")
    driver.save_screenshot(shot3)
    print("Saved Shot 3:", shot3)

finally:
    driver.quit()
    print("Finished screenshot captures.")
