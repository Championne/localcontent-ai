def suggest_keywords(service_type: str, location: str) -> list[str]:
    """
    Generates dummy keyword suggestions based on service type and location.
    This is a prototype and would be replaced by actual API calls or more sophisticated logic.
    """
    base_keywords = [
        f"{service_type} {location}",
        f"{service_type} services {location}",
        f"{service_type} {location} prijzen",
        f"{service_type} {location} kosten",
        f"{service_type} specialist {location}",
    ]

    # Add specific modifiers based on service type examples
    if service_type.lower() == "landscapers":
        base_keywords.extend([
            f"tuinaanleg {location}",
            f"tuinonderhoud {location}",
            f"tuinontwerp {location}",
            f"bestrating {location}"
        ])
    elif service_type.lower() == "roofers":
        base_keywords.extend([
            f"dakreparatie {location}",
            f"dakschade {location}",
            f"nieuw dak {location}",
            f"nokvorsten vervangen {location}"
        ])
    # Add more service-specific keywords here as needed

    # General modifiers
    general_modifiers = [
        "near me",
        "in de buurt",
        "offerte",
        "top 10",
        "bedrijf",
    ]

    # Combine base keywords with general modifiers (simple example)
    final_keywords = []
    for base in base_keywords:
        final_keywords.append(base)
        for modifier in general_modifiers:
            if modifier not in base: # Avoid redundancy
                final_keywords.append(f"{base} {modifier}")
    
    # Ensure uniqueness and return
    return sorted(list(set(final_keywords)))

if __name__ == "__main__":
    print("--- Landscapers in Utrecht ---")
    print(suggest_keywords("Landscapers", "Utrecht"))
    print("\n--- Roofers in Amsterdam ---")
    print(suggest_keywords("Roofers", "Amsterdam"))
