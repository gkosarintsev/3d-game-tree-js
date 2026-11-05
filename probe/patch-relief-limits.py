import io

# 1) config: два предела — авторский для холма, общий для поля
p = 'src/config.js'
s = open(p, encoding='utf-8', newline='').read()
old = "      maxSlope: 0,12,".replace(',', '.')
assert s.count('      maxSlope: 0.12,') == 1
new_crlf = True
block = (
    "      hillMaxSlope: 0.06,  // \u043c/\u043c: \u043f\u0440\u0435\u0434\u0435\u043b \u043a\u0440\u0443\u0442\u0438\u0437\u043d\u044b **\u043e\u0434\u043d\u043e\u0433\u043e** \u0445\u043e\u043b\u043c\u0430 \u0438\u0437 \u0431\u0440\u0438\u0444\u0430 "
    "(\u0430\u0432\u0442\u043e\u0440\u0441\u043a\u0430\u044f \u0444\u043e\u0440\u043c\u0430)\r\n"
    "                           // \u041f\u043e\u043b\u0435 \u043f\u043e\u0441\u043b\u0435 \u043f\u043b\u043e\u0449\u0430\u0434\u043e\u043a \u0434\u0435\u0440\u0436\u0438\u0442 maxSlope, \u0438 \u044d\u0442\u0438 \u0434\u0432\u0430 \u043f\u0440\u0435\u0434\u0435\u043b\u0430 \u0441\u0432\u044f\u0437\u0430\u043d\u044b: "
    "\u043f\u043b\u043e\u0449\u0430\u0434\u043a\u0430\r\n"
    "                           // \u043f\u043b\u043e\u0441\u043a\u0430\u044f, \u0430 \u043f\u0435\u0440\u0435\u0445\u043e\u0434 \u043a \u043d\u0435\u0439 \u2014 smoothstep \u0441 \u043f\u0440\u043e\u0438\u0437\u0432\u043e\u0434\u043d\u043e\u0439 1,5 / blend, "
    "\u043f\u043e\u044d\u0442\u043e\u043c\u0443\r\n"
    "                           // \u0441\u043e\u0431\u0441\u0442\u0432\u0435\u043d\u043d\u044b\u0439 \u0441\u043a\u043b\u043e\u043d \u0445\u043e\u043b\u043c\u0430 \u0434\u043e\u043b\u0436\u0435\u043d \u0431\u044b\u0442\u044c \u043c\u0435\u043d\u044c\u0448\u0435 maxSlope / 1,5 = 0,08, "
    "\u0438\u043d\u0430\u0447\u0435\r\n"
    "                           // \u0448\u0438\u0440\u0438\u043d\u0430 \u043f\u0435\u0440\u0435\u0445\u043e\u0434\u0430 \u043d\u0435 \u0441\u0445\u043e\u0434\u0438\u0442\u0441\u044f \u043d\u0438 \u043f\u0440\u0438 \u043a\u0430\u043a\u043e\u043c \u043a\u043e\u043b\u044c\u0446\u0435 (\u0437\u0430\u043c\u0435\u0440 \u2014 "
    "\u044d\u0442\u0430\u043f 2 \u0433\u043b\u0430\u0432\u044b 12)\r\n"
    "      maxSlope: 0.12,      // \u043c/\u043c: \u043f\u0440\u0435\u0434\u0435\u043b \u0433\u0440\u0430\u0434\u0438\u0435\u043d\u0442\u0430 \u041f\u041e\u041b\u042f \u2014 \u0441\u043a\u043b\u0430\u0434\u044b\u0432\u0430\u044e\u0449\u0438\u0445\u0441\u044f \u0445\u043e\u043b\u043c\u043e\u0432 \u0438 "
    "\u043f\u0435\u0440\u0435\u0445\u043e\u0434\u043e\u0432 \u043f\u043b\u043e\u0449\u0430\u0434\u043e\u043a.\r\n"
    "                           // \u041d\u0435 maxSlope \u0434\u043e\u0440\u043e\u0433\u0438: 0,3 \u043d\u043e\u0433\u0430 \u0434\u0435\u0440\u0436\u0438\u0442, \u043d\u043e \u0440\u0435\u0448\u0451\u0442\u043a\u0430 \u0443\u0437\u043b\u043e\u0432 6 \u043c \u043d\u0430 \u0442\u0430\u043a\u043e\u043c "
    "\u0441\u043a\u043b\u043e\u043d\u0435\r\n"
    "                           // \u0434\u0430\u0451\u0442 \u043f\u0435\u0440\u0435\u043f\u0430\u0434 1,8 \u043c \u0438 \u0442\u0440\u0435\u0431\u0443\u0435\u0442 \u0442\u0440\u0451\u0445\u043a\u0440\u0430\u0442\u043d\u043e\u0433\u043e \u043c\u0435\u043b\u044c\u0447\u0435\u043d\u0438\u044f\r\n"
)
old_line = "      maxSlope: 0.12,      // \u043c/\u043c: \u043f\u0440\u0435\u0434\u0435\u043b \u0433\u0440\u0430\u0434\u0438\u0435\u043d\u0442\u0430 \u041f\u041e\u0421\u041b\u0415 \u0440\u0435\u043b\u0430\u043a\u0441\u0430\u0446\u0438\u0438 \u043f\u0430\u0440\u0441\u0435\u0440\u043e\u043c. \u041d\u0435 maxSlope\r\n" \
           "                           // \u0434\u043e\u0440\u043e\u0433\u0438: 0,3 \u043d\u043e\u0433\u0430 \u0434\u0435\u0440\u0436\u0438\u0442, \u043d\u043e \u0440\u0435\u0448\u0451\u0442\u043a\u0430 \u0443\u0437\u043b\u043e\u0432 6 \u043c \u043d\u0430 \u0442\u0430\u043a\u043e\u043c \u0441\u043a\u043b\u043e\u043d\u0435\r\n" \
           "                           // \u0434\u0430\u0451\u0442 \u043f\u0435\u0440\u0435\u043f\u0430\u0434 1,8 \u043c \u0438 \u0442\u0440\u0435\u0431\u0443\u0435\u0442 \u0442\u0440\u0451\u0445\u043a\u0440\u0430\u0442\u043d\u043e\u0433\u043e \u043c\u0435\u043b\u044c\u0447\u0435\u043d\u0438\u044f\r\n"
