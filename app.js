import { unzip } from 'unzip'

import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { TDSLoader } from 'three/addons/loaders/TDSLoader.js'

import { xyY2RGB } from './module/xyY2RGB.js'
import { addPrefixZeros } from './module/utilities.js'
import { createLine, createTable } from './module/table.js'
import { createNavigation } from './module/navigation.js'
import { tableSettings } from './config/table.js'
import './module/dragAndDrop.js'

//const scene = new THREE.Scene()


// Define some global values
const mvrXMLFile = new RegExp(/.*GeneralSceneDescription\.xml$/)

// Define some selectors to play with
const body = document.querySelector('body')
const header = document.querySelector('header')
const articles = document.getElementById('articles')
const articlesContent = document.getElementById('content')
const input = document.getElementById('MVR-File')
const h2 = document.querySelector('h2')
const nav = document.querySelector('nav')
const buttonCSV = document.querySelector('button.csv')
const button3D = document.querySelector('button.v3d')
const v3d = document.getElementById('v3d')

// articles.addEventListener('scroll', e => {
//   if(articles.scrollTop > 125) {
//     body.classList.add('scrolled')
//   } else {
//     body.classList.remove('scrolled')
//   }
// })

// Start to work
const fileReader = new FileReader()
let MVRDocument = false

// File infos
let tableExport = {
  content: false,
  filename: false
}
// Reset max counter
let max = {
  FixtureID: 0,
  UnitNumber: 0,
  DMXUniverse: 0,
  DMXAddress: 0,
  fullAddress: 0,
  layer: 0,
  layerFixtures: []
}

fileReader.onload = () => {
  MVRDocument = new DOMParser().parseFromString(fileReader.result, 'application/xml')
  readMVR()
}

// Unzip and send the awaiting file
const unZipMVR = async zip => {
  tableExport.filename = zip.name
  const { entries } = await unzip(zip)
  Object.entries(entries).forEach(async ([name, entry]) => {
    if (mvrXMLFile.test(name)) {
      fileReader.readAsText(await entry.blob())
    }
  })
}

const setMax = (key, value) => {
  const numStr = String(value)
  if (max[key] < numStr.length) {
    max[key] = numStr.length
  }
}

const extractRotationAndPosition = (matrix = false) => {
  if (matrix) {
    const values = matrix.match(/[-0-9.,e]+/g)
    const rotationMatrix = values.slice(0, 3).map(val => val.split(',').map(Number))
    const position = values.slice(3).map(val => val.split(',').map(Number))[0]

    const xRotation = Math.atan2(rotationMatrix[2][1], rotationMatrix[2][2]) * 180 / Math.PI
    const yRotation = Math.atan2(-rotationMatrix[2][0], Math.sqrt(rotationMatrix[2][1] * rotationMatrix[2][1] + rotationMatrix[2][2] * rotationMatrix[2][2])) * 180 / Math.PI
    const zRotation = Math.atan2(rotationMatrix[1][0], rotationMatrix[0][0]) * 180 / Math.PI

    const positionObj = {
      x: position[0].toFixed(1),
      y: position[1].toFixed(1),
      z: position[2].toFixed(1)
    }

    return { rotation: { x: xRotation.toFixed(1), y: yRotation.toFixed(1), z: zRotation.toFixed(1) }, position: positionObj }
  } else {
    return { rotation: { x: 0, y: 0, z: 0 }, position: { x: 0, y: 0, z: 0 } }
  }
}

const v3dSettings = {
  width: 0,
  height: 0,
  ratio: 0
}

const Updatev3dSettings = () => {
  v3dSettings.width = window.innerWidth
  v3dSettings.height = window.innerHeight - header.offsetHeight
  v3dSettings.ratio = v3dSettings.width / v3dSettings.height
}

