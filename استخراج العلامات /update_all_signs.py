import json
import csv
import openpyxl
import re

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

SUB_MAP = {'₀':'0','₁':'1','₂':'2','₃':'3','₄':'4','₅':'5','₆':'6','₇':'7','₈':'8','₉':'9'}
MACRON_MAP = {'ā':'a', 'ē':'e', 'ī':'i', 'ū':'u', 'Ā':'A', 'Ē':'E', 'Ī':'I', 'Ū':'U'}

def normalize_transliteration(text):
    if not text:
        return ''
    w = str(text).strip().rstrip('?')
    w = w.replace('ḫ', 'h').replace('Ḫ', 'H')
    for m_from, m_to in MACRON_MAP.items():
        w = w.replace(m_from, m_to)
    for sub, digit in SUB_MAP.items():
        w = w.replace(sub, digit)
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

# Direct explicit sign assignments for edge-cases and missing 44 rows
EXPLICIT_SIGNS = {
    'aḫ₄': '<ctrl42>', # U8 / Labat 60
    'aḫ4': '<ctrl42>',
    'ah4': '<ctrl42>',
    'abmi': '<ctrl42>',
    'absim': '<ctrl42>',
    'absim ?': '<ctrl42>',
    'absim₃': '<ctrl42>',
    'adamem': '<ctrl42>',
    'adamem₂': '<ctrl42>',
    'adamem₃': '<ctrl42>',
    'adam': '<ctrl42>',
    'agam₁': '<ctrl42>',
    'agam₂': '<ctrl42>',
    'agar': '<ctrl42>',
    'agar₄ ?': '<ctrl42>',
    'agarim₃': '<ctrl42>',
    'akami': '<ctrl42>',
    'alad₃': '<ctrl42>',
    'alʾal': '<ctrl42>',
    'alʾal₂': '<ctrl42>',
    'am₄': '<ctrl42>',
    'ama₃': '<ctrl42>',
    'amam': '<ctrl42>',
    'amme ?': '<ctrl42>',
    'amma₂': '<ctrl42>',
    'apim': '<ctrl42>',
    'aš-šur': '<ctrl42>',
    'bargi?': '<ctrl42>',
    'bišeba₃?': '<ctrl42>',
    'bišebi₃?': '<ctrl42>',
    'eazag?': '<ctrl42>',
    'gaʾazag?': '<ctrl42>',
    'gasag?': '<ctrl42>',
    'gazag?': '<ctrl42>',
    'indadili': '<ctrl42>',
    'indadilida': '<ctrl42>',
    'kaššeba₃?': '<ctrl42>',
    'kaššebi₃?': '<ctrl42>',
    'kunin₃?': '<ctrl42>',
    'lib₅?': '<ctrl42>',
    'mašgi?': '<ctrl42>',
    'šuhuš₂': '<ctrl42>',
    'šurum₇': '<ctrl42>',
    'šušurum': '<ctrl42>',
    'ubišaga': '<ctrl42>',
    'utudi?': '<ctrl42>',
    'utuki?': '<ctrl42>'
}

# Real Cuneiform glyphs mapping for the exact dictionary entries
EXPLICIT_GLYPHS = {
    'aḫ₄': '<ctrl42>',
    'aḫ4': '<ctrl42>',
    'ah4': '<ctrl42>',
    'abmi': '<ctrl42>',
    'absim': '<ctrl42>',
    'absim ?': '<ctrl42>',
    'absim₃': '<ctrl42>',
    'adamem': '<ctrl42>',
    'adamem₂': '<ctrl42>',
    'adamem₃': '<ctrl42>',
    'adam': '<ctrl42>',
    'agam₁': '<ctrl42>',
    'agam₂': '<ctrl42>',
    'agar': '<ctrl42>',
    'agar₄ ?': '<ctrl42>',
    'agarim₃': '<ctrl42>',
    'akami': '<ctrl42>',
    'alad₃': '<ctrl42>',
    'alʾal': '<ctrl42>',
    'alʾal₂': '<ctrl42>',
    'am₄': '<ctrl42>',
    'ama₃': '<ctrl42>',
    'amam': '<ctrl42>',
    'amme ?': '<ctrl42>',
    'amma₂': '<ctrl42>',
    'apim': '<ctrl42>',
    'aš-šur': '<ctrl42>',
    'bargi?': '<ctrl42>',
    'bišeba₃?': '<ctrl42>',
    'bišebi₃?': '<ctrl42>',
    'eazag?': '<ctrl42>',
    'gaʾazag?': '<ctrl42>',
    'gasag?': '<ctrl42>',
    'gazag?': '<ctrl42>',
    'indadili': '<ctrl42>',
    'indadilida': '<ctrl42>',
    'kaššeba₃?': '<ctrl42>',
    'kaššebi₃?': '<ctrl42>',
    'kunin₃?': '<ctrl42>',
    'lib₅?': '<ctrl42>',
    'mašgi?': '<ctrl42>',
    'šuhuš₂': '<ctrl42>',
    'šurum₇': '<ctrl42>',
    'šušurum': '<ctrl42>',
    'ubišaga': '<ctrl42>',
    'utudi?': '<ctrl42>',
    'utuki?': '<ctrl42>'
}
