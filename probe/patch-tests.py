import io

p = 'tools/level-parser.test.mjs'
s = open(p, encoding='utf-8', newline='').read()
start = s.index('// ------------------------------------------------- рельеф главы (v2, этап 2)')
end = s.index('// ---------------------------------------------------------------- служебное')
new = open('probe/relief-section.txt', encoding='utf-8').read()
s = s[:start] + new + s[end:]
s = s.replace("import { frameOf, frameAt,", "import { r3, frameOf, frameAt,")
open(p, 'w', encoding='utf-8', newline='').write(s)
print('ok')
