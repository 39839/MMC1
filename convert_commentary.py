"""
File Name: convert_commentary.py
Description: Converts text files of Torah commentary and keywords into a single, structured JSON file.
This version reads from multiple source files and includes ranges for all 5 books of the Torah.
"""

import re
import json
from collections import defaultdict
import sys

## --------------------- Configuration --------------------- ##

# --- Input/Output Files ---
# Reads all files in this list and combines them
INPUT_FILENAMES = ['Genesis.txt', 'Exodus.txt']
OUTPUT_FILENAME = 'data.json'

# --- Parsha Definitions ---
# Complete ranges for all 5 books, taken from js/config.js
PARSHA_RANGES = {
    # Bereshit (Genesis)
    "Bereshit": ("Genesis", 1, 1, 6, 8),
    "Noah": ("Genesis", 6, 9, 11, 32),
    "Lech Lecha": ("Genesis", 12, 1, 17, 27),
    "Vayera": ("Genesis", 18, 1, 22, 24),
    "Chayei Sara": ("Genesis", 23, 1, 25, 18),
    "Toldot": ("Genesis", 25, 19, 28, 9),
    "Vayetzei": ("Genesis", 28, 10, 32, 3),
    "Vayishlach": ("Genesis", 32, 4, 36, 43),
    "Vayeshev": ("Genesis", 37, 1, 40, 23),
    "Miketz": ("Genesis", 41, 1, 44, 17),
    "Vayigash": ("Genesis", 44, 18, 47, 27),
    "Vayechi": ("Genesis", 47, 28, 50, 26),

    # Shemot (Exodus)
    "Shemot": ("Exodus", 1, 1, 6, 1),
    "Vaera": ("Exodus", 6, 2, 9, 35),
    "Bo": ("Exodus", 10, 1, 13, 16),
    "Beshalach": ("Exodus", 13, 17, 17, 16),
    "Yitro": ("Exodus", 18, 1, 20, 23),
    "Mishpatim": ("Exodus", 21, 1, 24, 18),
    "Terumah": ("Exodus", 25, 1, 27, 19),
    "Tetzaveh": ("Exodus", 27, 20, 30, 10),
    "Ki Tisa": ("Exodus", 30, 11, 34, 35),
    "Vayakhel": ("Exodus", 35, 1, 38, 20),
    "Pekudei": ("Exodus", 38, 21, 40, 38),

    # Vayikra (Leviticus)
    "Vayikra": ("Leviticus", 1, 1, 5, 26),
    "Tzav": ("Leviticus", 6, 1, 8, 36),
    "Shmini": ("Leviticus", 9, 1, 11, 47),
    "Tazria": ("Leviticus", 12, 1, 13, 59),
    "Metzora": ("Leviticus", 14, 1, 15, 33),
    "Achrei Mot": ("Leviticus", 16, 1, 18, 30),
    "Kedoshim": ("Leviticus", 19, 1, 20, 27),
    "Emor": ("Leviticus", 21, 1, 24, 23),
    "Behar": ("Leviticus", 25, 1, 26, 2),
    "Bechukotai": ("Leviticus", 26, 3, 27, 34),

    # Bamidbar (Numbers)
    "Bamidbar": ("Numbers", 1, 1, 4, 20),
    "Nasso": ("Numbers", 4, 21, 7, 89),
    "Beha'alotcha": ("Numbers", 8, 1, 12, 16),
    "Sh'lach": ("Numbers", 13, 1, 15, 41),
    "Korach": ("Numbers", 16, 1, 18, 32),
    "Chukat": ("Numbers", 19, 1, 22, 1),
    "Balak": ("Numbers", 22, 2, 25, 9),
    "Pinchas": ("Numbers", 25, 10, 30, 1),
    "Matot": ("Numbers", 30, 2, 32, 42),
    "Masei": ("Numbers", 33, 1, 36, 13),

    # Devarim (Deuteronomy)
    "Devarim": ("Deuteronomy", 1, 1, 3, 22),
    "Vaetchanan": ("Deuteronomy", 3, 23, 7, 11),
    "Eikev": ("Deuteronomy", 7, 12, 11, 25),
    "Re'eh": ("Deuteronomy", 11, 26, 16, 17),
    "Shoftim": ("Deuteronomy", 16, 18, 21, 9),
    "Ki Teitzei": ("Deuteronomy", 21, 10, 25, 19),
    "Ki Tavo": ("Deuteronomy", 26, 1, 29, 8),
    "Nitzavim": ("Deuteronomy", 29, 9, 30, 20),
    "Vayeilech": ("Deuteronomy", 31, 1, 31, 30),
    "Ha'Azinu": ("Deuteronomy", 32, 1, 32, 52),
    "V'Zot HaBerachah": ("Deuteronomy", 33, 1, 34, 12)
}

## --------------------- Helper Functions --------------------- ##

