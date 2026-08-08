import json
import csv
import re

# Mapping for subscript digits to regular digits
SUB_TO_NORMAL = {
    '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4',
    '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9'
}

VOWEL_ACCENTS = {
    'á': ('a', '2'), 'à': ('a', '3'),
    'é': ('e', '2'), 'è': ('e', '3'),
    'í': ('i', '2'), 'ì': ('i', '3'),
    'ú': ('u', '2'), 'ù': ('u', '3'),
    'Á': ('a', '2'), 'À': ('a', '3'),
    'É': ('e', '2'), 'È': ('e', '3'),
    'Í': ('i', '2'), 'Ì': ('i', '3'),
    'Ú': ('u', '2'), 'Ù': ('u', '3')
}

MACRON_MAP = {'ā':'a', 'ē':'e', 'ī':'i', 'ū':'u', 'Ā':'A', 'Ē':'E', 'Ī':'I', 'Ū':'U'}

def normalize_word(word):
    w = word.strip().rstrip('?')
    for m_from, m_to in MACRON_MAP.items():
        w = w.replace(m_from, m_to)
    for sub, normal in SUB_TO_NORMAL.items():
        w = w.replace(sub, normal)
    
    num = None
    res = []
    for c in w:
        if c in VOWEL_ACCENTS:
            v, n = VOWEL_ACCENTS[c]
            res.append(v)
            num = n
        else:
            res.append(c)
    clean = ''.join(res)
    if num and not clean[-1].isdigit():
        clean += num
    return clean

def main():
    # Load dictionary
    with open('signlist.json', 'r', encoding='utf-8') as f:
        signlist = json.load(f)
        
    # Read words list
    with open('words_list.txt', 'r', encoding='utf-8') as f:
        words = [line.strip() for line in f if line.strip()]
        
    results = []
    
    for original_word in words:
        norm = normalize_word(original_word)
        
        # Match using original or normalized key
        signs = signlist.get(original_word) or signlist.get(norm)
        
        if not signs:
            # Try splitting comma or slash separated items
            parts = [p.strip() for p in re.split(r'[,/]', original_word) if p.strip()]
            for p in parts:
                p_norm = normalize_word(p)
                if p in signlist:
                    signs = signlist[p]
                    break
                elif p_norm in signlist:
                    signs = signlist[p_norm]
                    break

        if signs:
            cuneiform = " / ".join(signs)
        else:
            cuneiform = ""
            
        results.append([original_word, cuneiform])
        
    # Write to CSV
    with open('extracted_signs.csv', 'w', encoding='utf-8', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['Word', 'Cuneiform'])
        writer.writerows(results)
    
    print("Done! Extracted signs saved to extracted_signs.csv")

if __name__ == "__main__":
    main()