const read3DMVR = () => {
  Updatev3dSettings()
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(60, v3dSettings.ratio, 0.1, 5000)

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
  })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(v3dSettings.width, v3dSettings.height)

  const light = new THREE.AmbientLight(0xFFFFFF, 1)
  scene.add(light)

  const controls = new OrbitControls(camera, renderer.domElement)

  v3d.appendChild(renderer.domElement)

  const layers = MVRDocument.querySelectorAll('Layer')

  const extPos = { min: { x: 0, y: 0, z: 0 }, max: { x: 0, y: 0, z: 0 } }

  const setExt = (key, value) => {
    if (extPos.max[key] < value) {
      extPos.max[key] = +value
    } else if (extPos.min[key] > value) {
      extPos.min[key] = +value
    }
  }

  const fixtureGroup = new THREE.Group()
  layers.forEach(layer => {
    let fixtures = layer.querySelectorAll('Fixture')

    const group = new THREE.Group()

    fixtures.forEach(fixture => {
      const matrix = fixture.querySelector('Matrix')
      const transformation = extractRotationAndPosition(matrix ? matrix.innerHTML : false)

      const position = transformation.position
      Object.keys(position).forEach(key => {
        setExt(key, position[key])
      })

      const fixtureColor = fixture.querySelector('Color') ? xyY2RGB(fixture.querySelector('Color').innerHTML) : '#00FF00'

      const geometry = new THREE.BoxGeometry(2, 2, 2)
      const material = new THREE.MeshStandardMaterial({ color: parseInt(fixtureColor.replace('#', '0x'), 16) })
      const cube = new THREE.Mesh(geometry, material)

      cube.position.set(position.x / 100, position.y / 100, position.z / 100)
      cube.rotation.set(THREE.MathUtils.degToRad(transformation.rotation.x), THREE.MathUtils.degToRad(transformation.rotation.y), THREE.MathUtils.degToRad(transformation.rotation.z))

      group.add(cube)
    })
    fixtureGroup.add(group)
  })

  scene.add(fixtureGroup)

  camera.lookAt(fixtureGroup.position)

  camera.position.set((extPos.max.x + extPos.min.x) / 200, (extPos.max.y + extPos.min.y) / 200, (extPos.max.z + extPos.min.z) / 200 + 10)
  //camera.rotation.z = THREE.MathUtils.degToRad(-45)

  const animate = () => {
    requestAnimationFrame(animate)
    renderer.render(scene, camera)
  }

  const resize = () => {
    Updatev3dSettings()
    camera.aspect = v3dSettings.ratio
    camera.updateProjectionMatrix()

    renderer.setSize(v3dSettings.width, v3dSettings.height)
  }
  window.addEventListener('resize', resize)

  animate()

  v3d.classList.add('v3dIsLoaded')
}