def parse_verse_ref(ref_str):
    """Parses a single-verse reference string like 'Exodus 6:2'."""
    match = re.match(r"^\s*(\w+)\s+(\d+):(\d+)(?:\s*\([^)]+\))?\s*$", ref_str)
    if match:
        book, chapter, verse = match.groups()
        return book, int(chapter), int(verse)
    return None, None, None

def get_parsha_name(book, chapter, verse):
    """Determines the parsha name based on book, chapter, and verse."""
    for name, (p_book, sc, sv, ec, ev) in PARSHA_RANGES.items():
        if book == p_book:
            # Middle chapters
            if chapter > sc and chapter < ec:
                return name
            # First chapter
            if chapter == sc and verse >= sv:
                if sc == ec and verse <= ev:
                    return name
                if sc != ec:
                    return name
            # Last chapter
            if chapter == ec and verse <= ev:
                if sc != ec:
                    return name
    return "Unknown Parsha"

def get_parsha_reference_string(name):
    if name in PARSHA_RANGES:
        p_book, sc, sv, ec, ev = PARSHA_RANGES[name]
        return f"{p_book} {sc}:{sv}-{ec}:{ev}"
    return "Unknown Reference"

def split_entries(content):
    """Split content into individual entries.
    We start a new entry whenever we see a line that begins with
    a quoted verse like "Exodus 6:2" or "Genesis 1:1".
    """
    entries = []
    current = []
    for line in content.splitlines():
        if re.match(r'^\s*"[A-Z][a-zA-Z]+\s+\d+:\d+', line):
            # new entry starts
            if current:
                entries.append("\n".join(current))
            current = [line]
        else:
            if current:
                current.append(line)
    if current:
        entries.append("\n".join(current))
    return entries

def parse_entry(entry_text):
    """Parse a single entry to extract verse ref, type, and content."""
    s = entry_text.strip()
    # commentary
    m = re.match(r'^\s*"([^"]+)"\s*-\s*"source":\s*"([^"]+)"\s*-\s*"explanation":\s*"(.+)"$', s, re.DOTALL)
    if m:
        verse_ref, source, explanation = m.groups()
        explanation = re.sub(r'"\s*$', '', explanation.strip()).strip()
        return {
            'type': 'commentary',
            'verse_ref': verse_ref.strip(),
            'source': source.strip(),
            'content': explanation
        }
    # keyword
    m = re.match(r'^\s*"([^"]+)"\s*-\s*"keyword":\s*"([^"]+)"\s*-\s*"definition":\s*"(.+)"$', s, re.DOTALL)
    if m:
        verse_ref, word, definition = m.groups()
        definition = re.sub(r'"\s*$', '', definition.strip()).strip()
        return {
            'type': 'keyword',
            'verse_ref': verse_ref.strip(),
            'word': word.strip(),
            'content': definition
        }
    return None

## --------------------- Main Processing Logic --------------------- ##