assert s.count(old_line) == 1, 'config anchor not found'
s = s.replace(old_line, new_crlf)
open(p, 'w', encoding='utf-8', newline='').write(s)
print('config ok')

# 2) схема: предельная крутизна ОДНОЙ капсулы — hillMaxSlope, поля — maxSlope
p = 'tools/level-schema.mjs'
s = open(p, encoding='utf-8', newline='').read()
s = s.replace("  maxSlope: num({ min: 0.01, max: 0.3 }),",
              "  maxSlope: num({ min: 0.01, max: 0.3 }),\r\n  hillMaxSlope: num({ min: 0.01, max: 0.3 }),")
old = "    const maxSlope = r.maxSlope ?? J.relief.maxSlope;"
assert s.count(old) == 1
s = s.replace(old, "    const maxSlope = r.maxSlope ?? J.relief.maxSlope;\r\n"
                   "    const hillMax = r.hillMaxSlope ?? J.relief.hillMaxSlope;")
old = "      const peak = 1.5 * Math.abs(h.height) / h.radius;\r\n      if (peak > maxSlope + 1e-9) {"
assert s.count(old) == 1
s = s.replace(old, "      const peak = 1.5 * Math.abs(h.height) / h.radius;\r\n      if (peak > hillMax + 1e-9) {")
old = "          + `круче предела рельефа — максимум ${peak.toFixed(3)} м/м (1,5 · ${Math.abs(h.height)} / ${h.radius}) `;"
if s.count(old) != 1:
    old = "          + `при допустимых ${maxSlope}; радиус обязан быть не меньше ${(1.5 * Math.abs(h.height) / maxSlope).toFixed(0)} м ` "
assert s.count(old) == 1, 'peak message anchor'
s = s.replace(old, old.replace('maxSlope)', 'hillMax)'))
open(p, 'w', encoding='utf-8', newline='').write(s)
print('schema ok')
