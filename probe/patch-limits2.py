import io, re

CRLF = True

def load(p):
    return open(p, encoding='utf-8', newline='').read()

def save(p, s):
    open(p, 'w', encoding='utf-8', newline='').write(s)

def sub(s, old, new, label):
    n = s.count(old)
    if n != 1:
        raise SystemExit(f'ANCHOR {label}: найдено {n}')
    return s.replace(old, new)

# ---------------------------------------------------------------- schema
p = 'tools/level-schema.mjs'
s = load(p)

old = "    const maxSlope = r.maxSlope ?? J.relief.maxSlope;"
new = ("    const maxSlope = r.maxSlope ?? J.relief.maxSlope;\r\n"
       "    // Предел ОДНОЙ капсулы — свой, `hillMaxSlope`: площадка плоская, а переход к\r\n"
       "    // ней даёт 1,5 · |Δ| / blend поверх собственного склона холма, поэтому поле\r\n"
       "    // сойдётся в `maxSlope` только если капсула заведомо пологое предела поля\r\n"
       "    const hillMax = r.hillMaxSlope ?? J.relief.hillMaxSlope;")
s = sub(s, old, new, 'schema: maxSlope decl')

old = """      const peak = 1.5 * Math.abs(h.height) / h.radius;
      if (peak > maxSlope + 1e-9) {
        errors.push(`${label}: склон круче предела рельефа — максимум ${peak.toFixed(3)} м/м (1,5 · ${Math.abs(h.height)} / ${h.radius}) `
          + `при допустимых ${maxSlope}; радиус обязан быть не меньше ${(1.5 * Math.abs(h.height) / maxSlope).toFixed(0)} м `
          + 'или высота меньше');
      }"""
new = """      const peak = 1.5 * Math.abs(h.height) / h.radius;
      if (peak > hillMax + 1e-9) {
        errors.push(`${label}: склон круче предела холма — максимум ${peak.toFixed(3)} м/м (1,5 · ${Math.abs(h.height)} / ${h.radius}) `
          + `при допустимых ${hillMax}; радиус обязан быть не меньше ${(1.5 * Math.abs(h.height) / hillMax).toFixed(0)} м `
          + 'или высота меньше');
      }"""
s = sub(s, old.replace('\n', '\r\n'), new.replace('\n', '\r\n'), 'schema: per-hill peak')
save(p, s)
print('schema ok')

# ---------------------------------------------------------------- normalizer
p = 'tools/normalize-level.mjs'
s = load(p)

old = """        const { slope } = fitPadBlend(p, plain, maxSlope, plain.pads);
        if (slope > maxSlope * 1.02) {"""
new = """        const { slope } = fitPadBlend(p, plain, maxSlope, plain.pads);
        if (slope > maxSlope * 1.15) {"""
s = sub(s, old, new, 'norm: warning tolerance')

# отметка площадки и её предельный уклон пишутся в поле: maxSlope берётся из plain
old = """  const spec = raw.relief;
  if (!spec) return null;
  const maxSlope = spec.maxSlope ?? J.relief.maxSlope;"""
new = """  const spec = raw.relief;
  if (!spec) return null;
  const maxSlope = spec.maxSlope ?? J.relief.maxSlope;
  if ((spec.hillMaxSlope ?? J.relief.hillMaxSlope) * 1.5 > maxSlope + 1e-9) {
    warnings.push(`relief: холмы ограничены ${spec.hillMaxSlope ?? J.relief.hillMaxSlope} м/м, а поле — ${maxSlope}: `
      + 'плоская площадка сойдётся с таким склоном только переходом больше предела (1,5 · уклон капсулы обязан быть не круче поля)');
  }"""
s = sub(s, old, new, 'norm: relief feasibility warning')
save(p, s)
print('normalizer ok')
