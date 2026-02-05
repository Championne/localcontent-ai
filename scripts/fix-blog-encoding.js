const fs = require('fs')
const path = require('path')

const BLOG_DIR = path.join(process.cwd(), 'content/blog')

// Encoding replacements
const replacements = [
  ['ΓÇÖ', "'"],      // Smart apostrophe
  ['ΓÇ£', '"'],      // Smart quote open
  ['ΓÇ¥', '"'],      // Smart quote close
  ['ΓÇô', '–'],      // En dash
  ['ΓÇö', '—'],      // Em dash
  ['ΓÇª', '...'],    // Ellipsis
  ['â€™', "'"],      // Another apostrophe encoding
  ['â€œ', '"'],      // Another quote encoding
  ['â€', '"'],       // Another quote encoding
  ['â€"', '–'],      // Another dash encoding
  ['â€"', '—'],      // Another dash encoding
]

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8')
  let changed = false

  for (const [find, replace] of replacements) {
    if (content.includes(find)) {
      content = content.split(find).join(replace)
      changed = true
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8')
    return true
  }
  return false
}

function main() {
  const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.md'))
  let fixed = 0

  for (const file of files) {
    const filePath = path.join(BLOG_DIR, file)
    if (fixFile(filePath)) {
      console.log(`Fixed: ${file}`)
      fixed++
    }
  }

  console.log(`\nTotal files fixed: ${fixed}`)
}

main()
