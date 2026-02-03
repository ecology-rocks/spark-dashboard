export function formatCitation(data: any): string {
  // 1. Authors / Creators
  let authors = 'Unknown'
  if (data.creators && data.creators.length > 0) {
    // Prioritize authors, then editors, then anyone else
    const primaryCreators = data.creators.filter((c: any) =>
      ['author', 'presenter', 'interviewee'].includes(c.creatorType),
    )
    const effectiveList = primaryCreators.length > 0 ? primaryCreators : data.creators

    if (effectiveList.length === 1) {
      authors = effectiveList[0].lastName || effectiveList[0].name
    } else if (effectiveList.length === 2) {
      const a1 = effectiveList[0].lastName || effectiveList[0].name
      const a2 = effectiveList[1].lastName || effectiveList[1].name
      authors = `${a1} & ${a2}`
    } else {
      const first = effectiveList[0].lastName || effectiveList[0].name
      authors = `${first} et al.`
    }
  }

  // 2. Year (Regex to grab the first 4-digit year found in the date string)
  let year = 'n.d.'
  if (data.date) {
    const match = data.date.match(/\d{4}/)
    if (match) year = match[0]
  }

  // 3. Venue / Container
  let venue = ''
  if (data.publicationTitle) {
    venue = ` in ${data.publicationTitle}`
  } else if (data.university) {
    venue = ` (Thesis, ${data.university})`
  } else if (data.proceedingsTitle) {
    venue = ` in ${data.proceedingsTitle}`
  } else if (data.websiteTitle) {
    venue = ` via ${data.websiteTitle}`
  }

  return `${authors} (${year})${venue}`
}
