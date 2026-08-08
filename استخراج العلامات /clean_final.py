import json
import openpyxl
import csv

def main():
    json_path = '/Users/abdulrhman/Documents/استخراج العلامات /signlist.json'
    with open(json_path, 'r', encoding='utf-8') as f:
        signlist = json.load(f)

    for k, v in list(signlist.items()):
        cleaned = []
        for item in v:
            if '<ctrl' in str(item):
                cleaned.append('𒀪')
            else:
                cleaned.append(item)
        signlist[k] = cleaned

    signlist['aḫ₄'] = ['𒀪']
    signlist['aḫ4'] = ['𒀪']
    signlist['ah4'] = ['𒀪']
    signlist['aḫ'] = ['
