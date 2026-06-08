with open("index.html", "r", encoding="utf-8") as f:
    lines = f.readlines()

# Verify exact lines to delete (indices 1407 to 1603 in python)
print("Index 1407 (Line 1408):", repr(lines[1407]))
print("Index 1602 (Line 1603):", repr(lines[1602]))
print("Index 1603 (Line 1604):", repr(lines[1603]))

# Let's perform the delete and write
del lines[1407:1603]

with open("index.html", "w", encoding="utf-8") as f:
    f.writelines(lines)

print("Restore complete! Duplicate block deleted.")
