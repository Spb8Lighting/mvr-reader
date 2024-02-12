const createNavButton = buttonAttr => {
  const button = document.createElement('button')
  button.classList.add('w3-button', 'w3-bar-item')
  button.setAttribute('data-target', `table-${buttonAttr.id}`)
  button.innerHTML = `${buttonAttr.name.trim()} <em>(${buttonAttr.fixtures})</em>`
  return button
}

const sortByName = obj => {
  const entries = Object.entries(obj)
  return entries.sort((a, b) => {
      var nameA = a[1].name.toLowerCase()
      var nameB = b[1].name.toLowerCase()
      if (nameA < nameB) {
          return -1
      }
      if (nameA > nameB) {
          return 1
      }
      return 0
  }).reduce((sorted, [key, value]) => {
      sorted[key] = value
      return sorted
  }, {})
}

export const createNavigation = (nav, articles, layerFixtures) => {
  // Sort button and create them
  const sortedButtons = sortByName(layerFixtures)
  Object.entries(sortedButtons).forEach(button => {
    nav.append(createNavButton({ id: button[0], name: button[1].name, fixtures: button[1].fixtures }))
  })

  const buttons = nav.querySelectorAll('button')
  const divLayers = articles.querySelectorAll('#content>div')
  if (buttons.length > 1) {
    buttons.forEach(button => {
      button.addEventListener('click', event => {
        const target = event.currentTarget
        const targetID = target.dataset.target
        // Show the right layer
        divLayers.forEach(divLayer => {
          const table = divLayer.querySelector('table')
          if (table) {
            if (table.id !== targetID) {
              divLayer.style.display = 'none'
            } else {
              divLayer.style.display = 'block'
            }
          }
        })
        // Set button as active
        buttons.forEach(otherButton => {
          if (otherButton.dataset.target !== targetID) {
            otherButton.classList.remove('w3-blue')
          } else {
            otherButton.classList.add('w3-blue')
          }
        })
        return false
      })
    })
  } else {
    buttons[0].classList.add('w3-blue')
  }
}
