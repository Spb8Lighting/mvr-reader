export const xyY2RGB = string => {
  return cie2hex(getCieFromString(string))
}

const defaultCie = {
  fx: 0.3127,
  fy: 0.3290,
  f_Y: 100.0
}

const getCieFromString = string => {
  let parts = string.split(',')
  parts = parts.map(part => { return Number(part.trim()) })
  if (parts.length === 3 && parts.every(part => { return !isNaN(part) && part > 0 })) {
    return { fx: parts[0], fy: parts[1], f_Y: parts[2] }
  }
  else {
    return defaultCie
  }
}

const rgb2hex = rgb => {
  const hex = rgb.map(x => {
    x = parseInt(x * 255, 10).toString(16)
    return (x.length === 1) ? '0' + x : x
  })
  return '#' + hex.join('')
}

const cie2hex = cie => {
  let rgb = cie2RGB(cie)
  if (rgb[0] < 0) { rgb[0] = 0 } if (rgb[0] > 1) { rgb[0] = 1 }
  if (rgb[1] < 0) { rgb[1] = 0 } if (rgb[1] > 1) { rgb[1] = 1 }
  if (rgb[2] < 0) { rgb[2] = 0 } if (rgb[2] > 1) { rgb[2] = 1 }
  return rgb2hex(rgb)
}

const cie2RGB = cie => {
  // http://www.easyrgb.com/en/math.php
  let fx = cie.fx
  let fy = cie.fy
  let Y = cie.f_Y

  if (!fx || !fy || !Y) return [0, 0, 0]

  let X = fx * (Y / fy)
  let Z = (1 - fx - fy) * (Y / fy)

  let var_X = X / 100
  let var_Y = Y / 100
  let var_Z = Z / 100

  let var_R = var_X * 3.2406 + var_Y * -1.5372 + var_Z * -0.4986
  let var_G = var_X * -0.9689 + var_Y * 1.8758 + var_Z * 0.0415
  let var_B = var_X * 0.0557 + var_Y * -0.2040 + var_Z * 1.0570

  if (var_R > 0.0031308) var_R = 1.055 * (Math.pow(var_R, (1 / 2.4))) - 0.055
  else var_R = 12.92 * var_R

  if (var_G > 0.0031308) var_G = 1.055 * (Math.pow(var_G, (1 / 2.4))) - 0.055
  else var_G = 12.92 * var_G

  if (var_B > 0.0031308) var_B = 1.055 * (Math.pow(var_B, (1 / 2.4))) - 0.055
  else var_B = 12.92 * var_B

  let r = var_R
  let g = var_G
  let b = var_B

  let rgb = []
  rgb.push(r)
  rgb.push(g)
  rgb.push(b)

  return rgb
}