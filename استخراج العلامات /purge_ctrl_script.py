import json
import openpyxl
import csv

# 1. Load signlist.json
json_path = '/Users/abdulrhman/Documents/استخراج العلامات /signlist.json'
with open(json_path, 'r', encoding='utf-8') as f:
    signlist = json.load(f)

# Replace all <ctrl...> occurrences in signlist with real glyphs or '𒀪'
for k, v in list(signlist.items()):
    new_v = []
    for item in v:
        if '<ctrl' in str(item):
            new_v.append('𒀪')
        else:
            new_v.append(item)
    signlist[k] = new_v

# Ensure explicit mappings for aḫ₄, aḫ4, ah4, aḫ, ah
signlist['aḫ₄'] = ['𒀪']
signlist['aḫ4'] = ['𒀪']
signlist['ah4'] = ['𒀪']
signlist['aḫ'] = ['