const readMVR = () => {

  h2.innerHTML = `<img height="96" src="./favicon.svg" />
  <span>
    <span><br /></span>
  ${tableExport.filename}</span>`

  // Display software version used for export
  if (MVRDocument.querySelector('UserData')) {
    const UserData = MVRDocument.querySelector('UserData')
    // If not empty
    if (UserData.querySelector('Data')) {
      const Data = UserData.querySelector('Data')
      const h2Span = h2.querySelector('span>span')
      h2Span.innerHTML = `${Data.getAttribute('provider')} <em>v${Data.getAttribute('ver')}<em><br />`
    }
  }

  h2.style.display = 'block'

  const layers = MVRDocument.querySelectorAll('Layer')
  // First compute max length
  layers.forEach(layer => {
    const layerName = layer.getAttribute('name')
    const layerUUID = layer.getAttribute('uuid')
    let fixtures = layer.querySelectorAll('Fixture')
    fixtures.forEach(fixture => {
      // Compute abmout of fixture per layer
      if (!max.layerFixtures[layerUUID]) {
        max.layerFixtures[layerUUID] = {
          fixtures: 1,
          name: layerName
        }
      } else {
        max.layerFixtures[layerUUID].fixtures++
      }
      setMax('FixtureID', fixture.querySelector('FixtureID').innerHTML)
      setMax('UnitNumber', fixture.querySelector('UnitNumber').innerHTML)

      // If no address, set something
      let address = {
        full: 0,
        universe: '-',
        address: '-'
      }
      if (fixture.querySelector('Address')) {
        address.full = parseInt(fixture.querySelector('Address').innerHTML)
        address.universe = Math.floor(address.full / 512) + 1
        address.address = address.full - ((address.universe - 1) * 512)
      }

      setMax('fullAddress', address.full)
      setMax('DMXUniverse', address.universe)
      setMax('DMXAddress', address.address)

      fixture.setAttribute('DMXFullAddress', address.full)
      fixture.setAttribute('DMXUniverse', address.universe)
      fixture.setAttribute('DMXAddress', address.address)
    })
    if (max.layerFixtures[layerUUID]) {
      setMax('layer', max.layer++)
    }
  })

  nav.style.display = 'block'

  const globalTbody = document.createElement('tbody')

  // Now do the work
  layers.forEach(layer => {
    // Display only layer with fixtures
    const layerName = layer.getAttribute('name')
    const layerUUID = layer.getAttribute('uuid')
    if (max.layerFixtures[layerUUID] && max.layerFixtures[layerUUID].fixtures > 0) {
      let fixtures = layer.querySelectorAll('Fixture')
      const tbody = document.createElement('tbody')
      fixtures.forEach(fixture => {
        const matrix = fixture.querySelector('Matrix')
        const transformation = extractRotationAndPosition(matrix ? matrix.innerHTML : false)
        const tr = document.createElement('tr')

        const fixtureColor = fixture.querySelector('Color') ? xyY2RGB(fixture.querySelector('Color').innerHTML) : false

        let fixtureNameDisplay = fixture.getAttribute('name')
        if (fixtureColor) {
          fixtureNameDisplay = `<span class="fixtureColor" style="background-color: ${fixtureColor}"></span> ${fixtureNameDisplay}`
        }

        const GDTFSpec = fixture.querySelector('GDTFSpec').innerHTML

        createLine(tr, layerName)
        createLine(tr, GDTFSpec.split('@')[0])
        createLine(tr, fixtureNameDisplay)
        createLine(tr, GDTFSpec)
        createLine(tr, fixture.querySelector('GDTFMode').innerHTML)
        createLine(tr, addPrefixZeros(fixture.querySelector('FixtureID').innerHTML, max.FixtureID))
        createLine(tr, addPrefixZeros(fixture.querySelector('UnitNumber').innerHTML, max.FixtureID))
        createLine(tr, `X: ${transformation.rotation.x}°<br />Y: ${transformation.rotation.y}°<br />Z: ${transformation.rotation.z}°`)
        createLine(tr, `X: ${transformation.position.x}<br />Y: ${transformation.position.y}<br />Z: ${transformation.position.z}`)
        createLine(tr, addPrefixZeros(fixture.getAttribute('DMXFullAddress'), max.fullAddress))
        createLine(tr, addPrefixZeros(fixture.getAttribute('DMXUniverse'), max.DMXUniverse))
        createLine(tr, addPrefixZeros(fixture.getAttribute('DMXAddress'), max.DMXAddress))

        if (max.layer > 1) {
          globalTbody.append(tr.cloneNode(true))
        }

        tbody.append(tr)
      })
      const tableID = `table-${layerUUID}`
      articlesContent.append(createTable(tbody, tableID))
      if (!tableExport.content) {
        tableExport.content = new simpleDatatables.DataTable(`#${tableID}`, tableSettings.fixture.withoutLayer.settings)
      } else {
        new simpleDatatables.DataTable(`#${tableID}`, tableSettings.fixture.withoutLayer.settings)
      }
    }
  })
  // If only 1 layer, don't create the All Layers view, and delete the original button
  if (max.layer > 1) {
    const globalTableID = `table-All`
    articlesContent.prepend(createTable(globalTbody, globalTableID, true))
    tableExport.content = new simpleDatatables.DataTable(`#${globalTableID}`, tableSettings.fixture.withLayer.settings)
  } else {
    const firstButton = nav.querySelector('button:first-child')
    firstButton.remove()
  }

  createNavigation(nav, articles, max.layerFixtures)

  buttonCSV.addEventListener('click', () => {
    simpleDatatables.exportCSV(tableExport.content, {
      download: true,
      lineDelimiter: "\n",
      columnDelimiter: ";",
      filename: tableExport.filename
    })
  })

  button3D.addEventListener('click', () => {
    if (v3d.style.display === 'block') {
      v3d.style.display = 'none'
      nav.style.display = 'block'
      articlesContent.style.display = 'block'
    } else {
      if (!v3d.classList.contains('v3dIsLoaded')) {
        read3DMVR()
      }
      v3d.style.display = 'block'
      nav.style.display = 'none'
      articlesContent.style.display = 'none'
    }
  })

  // Hide useless stuff
  body.classList.add('loaded')
  buttonCSV.style.display = 'block'
  button3D.style.display = 'block'
}

//Listen to source change and do the job
input.addEventListener('change', e => {
  unZipMVR(e.target.files[0])
})

window.addEventListener('load', () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js')
  }
})