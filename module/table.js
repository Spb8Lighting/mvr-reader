import { tableSettings } from '../config/table.js'

export const createLine = (tr, value, heading = false) => {
  const td = document.createElement(heading ? 'th' : 'td')
  td.innerHTML = value.trim()
  tr.append(td)
}

export const createTable = (tbody, id, layer = false) => {
  const table = document.createElement('table')
  table.classList.add('w3-table', 'w3-hoverable', 'w3-tiny')
  table.id = id

  const thead = document.createElement('thead')

  const tr = document.createElement('tr')

  let headings = false
  if (layer) {
    headings = tableSettings.fixture.withLayer.headings
  } else {
    headings = tableSettings.fixture.withoutLayer.headings
    const layerTDs = tbody.querySelectorAll('tr>td:first-child')
    layerTDs.forEach(layerTD => layerTD.remove())
  }

  headings.forEach(value => createLine(tr, value, true))

  // Build the table

  thead.append(tr)
  table.append(thead)
  table.append(tbody)

  return table
}