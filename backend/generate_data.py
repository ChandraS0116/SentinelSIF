import json
import random
import uuid
from datetime import datetime, timedelta

def generate_timestamp(start_date, end_date):
    time_between_dates = end_date - start_date
    days_between_dates = time_between_dates.days
    random_number_of_days = random.randrange(days_between_dates)
    random_time = random.randrange(24 * 60 * 60)
    return start_date + timedelta(days=random_number_of_days, seconds=random_time)

def generate_sif_discordance_cases(num_cases):
    """
    Generates rare edge cases: High Potential SIF, Low Actual Severity.
    These are the 'hidden SIF precursors'.
    """
    cases = []
    locations = ["Refinery Unit A", "Site B - Drilling", "Pipeline Sector 4", "Storage Tank Farm"]
    activities = ["Maintenance", "Inspection", "Confined Space Entry", "Lifting Operation"]
    
    narratives = [
        "During maintenance on pump P-102, a technician entered the immediate vicinity. No injury occurred. The equipment was not fully isolated (LOTO failed) and the rotating coupling guard had been removed.",
        "A scaffold tube fell from the 3rd tier of the structure, landing 2 meters away from a passing operator. No injury. The exclusion zone barrier was missing.",
        "While inspecting the high-pressure line, a minor flange leak was noticed. The technician tightened it. Later investigation revealed the line was fully pressurized at 3000 PSI and not safely depressurized prior to the work.",
        "A forklift reversed in the warehouse. An employee walking behind it had to jump out of the way. No physical contact occurred, but there was no spotter and the reverse alarm was malfunctioning."
    ]
    
    for _ in range(num_cases):
        cases.append({
            "incident_id": f"SIF-SYNC-{uuid.uuid4().hex[:8].upper()}",
            "timestamp": generate_timestamp(datetime(2025, 1, 1), datetime(2026, 9, 1)).isoformat(),
            "location": random.choice(locations),
            "activity": random.choice(activities),
            "equipment": "Various",
            "narrative": random.choice(narratives),
            "incident_type": "Near Miss",
            "source": "Synthetic Augmentation"
        })
    return cases

def generate_routine_cases(num_cases):
    """
    Generates standard low severity, low potential incidents.
    """
    cases = []
    locations = ["Admin Building", "Refinery Unit B", "Site A - Wellpad"]
    narratives = [
        "Employee tripped over an uneven mat in the hallway. Minor scrape on knee. First aid provided.",
        "Small hydraulic oil drip observed from a parked vehicle. Spill cleaned up immediately.",
        "Worker pinched finger in the door of the site office. No treatment required.",
        "A lightbulb shattered while being replaced. The area was swept clean. Worker wore PPE (gloves and safety glasses)."
    ]
    
    for _ in range(num_cases):
        cases.append({
            "incident_id": f"ROUTINE-{uuid.uuid4().hex[:8].upper()}",
            "timestamp": generate_timestamp(datetime(2025, 1, 1), datetime(2026, 9, 1)).isoformat(),
            "location": random.choice(locations),
            "activity": "Routine tasks",
            "equipment": "General",
            "narrative": random.choice(narratives),
            "incident_type": "Minor Incident",
            "source": "Public OSHA Equivalent (Simulated)"
        })
    return cases

def split_and_save_data(cases):
    # Sort by timestamp to simulate time-based split
    cases.sort(key=lambda x: x['timestamp'])
    
    split_index = int(len(cases) * 0.8) # 80% train, 20% test
    
    train_data = cases[:split_index]
    test_data = cases[split_index:]
    
    with open("data_train.json", "w") as f:
        json.dump(train_data, f, indent=4)
        
    with open("data_test.json", "w") as f:
        json.dump(test_data, f, indent=4)
        
    print(f"Generated {len(train_data)} training records and {len(test_data)} test records.")

if __name__ == "__main__":
    routine = generate_routine_cases(150)
    sif_cases = generate_sif_discordance_cases(50)
    
    all_cases = routine + sif_cases
    split_and_save_data(all_cases)
