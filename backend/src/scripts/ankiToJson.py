import json

input_file = "input.txt"
output_file = "output.json"

# 🌍 Prompt user for languages
base_language = input("Enter base language (ISO, e.g. en): ").strip().lower()
target_language = input("Enter target language (ISO, e.g. de): ").strip().lower()

POS_TAGS = {"adj", "adv", "verb", "noun", "prep", "conj", "pron", "art", "aux"}
ARTICLES = {"der", "die", "das"}

results = []

def normalize_verb(translations):
    """Ensure English verbs start with 'to '"""
    normalized = []
    for t in translations:
        t = t.strip()
        if base_language == "en":
            if not t.lower().startswith("to "):
                t = "to " + t
        normalized.append(t)
    return normalized

def is_example(text):
    """Detect if a string is an example sentence"""
    return text.strip().endswith(('.', '!', '?'))

with open(input_file, "r", encoding="utf-8") as infile:
    for line in infile:
        cols = [c.strip() for c in line.strip().split("\t") if c.strip()]
        if len(cols) < 5:
            continue

        entry = {
            "id": cols[0],
            "target_word": cols[1],
            "base_language": base_language,
            "target_language": target_language,
            "meanings": []
        }

        i = 3
        while i < len(cols):
            col = cols[i]

            # --- CASE 1: Standard POS ---
            if col in POS_TAGS:
                if i + 3 >= len(cols):
                    break

                pos = col
                meaning = cols[i + 1].strip()
                example_de = cols[i + 2].strip()
                example_en = cols[i + 3].strip()

                # Skip if meaning is empty or looks like an example
                if not meaning or is_example(meaning):
                    i += 4
                    continue

                translations = [m.strip() for m in meaning.split(",") if m.strip()]
                if pos == "verb":
                    translations = normalize_verb(translations)

                # Skip entire block if no translations
                if translations:
                    examples = []
                    if example_de and example_en:
                        examples.append({"target": example_de, "base": example_en})
                    entry["meanings"].append({
                        "part_of_speech": pos,
                        "translations": translations,
                        "examples": examples
                    })

                i += 4

            # --- CASE 2: Noun via article ---
            elif col in ARTICLES:
                if i + 3 >= len(cols):
                    break

                meaning = cols[i + 1].strip()
                example_de = cols[i + 2].strip()
                example_en = cols[i + 3].strip()

                # Skip if meaning is empty or looks like an example
                if not meaning or is_example(meaning):
                    i += 4
                    continue

                translations = [m.strip() for m in meaning.split(",") if m.strip()]
                if translations:
                    examples = []
                    if example_de and example_en:
                        examples.append({"target": example_de, "base": example_en})
                    entry["meanings"].append({
                        "part_of_speech": "noun",
                        "translations": translations,
                        "examples": examples
                    })

                i += 4

            else:
                i += 1

        if entry["meanings"]:
            results.append(entry)

with open(output_file, "w", encoding="utf-8") as f:
    json.dump(results, f, ensure_ascii=False, indent=2)

print(f"Done! JSON created for {base_language} → {target_language}")