def main():
    print("Starting conversion process...")

    parsed_data = defaultdict(lambda: defaultdict(lambda: {"commentary": [], "keywords": []}))
    total_entries_processed = 0
    total_entries_matched = 0
    unknown_parsha_verses = set()

    # Loop over all input files
    for filename in INPUT_FILENAMES:
        print(f"\nProcessing file: '{filename}'")
        try:
            with open(filename, 'r', encoding='utf-8') as infile:
                content = infile.read()
            print("  File read successfully. Splitting into entries...")
            entries = split_entries(content)
            print(f"  Found {len(entries)} potential entries in this file.")

            file_entries_processed = 0
            file_entries_matched = 0

            for entry_text in entries:
                if not entry_text.strip():
                    continue
                total_entries_processed += 1
                file_entries_processed += 1
                parsed = parse_entry(entry_text)
                if not parsed:
                    ref_match = re.match(r'^\s*"([^"]+)"', entry_text.strip())
                    if ref_match:
                        print(f"     Warning: Could not parse entry starting with: '{ref_match.group(1)}'")
                    else:
                        print(f"     Warning: Could not parse entry: {entry_text[:100]}...")
                    continue

                verse_ref = parsed['verse_ref']
                book, chapter, verse_num = parse_verse_ref(verse_ref)
                if not book:
                    print(f"     Warning: Could not parse verse reference: '{verse_ref}'")
                    print(f"     Full entry: {entry_text[:150]}...")
                    continue

                parsha = get_parsha_name(book, chapter, verse_num)
                if parsha == "Unknown Parsha":
                    unknown_parsha_verses.add(verse_ref)

                if parsed['type'] == 'commentary':
                    parsed_data[parsha][verse_ref]["commentary"].append({
                        "source": parsed['source'],
                        "explanation": parsed['content']
                    })
                    total_entries_matched += 1
                    file_entries_matched += 1
                elif parsed['type'] == 'keyword':
                    parsed_data[parsha][verse_ref]["keywords"].append({
                        "word": parsed['word'],
                        "definition": parsed['content']
                    })
                    total_entries_matched += 1
                    file_entries_matched += 1

            print(f"  Finished '{filename}': Processed {file_entries_processed}, Matched {file_entries_matched}.")

        except FileNotFoundError:
            print(f"  FATAL ERROR: Input file '{filename}' not found.")
            sys.exit(1)
        except Exception as e:
            print(f"  FATAL ERROR: An unexpected error occurred during parsing of '{filename}': {e}")
            import traceback
            traceback.print_exc()
            sys.exit(1)

    print("\n----------------------------------------")
    print("All files processed.")
    print(f"Total entries processed: {total_entries_processed}. Successfully matched: {total_entries_matched}.")

    if unknown_parsha_verses:
        print(f"   Warning: Could not assign {len(unknown_parsha_verses)} verse(s) to a known Parsha:")
        for verse in sorted(list(unknown_parsha_verses))[:10]:
            print(f"      - {verse}")
        if len(unknown_parsha_verses) > 10:
            print(f"      ... and {len(unknown_parsha_verses) - 10} more")

    # --- Load parsha-level significance if provided ---
    significance_map = {}
    try:
        with open('parsha_significance.json', 'r', encoding='utf-8') as sf:
            raw = json.load(sf)
            # Expect either {"significance": {"ParshaName": "..."}} or a direct mapping
            if isinstance(raw, dict):
                if 'significance' in raw and isinstance(raw['significance'], dict):
                    significance_map = raw['significance']
                else:
                    significance_map = raw
    except FileNotFoundError:
        pass
    except Exception as e:
        print('   Warning: Failed to read parsha_significance.json:', e)

    # --- Convert to final JSON format ---
    final_json_structure = {"parshas": []}

    parsha_order = list(PARSHA_RANGES.keys())

    print("\nStructuring JSON output...")
    found_valid_parsha = False

    for parsha_name in parsha_order:
        parsha_data = parsed_data.get(parsha_name, {})
        verse_refs_sorted = sorted(
            parsha_data.keys(),
            key=lambda ref: parse_verse_ref(ref)[1:3] if parse_verse_ref(ref)[0] else (999, 999)
        )

        verses = []
        for verse_ref_str in verse_refs_sorted:
            verse_data = parsha_data[verse_ref_str]
            verse_entry = {
                "ref": verse_ref_str,
                "commentary": verse_data["commentary"],
                "keywords": verse_data["keywords"]
            }
            if verse_entry["commentary"] or verse_entry["keywords"]:
                verses.append(verse_entry)

        parsha_entry = {
            "name": parsha_name,
            "reference": get_parsha_reference_string(parsha_name),
            "verses": verses
        }

        if parsha_name in significance_map and isinstance(significance_map[parsha_name], str):
            parsha_entry["significance"] = significance_map[parsha_name]

        if verses or parsha_entry.get("significance"):
            final_json_structure["parshas"].append(parsha_entry)
            found_valid_parsha = True
            verse_count = len(verses)
            commentary_count = sum(len(v['commentary']) for v in verses)
            keyword_count = sum(len(v['keywords']) for v in verses)
            print(f"   Processing Parsha: {parsha_name}")
            print(f"      → {verse_count} verses, {commentary_count} commentaries, {keyword_count} keywords")

    # Handle any parsed parshas not in PARSHA_RANGES
    extra_parshas = [p for p in parsed_data.keys() if p not in parsha_order and p != "Unknown Parsha"]
    for parsha_name in extra_parshas:
        print(f"   Warning: Parsed data for unknown parsha '{parsha_name}' will be skipped.")

    if not found_valid_parsha:
        print("\nFATAL ERROR: No valid Parshas processed. Check input file format.")
        sys.exit(1)

    # --- Write JSON output ---
    print(f"\nWriting structured data to '{OUTPUT_FILENAME}'...")
    try:
        with open(OUTPUT_FILENAME, 'w', encoding='utf-8') as outfile:
            json.dump(final_json_structure, outfile, indent=2, ensure_ascii=False)
        print(f"✅ Success! Converted {total_entries_matched} entries to '{OUTPUT_FILENAME}'")
        print(f"\nFinal Summary:")
        print(f"  - Parshas processed: {len(final_json_structure['parshas'])}")
        total_verses = sum(len(p['verses']) for p in final_json_structure['parshas'])
        total_commentary = sum(sum(len(v['commentary']) for v in p['verses']) for p in final_json_structure['parshas'])
        total_keywords = sum(sum(len(v['keywords']) for v in p['verses']) for p in final_json_structure['parshas'])
        print(f"  - Total verses with content: {total_verses}")
        print(f"  - Total commentaries: {total_commentary}")
        print(f"  - Total keywords: {total_keywords}")
    except Exception as e:
        print(f"FATAL ERROR: An error occurred while writing the JSON file: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == '__main__':
    main()
