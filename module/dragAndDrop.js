const dropArea = document.getElementById('dropArea')

;['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
  dropArea.addEventListener(eventName, e => {
    e.preventDefault()
    e.stopPropagation()
  }, false)
})

;['dragenter', 'dragover'].forEach(eventName => {
  dropArea.addEventListener(eventName, e => {
    dropArea.classList.add('hover')
  }, false)
})

;['dragleave', 'drop'].forEach(eventName => {
  dropArea.addEventListener(eventName, e => {
    dropArea.classList.remove('hover')
  }, false)
})

dropArea.addEventListener('drop', e => {
  const dT = new DataTransfer()
  dT.items.add(e.dataTransfer.files[0])
  unZipMVR(e.dataTransfer.files[0])
}, false)